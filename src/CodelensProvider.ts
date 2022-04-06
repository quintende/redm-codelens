import * as vscode from 'vscode';
import { Range, window } from 'vscode';
import CollapsedNativeMethodCodeLens from './codelens/CollapsedNativeMethodCodeLens';
import ExpandedNativeMethodCodeLens from './codelens/ExpandedNativeMethodCodeLens';
import NativeDocumentationCodeLens from './codelens/NativeDocumentationCodeLens';
import SimpleTextCodeLens from './codelens/SimpleTextCodeLens';
import { EVENT, NativeMethodsRepository } from './NativeMethodsRepository';
import CodeLens from './codelens/AbstractNativeMethodCodeLens';

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

    public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {

        //console.log('outs : creating provider for ', document.languageId);
        const visibleRanges: readonly Range[] | undefined = window?.activeTextEditor?.visibleRanges;

        if (vscode.workspace.getConfiguration("redm-codelens").get("enableCodeLens", true)) {
            //console.log('creating provider for ', document.languageId);
            this.codeLenses = [];
            // @ts-ignore
            const regex = new RegExp(this.nativeInvokers[document.languageId]);
            const text = document.getText();
            const matches: any = [...text.matchAll(regex)];
            let previousLine = (() => {
                let line: number = -1;

                return {
                    get: () => line,
                    set: (l: number) => line = l
                }
            })();
            
            // add guards
            for (const match of matches) {
                //console.log('MATCH', match);

                if (match) { //while (() !== null) {
                    const line: any = document.lineAt(document.positionAt(match.index).line);
                    const hash = match[1].replace(/['"`]+/g, '');
                    const identifier = kebabCase(`${line._line}-${line._text}`);
                    const showPrefix = line.lineNumber === previousLine.get(); 
                    
                    previousLine.set(line.lineNumber);
                    
                    const position = new vscode.Position(
                        line.lineNumber, 
                        line.text.indexOf(match[0])
                    );
                    const range = document.getWordRangeAtPosition(position, regex);
                    
                    if (!range || !visibleRanges)  continue;

                    const isRangeVisible = true; // is broken -> visibleRanges.some((visibleRange: Range) => visibleRange.contains(range));
                    const performanceMode = true;

                    this.codeLenses.push(
                        new NativeDocumentationCodeLens(range, hash)
                    );

                    if (!isRangeVisible && performanceMode) {
                        this.codeLenses.push(
                            new SimpleTextCodeLens(range, "...")
                        );
    
                        continue;
                    }

                    const codeLensType = expandedCodeLenses.some(id => id === identifier)
                                            ? CODELENS_TYPE.EXPANDED
                                            : CODELENS_TYPE.COLLAPSED;
                    
                    const nativeMethodCodeLens = (() => {
                        switch (codeLensType) {
                            case CODELENS_TYPE.EXPANDED:
                                return new ExpandedNativeMethodCodeLens(
                                    range, hash, identifier, showPrefix, proxy(this._onDidChangeCodeLenses.fire)
                                );                        
                            case CODELENS_TYPE.COLLAPSED:
                                return new CollapsedNativeMethodCodeLens(
                                    range, hash, identifier, showPrefix, proxy(this._onDidChangeCodeLenses.fire)
                                );     
                        }
                    })();

                    this.codeLenses.push(
                        nativeMethodCodeLens
                    );
                }
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