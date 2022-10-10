import * as vscode from 'vscode';
import { CancellationToken, CodeLens, CodeLensProvider, Event, EventEmitter, ExtensionContext, Position, Range, TextDocument, TextLine, window, workspace } from 'vscode';
import CollapsedNativeMethodCodeLens from '../codelens/nativeMethodCodeLens/collapsedNativeMethodCodeLens';
import ExpandedNativeMethodCodeLens from '../codelens/nativeMethodCodeLens/expandedNativeMethodCodeLens';
import NativeDocumentationCodeLens from '../codelens/nativeDocumentationCodeLens';
import SimpleTextCodeLens from '../codelens/simpleTextCodeLens';
import { EVENT, NativeMethodsRepository } from '../util/nativeMethodsRepository';
import AbstractCodeLens from '../codelens/nativeMethodCodeLens/abstractNativeMethodCodeLens';
import AbstractNativeMethodCodeLens from '../codelens/nativeMethodCodeLens/abstractNativeMethodCodeLens';
import CodeLensContext, { LineContextItem } from '../codelens/util/codeLensContext';
import NativeMethodCodeLensFactory from '../codelens/util/nativeCodeLensFactory';
import ConfigurationManager from '../config/configurationManager';
import { escapeHash, invokers, kebabCase } from '../util/helpers';

/**
 * CodelensProvider
 */

// lua, c, csharp, typescript, javascript
interface NativeInvokers {
    [key: string]: RegExp;
}

type RealNativeMethodCodeLens = 
    | AbstractCodeLens 
    | ExpandedNativeMethodCodeLens 
    | CollapsedNativeMethodCodeLens;

type NativeMethodCodeLens = 
    | AbstractCodeLens 
    | NativeDocumentationCodeLens 
    | ExpandedNativeMethodCodeLens 
    | CollapsedNativeMethodCodeLens
    | SimpleTextCodeLens;

type NativeRegexMatch = [matches: RegExpMatchArray[], regex: RegExp];

export class CodelensProvider implements CodeLensProvider {
    private codeLenses: NativeMethodCodeLens[] = [];
    private nativeInvokers: NativeInvokers = invokers;
    private nativeMethodsRepository: NativeMethodsRepository;
    private nativeMethodsCodeLensFactory: NativeMethodCodeLensFactory = new NativeMethodCodeLensFactory();
    
    public eventEmitter: EventEmitter<any> = new EventEmitter<any>();
    public fireChangeCodeLenses: (data: any) => void = this.eventEmitter.fire;
    public readonly onDidChangeCodeLenses: Event<any> = this.eventEmitter.event;

    constructor(context: ExtensionContext) {
        this.nativeMethodsRepository = new NativeMethodsRepository(context, {
            onSuccess: ({ showInformationMessage }: any) => 
                showInformationMessage( "Native methods fetched successfully."),
            onFallback: ({ showWarningMessage }: any, date: string) => 
                showWarningMessage( `Failed to fetch updated native methods. Will use fallback to natives from ${date}.` ),
            onUpdated: ({ showInformationMessage }: any) => 
                showInformationMessage( "Native methods updated successfully."),
            onFail: ({ showErrorMessage }: any) => 
                showErrorMessage( "Failed to fetch native methods." ),
        });
        
        this.nativeMethodsCodeLensFactory.addProvider(this);
        this.nativeMethodsRepository.onFetchSuccessful(this.fireChangeCodeLenses);
        
        window.onDidChangeTextEditorVisibleRanges(this.fireChangeCodeLenses);
        workspace.onDidChangeConfiguration(this.fireChangeCodeLenses);
    }

    private isRenderBlocked() {
        return ConfigurationManager.getConfig('enabled', false) || ConfigurationManager.getRuntimeConfig('renderCodeLens', false);
    }

    private findAndUpdatePreviousCodeLens<T extends { update: Function }>(CodeLenses: any[], context: any) {
        for (let i = this.codeLenses.length - 1; i >= 0; i--) {
            const codeLens: T = this.codeLenses[i] as any;
            const isInstance = CodeLenses.some(CodeLens => CodeLens.isInstance(codeLens));

            if (isInstance) {
                codeLens.update(context);

                break;
            }
        }
    }

    private provideDocumentationCodeLens(range: Range, hash: string, context: any, doesLineAlreadyHaveCodeLens: boolean) {
        if (doesLineAlreadyHaveCodeLens) {
            this.findAndUpdatePreviousCodeLens<NativeDocumentationCodeLens>(
                [ NativeDocumentationCodeLens ],
                context
            );

            return;
        }

        this.codeLenses.push(
            new NativeDocumentationCodeLens(range, hash)
        );
    }

    private provideSkeletonCodeLens(range: Range) {
        this.codeLenses.push(
            new SimpleTextCodeLens(range, "...")
        );
    }

    private provideNativeMethodCodeLens(range: Range, hash: string, identifier: string, showPrefix: boolean) {

        const codeLens = this.nativeMethodsCodeLensFactory
                                .addProvider(this)
                                .addParams(range, hash, identifier, showPrefix)    
                                .create();

        // Show `0x4FA.. ~` prefix
        if (showPrefix) {
            this.findAndUpdatePreviousCodeLens(
                [ CollapsedNativeMethodCodeLens, ExpandedNativeMethodCodeLens ],
                { showPrefix: true }
            );
        }

        if (codeLens) {
            this.codeLenses.push(codeLens);
        }
    }

    private getNativeMethodsFromDocument({ languageId, getText }: TextDocument): NativeRegexMatch {
        const text: string = getText();
        const regex: RegExp = new RegExp(
            this.nativeInvokers[languageId]
        );
        
        return [
            [...text.matchAll(regex)],
            regex
        ];
    }

    public provideCodeLenses(document: TextDocument): CodeLens[] | Thenable<CodeLens[]> {
        this.codeLenses = [];
        
        if (this.isRenderBlocked()) {
            return this.codeLenses;
        }

        const visibleRanges: readonly Range[] | undefined = window?.activeTextEditor?.visibleRanges;
        const codeLensContext: CodeLensContext = new CodeLensContext();
        const [ matches, regex ] = this.getNativeMethodsFromDocument(document);

        for (const match of matches) {
            const [ result, ... matchGroups ] = match;
            const [ firstMatch, secondMatch ] = matchGroups;

            const hash = firstMatch.includes('0x') ? firstMatch : secondMatch;

            const line: TextLine = document.lineAt(document.positionAt(match.index as number).line);
            const filteredHash: string = escapeHash(hash);
            // identifier -> generate hash based on native and params + number.
            // That should be unique for 99% of the cases.
            // If a line changes (changes params) check on line and hash
            // If a line is moved check for closest matching hash.
            const identifier: string = kebabCase(`${line.lineNumber}-${line.text}-${match.index}`);
            const iterationContext: LineContextItem = {
                hash: filteredHash, identifier
            };
            
            const showPrefix: boolean = codeLensContext.doesCurrentLineEqualTo(line);
            const context = codeLensContext.updateCurrentLine(line, iterationContext);
            
            const position = new Position(
                line.lineNumber,
                line.text.indexOf(result)
            );
            const range = document.getWordRangeAtPosition(position, regex);
            
            if (!range || !visibleRanges) continue;

            this.provideDocumentationCodeLens(range, filteredHash, context, showPrefix); // TODO why context here
            this.provideNativeMethodCodeLens(range, filteredHash, identifier, showPrefix); // TODO why identifier here
        }

        return this.codeLenses;
    }

    public resolveCodeLens(codeLens: RealNativeMethodCodeLens, token: CancellationToken) {
        if (this.isRenderBlocked()) {
            return codeLens; // TODO: what does token do?
        }

        const hash = codeLens.getHash();
        const data = this.nativeMethodsRepository.get(hash);
        codeLens.resolve(data);
            
        return codeLens;
    }
}