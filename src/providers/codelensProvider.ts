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
import { escapeHash, generateIdentifier, kebabCase } from '../util/helpers';
import NativeMethodCodeLens from '../codelens/nativeMethodCodeLens/nativeMethodCodeLens';
import { invokers } from '../util/data';

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

type _NativeMethodCodeLens = 
    | AbstractCodeLens 
    | NativeDocumentationCodeLens 
    | ExpandedNativeMethodCodeLens 
    | CollapsedNativeMethodCodeLens
    | SimpleTextCodeLens;

type NativeRegexMatch = [matches: RegExpMatchArray[], regex: RegExp];

export class CodelensProvider implements CodeLensProvider {
    private codeLenses: _NativeMethodCodeLens[] = [];
    private nativeInvokers: NativeInvokers = invokers;
    private nativeMethodsRepository: NativeMethodsRepository;
    private nativeMethodsCodeLensFactory: NativeMethodCodeLensFactory = new NativeMethodCodeLensFactory();
    
    public eventEmitter: EventEmitter<any> = new EventEmitter<any>();
    public fireChangeCodeLenses: (data: any) => void = this.eventEmitter.fire;
    public readonly onDidChangeCodeLenses: Event<any> = this.eventEmitter.event;
    public codeLensContext: CodeLensContext;

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
        
        this.codeLensContext = new CodeLensContext();

        this.nativeMethodsCodeLensFactory.addProvider(this);
        this.nativeMethodsRepository.onFetchSuccessful(this.fireChangeCodeLenses);
        
        window.onDidChangeTextEditorVisibleRanges(this.fireChangeCodeLenses);
        workspace.onDidChangeConfiguration(this.fireChangeCodeLenses);
    }

    private isRenderBlocked() {
        return ConfigurationManager.assertConfig('native.renderCodelens', false);
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

    private provideDocumentationCodeLens(range: Range, context: LineContextItem, doesLineAlreadyHaveCodeLens: boolean, isAction: boolean) {
        const { hash } = context;
        
        if (doesLineAlreadyHaveCodeLens) {
            this.findAndUpdatePreviousCodeLens(
                [ NativeDocumentationCodeLens ],
                context
            );

            return;
        }

        this.codeLenses.push(
            new NativeDocumentationCodeLens(range, hash)
        );
    }

    private provideNativeMethodCodeLens(range: Range, context: LineContextItem, showPrefix: boolean) { // isExpanded: boolean
        const { identifier, hash } = context;
        const codeLens = this.nativeMethodsCodeLensFactory
                                .addProvider(this)
                                .addParams(range, hash, identifier, showPrefix)
                                .create();

        // Show `0x4FA.. ~` prefix
        if (showPrefix) {
            this.findAndUpdatePreviousCodeLens(
                [ NativeMethodCodeLens ],
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
        this.codeLensContext.resetAll();
        
        if (this.isRenderBlocked()) {
            return this.codeLenses;
        }

        const visibleRanges: readonly Range[] | undefined = window?.activeTextEditor?.visibleRanges;
        const [ matches, regex ] = this.getNativeMethodsFromDocument(document);

        for (const match of matches) {
            const [ result, ... matchGroups ] = match;
            const [ firstMatch, secondMatch ] = matchGroups;

            //const hash = firstMatch.includes('0x') ? firstMatch : secondMatch;
            const hash = firstMatch && secondMatch ? secondMatch : firstMatch;

            const line: TextLine = document.lineAt(document.positionAt(match.index as number).line);
            const filteredHash: string = escapeHash(hash);
            const identifier = generateIdentifier(document, match, filteredHash);
            const iterationContext: LineContextItem = {
                hash: filteredHash, identifier
            };

            this.codeLensContext.updateCurrentLine(line, filteredHash);

            const lineState = this.codeLensContext.getLineState(line);
            const isAction = false;

            const position = new Position(
                line.lineNumber,
                line.text.indexOf(result)
            );
            const range = document.getWordRangeAtPosition(position, regex);
            
            if (!range || !visibleRanges) continue;

            this.provideDocumentationCodeLens(range, iterationContext, lineState.showPrefix, isAction);
            this.provideNativeMethodCodeLens(range, iterationContext, lineState.showPrefix);
        }

        return this.codeLenses;
    }

    private getHashesAtLCodeLensLine({ range }: CodeLens) {
        const { hashes } =  this.codeLensContext.getLineState(range.start.line);

        return hashes;
    }

    public resolveCodeLens(codeLens: RealNativeMethodCodeLens) {
        if (this.isRenderBlocked()) {
            return codeLens;
        }

        //const hash = codeLens.getHash();
        const hashes = this.getHashesAtLCodeLensLine(codeLens);
        const identifier = codeLens.getIdentifier();
        const nativeMethodData = hashes.map(({ hash }: any) => this.nativeMethodsRepository.get(hash));
        const runtimeData = this.codeLensContext.getCodeLensState(identifier);
        
        codeLens.resolve(nativeMethodData, runtimeData);
            
        return codeLens;
    }
}