import * as vscode from 'vscode';
import { CodeLensProvider, EventEmitter, Position, Range, TextLine, window, workspace } from 'vscode';
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

/**
 * CodelensProvider
 */

// Move
export const snakeToPascalCase = (string: string) => string
    .toLowerCase()
    .replace(
        /_(\w)/g,
        ($, $1) => $1.toUpperCase()
    );

// Move
export const kebabCase = (string: string) => string
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

interface NativeInvokers {
    lua: RegExp;
    c: RegExp;
    csharp: RegExp;
    typescript: RegExp;
    javascript: RegExp;
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

type Language = 'lua' | 'csharp' | 'typescript' | 'javascript';
type NativeRegexMatch = [matches: RegExpMatchArray[], regex: RegExp];

const escapeHash = (hash: string) => hash.replace(/[_'"`]+/g, '');
export class CodelensProvider implements CodeLensProvider {

    private codeLenses: NativeMethodCodeLens[] = [];
    private nativeInvokers: NativeInvokers;
    private _onDidChangeCodeLenses: vscode.EventEmitter<any> = new EventEmitter<any>();

    public nativeMethodsRepository: NativeMethodsRepository;
    public nativeMethodsCodeLensFactory: NativeMethodCodeLensFactory;
    public readonly onDidChangeCodeLenses: vscode.Event<any> = this._onDidChangeCodeLenses.event;

    constructor() {
        // Move
        this.nativeInvokers = {
            lua: /Citizen\.InvokeNative\((.*?)[,)]/g,
            c: /::(_0x.*?)\(/g,
            csharp: /Function\.Call<?(.*?)>?\(\(Hash\)(.*?)[,)]/g,
            javascript: /Citizen\.invokeNative\((.*?)[,)]/g,
            typescript: /Citizen\.invokeNative<?(.*?)>?\((.*?)[,)]/g
        };

        this.nativeMethodsRepository = new NativeMethodsRepository();
        this.nativeMethodsCodeLensFactory = new NativeMethodCodeLensFactory().addProvider(this);

        this.nativeMethodsRepository.onFetchSuccessful(this._onDidChangeCodeLenses.fire);
        
        window.onDidChangeTextEditorVisibleRanges(this._onDidChangeCodeLenses.fire);
        workspace.onDidChangeConfiguration(this._onDidChangeCodeLenses.fire);
    }

    /**
     * It finds the last code lens of a given type and updates it
     * @param {any[]} CodeLenses - An array of CodeLens classes.
     * @param {any} context - The context object that is passed to the `provideCodeLenses` function.
     */
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

    /**
     * If the line does not include a code lens, create a new code lens and add it to the list of code
     * lenses
     * @param {Range} range - The range of the code lens.
     * @param {string} hash - The hash of the documentation.
     * @param {any} context - This is the context of the current line.
     * @param {boolean} doesLineAlreadyHaveCodeLens - This is a boolean that tells us if the line we're
     * currently on has a code lens.
     * @returns The code lens is being returned.
     */
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

    /**
     * It creates a new code lens and adds it to the list of code lenses
     * @param {Range} range - The range of the code lens.
     */
    private provideSkeletonCodeLens(range: Range) {
        this.codeLenses.push(
            new SimpleTextCodeLens(range, "...")
        );
    }

    /**
     * > It creates a new code lens, and if it's the first code lens in the file, it updates the previous
     * code lens to show the prefix
     * @param {Range} range - Range - the range of the code lens
     * @param {string} hash - The hash of the method.
     * @param {string} identifier - The name of the method
     * @param {boolean} showPrefix - boolean - if true, the code lens will show the prefix "Native"
     */
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

    private getNativeMethodsFromDocument({ languageId, getText }: vscode.TextDocument): NativeRegexMatch {
        const text: string = getText();
        const regex: RegExp = new RegExp(
            this.nativeInvokers[languageId as Language]
        );
        
        return [
            [...text.matchAll(regex)],
            regex
        ];
    }

    /**
     * > It takes a document, finds all the native invokers in it, and creates a code lens for each one
     * @param document - vscode.TextDocument
     * @returns An array of CodeLenses.
     */
    public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        this.codeLenses = [];
        
        if (ConfigurationManager.getConfig('enabled', false)) {
            return this.codeLenses;
        }

        const visibleRanges: readonly Range[] | undefined = window?.activeTextEditor?.visibleRanges;
        const codeLensContext: CodeLensContext = new CodeLensContext();
        const [ matches, regex ] = this.getNativeMethodsFromDocument(document);

        for (const match of matches) {
            const [ result, ... matchGroups ] = match;
            const [ hash ] = matchGroups;

            const line: TextLine = document.lineAt(document.positionAt(match.index as number).line);
            const filteredHash: string = escapeHash(hash);
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

    /**
     * It takes a CodeLens object, gets the hash from it, uses the hash to get the data from the
     * nativeMethodsRepository, and then uses the data to resolve the CodeLens
     * @param codeLens - The CodeLens object that was created in the provideCodeLenses method.
     * @param token - vscode.CancellationToken
     * @returns The codeLens object is being returned.
     */
    public resolveCodeLens(codeLens: RealNativeMethodCodeLens, token: vscode.CancellationToken) {
        if (ConfigurationManager.getConfig('enabled', false)) {
            return codeLens; // TODO: what does token do?
        }

        const hash = codeLens.getHash();
        const data = this.nativeMethodsRepository.get(hash);
        codeLens.resolve(data);
            
        return codeLens;
    }
}