import * as vscode from 'vscode';
import { Range, TextLine, window } from 'vscode';
import CollapsedNativeMethodCodeLens from './codelens/CollapsedNativeMethodCodeLens';
import ExpandedNativeMethodCodeLens from './codelens/ExpandedNativeMethodCodeLens';
import NativeDocumentationCodeLens from './codelens/NativeDocumentationCodeLens';
import SimpleTextCodeLens from './codelens/SimpleTextCodeLens';
import { EVENT, NativeMethodsRepository } from './NativeMethodsRepository';
import CodeLens from './codelens/AbstractNativeMethodCodeLens';
import AbstractNativeMethodCodeLens from './codelens/AbstractNativeMethodCodeLens';
import CodeLensContext, { LineContextItem } from './codelens/CodeLensContext';

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
    csharp: RegExp;
    typescript: RegExp;
    javascript: RegExp;
}

enum CODELENS_TYPE {
    EXPANDED,
    COLLAPSED
}

const proxy = (fn: any): any => {
    console.log('Passing through proxy');
    
    return fn;
}

type Language = 'lua' | 'csharp' | 'typescript' | 'javascript';

const filterHash = (hash: string) => hash.replace(/['"`]+/g, '');

export const expandedCodeLenses: string[] = [];

export class CodelensProvider implements vscode.CodeLensProvider {

    private codeLenses: vscode.CodeLens[] = [];
    private nativeInvokers: NativeInvokers;
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public nativeMethodsRepository: NativeMethodsRepository;
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        // Move
        this.nativeInvokers = {
            lua: /Citizen\.InvokeNative\((.*?)[,)]/g,
            csharp: /Function\.Call<?(.*?)>?\(\(Hash\)(.*?)[,)]/g,
            javascript: /Citizen\.invokeNative\((.*?)[,)]/g,
            typescript: /Citizen\.invokeNative<?(.*?)>?\((.*?)[,)]/g
        };

        this.nativeMethodsRepository = new NativeMethodsRepository();

        this.nativeMethodsRepository.on(EVENT.NATIVES_FETCH_SUCCESS, proxy(this._onDidChangeCodeLenses.fire));
        vscode.window.onDidChangeTextEditorVisibleRanges(proxy(this._onDidChangeCodeLenses.fire));
        vscode.workspace.onDidChangeConfiguration(proxy(this._onDidChangeCodeLenses.fire));
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

    private provideDocumentationCodeLens(range: Range, hash: string, context: any, doesLineIncludeCodeLens: boolean) {
        if (doesLineIncludeCodeLens) {
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
        const codeLensType = expandedCodeLenses.some(id => id === identifier)
                                ? CODELENS_TYPE.EXPANDED
                                : CODELENS_TYPE.COLLAPSED;
        
        const nativeMethodCodeLens = (() => {
            switch (codeLensType) {
                case CODELENS_TYPE.EXPANDED:
                    return new ExpandedNativeMethodCodeLens(
                        range, hash, identifier, showPrefix, () => { this._onDidChangeCodeLenses.fire() }
                    );                        
                case CODELENS_TYPE.COLLAPSED:
                    return new CollapsedNativeMethodCodeLens(
                        range, hash, identifier, showPrefix, () => { this._onDidChangeCodeLenses.fire() }
                    );     
            }
        })();

        if (showPrefix) {
            this.findAndUpdatePreviousCodeLens<AbstractNativeMethodCodeLens>(
                [ CollapsedNativeMethodCodeLens, ExpandedNativeMethodCodeLens ],
                {
                    showPrefix: true
                }
            );
        }

        this.codeLenses.push(
            nativeMethodCodeLens
        );
    }

    public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {

        const visibleRanges: readonly Range[] | undefined = window?.activeTextEditor?.visibleRanges;
        const codeLensContext: CodeLensContext = new CodeLensContext();
        
        if (vscode.workspace.getConfiguration("redm-codelens").get("enableCodeLens", true)) {
            this.codeLenses = [];

            const language : Language = document.languageId as Language;
            const regex = new RegExp(this.nativeInvokers[language]);
            const text = document.getText();
            const matches: any = [...text.matchAll(regex)];
            
            for (const match of matches) {
                const [ result, ... matchGroups ] = match;
                const [ _hash ] = matchGroups;

                const line: TextLine = document.lineAt(document.positionAt(match.index).line);
                const hash: string = filterHash(_hash);
                const identifier: string = kebabCase(`${line.lineNumber}-${line.text}`);
                const iterationContext: LineContextItem = {
                    hash, identifier
                };
                
                const showPrefix: boolean = codeLensContext.currentLineEquals(line);
                const context = codeLensContext.updateCurrentLine(line, iterationContext);
                
                const position = new vscode.Position(
                    line.lineNumber,
                    line.text.indexOf(result)
                );
                const range = document.getWordRangeAtPosition(position, regex);
                
                if (!range || !visibleRanges)  continue;

                const isRangeVisible = true; // is broken -> visibleRanges.some((visibleRange: Range) => visibleRange.contains(range));
                const performanceMode = true;

                this.provideDocumentationCodeLens(range, hash, context, showPrefix);

                if (!isRangeVisible && performanceMode) {
                    this.provideSkeletonCodeLens(range);
                    continue;
                }

                this.provideNativeMethodCodeLens(range, hash, identifier, showPrefix);   
            }

            return this.codeLenses;
        }

        return [];
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {

        if (!vscode.workspace.getConfiguration("redm-codelens").get("enableCodeLens", true)) {
            return;
        }

        const hash = (codeLens as CodeLens).getHash();
        const data = this.nativeMethodsRepository.get(hash);

        (codeLens as CodeLens).resolve(data);
            
        return codeLens;
     }
}