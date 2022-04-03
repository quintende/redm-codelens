import * as vscode from 'vscode';
import { Range, window } from 'vscode';
import CollapsedNativeMethodCodeLens from './codelens/CollapsedNativeMethodCodeLens';
import ExpandedNativeMethodCodeLens from './codelens/ExpandedNativeMethodCodeLens';
import NativeDocumentationCodeLens from './codelens/NativeDocumentationCodeLens';
import SimpleTextCodeLens from './codelens/SimpleTextCodeLens';
import { NativeMethod, NativeMethodsRepository } from './NativeMethodsRepository';

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
    lua: RegExp,
    csharp: RegExp,
    typescript: RegExp
    javascript: RegExp
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
            lua: /Citizen\.InvokeNative\((.*),/g,
            csharp: /Function\.Call<?.*>?\(\(Hash\)(.*),/g,
            javascript: /Citizen\.invokeNative\((.*),/g,
            typescript: /Citizen\.invokeNative\((.*),/g
        };

        this.nativeMethodsRepository = new NativeMethodsRepository();

        
        vscode.window.onDidChangeTextEditorVisibleRanges((_) => {
            this._onDidChangeCodeLenses.fire();
        });

        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {

        //console.log('outs : creating provider for ', document.languageId);
        const visibleRanges: readonly Range[] | undefined = window?.activeTextEditor?.visibleRanges;

        if (vscode.workspace.getConfiguration("redm-codelens").get("enableCodeLens", true)) {
            //console.log('creating provider for ', document.languageId);
            this.codeLenses = [];
            // @ts-ignore
            const regex = new RegExp(this.nativeInvokers[document.languageId]);
            const text = document.getText();
            const matches: any = [...text.matchAll(regex)];

            // add guards
            for (const match of matches) {
                //console.log('MATCH', match);

                if (match) { //while (() !== null) {
                    const line: any = document.lineAt(document.positionAt(match.index).line);
                    const indexOf = line.text.indexOf(match[0]);
                    const position = new vscode.Position(line.lineNumber, indexOf);
                    const range = document.getWordRangeAtPosition(position, regex);
                    const hash = match[1].replace(/['"]+/g, '');
                    const identifier = kebabCase(`${line._line}-${line._text}`);
                    const isExpanded = expandedCodeLenses.some(id => id === identifier);

                    // console.log('visible ranges', 
                    //     visibleRanges,
                    //     visibleRanges?.some(
                    //         (visibleRange: Range) => range && visibleRange.contains(range)
                    // ));

                    if (!range || !visibleRanges)  continue;

                    if (!visibleRanges.some((visibleRange: Range) => visibleRange.contains(range))) {
                            this.codeLenses.push(
                                new NativeDocumentationCodeLens(range, hash)
                            );

                            // placeholder
                            this.codeLenses.push(
                                new SimpleTextCodeLens(range, "...")
                            );


                            continue;
                        }

                    if (range && visibleRanges
                        && visibleRanges.some(
                            (visibleRange: Range) => visibleRange.contains(range)
                        )) {
                        this.codeLenses.push(
                            new NativeDocumentationCodeLens(range, hash)
                        );

                        //console.clear();
                        console.log('huh?')
                        console.time('get native method via map');
                        const data = this.nativeMethodsRepository.get(hash);
                        console.timeEnd('get native method via map');
                        console.log(data.name);

                        if (!data) {
                            this.codeLenses.push(
                                new SimpleTextCodeLens(range, "No native method found")
                            );

                            continue;
                        }

                        this.codeLenses.push(
                            isExpanded
                                ? new ExpandedNativeMethodCodeLens(range, identifier, data, () => { this._onDidChangeCodeLenses.fire(); })
                                : new CollapsedNativeMethodCodeLens(range, identifier, data, () => { this._onDidChangeCodeLenses.fire(); })
                        );


                    }
                }
            }

            return this.codeLenses;
        }

        return [];
    }

    // public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {

    //     //console.log(expandedCodeLenses, kebabCase);


    //     if (vscode.workspace.getConfiguration("redm-codelens").get("enableCodeLens", true)) {
    //         console.log('resolving provider for ', codeLens);

    //         // codeLens.command = {
    //         //     title: "CreateObject(...) : void" + new Date().getTime(),
    //         //     //title: "CreateObject(modelHash: Hash, x: number, y: number, z: number, isNetwork: boolean, netMissionEntity: boolean, doorFlag: boolean)",
    //         //     tooltip: "Click to expand parameters",
    //         //     command: "redm-codelens.refreshCodeLens",
    //         // };

    //         // setTimeout(() => {
    //         //     //this._onDidChangeCodeLenses.fire();
    //         // });

    //         return codeLens;
    //     }
    //     return null;
    // }
}