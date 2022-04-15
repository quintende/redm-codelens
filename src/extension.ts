import {
    ExtensionContext,
    env,
    Uri,
    languages,
    workspace,
    window,
    DocumentSelector,
    CodeLensProvider,
    TextEditor,
    TextEditorEdit, 
    CodeLens
} from 'vscode';
import CommandBuilder, { COMMAND, COMMAND_TYPE } from './commands/commandBuilder';
import { EVENT, NativeMethod, NativeMethodsRepository } from './util/nativeMethodsRepository';
import { CodelensProvider, expandedCodeLenses } from './providers/codelensProvider';
import { compatibleFilesSelector } from './selectors/nativesSelectors';
import AbstractNativeMethodCodeLens from './codelens/nativeMethodCodeLens/abstractNativeMethodCodeLens';

export function activate(context: ExtensionContext) {

    const nativeMethodsRepository = new NativeMethodsRepository(context);

    nativeMethodsRepository
        .on(EVENT.NATIVES_FETCH_FAILED,
            () => { window.showErrorMessage( "Failed to fetch native methods." ); })
        .on(EVENT.NATIVES_FETCH_FALLBACK,
            (date: string) => { window.showWarningMessage( `Failed to fetch updated native methods. Will use fallback to natives from ${date}.` ); })
        .on(EVENT.NATIVES_FETCH_SUCCESS,
            () => { window.showInformationMessage( "Native methods fetched successfully." ); })
        .on(EVENT.NATIVES_FETCH_UPDATED,
            () => { window.showInformationMessage( "Native methods updated successfully." ); });

    const commandBuilder: CommandBuilder = new CommandBuilder();

    const codelensProvider: CodeLensProvider = new CodelensProvider();
    const codelensSelector: DocumentSelector = compatibleFilesSelector;

    languages.registerCodeLensProvider(codelensSelector, codelensProvider);
    
    commandBuilder.registerCommand(
        COMMAND.ENABLE,
        (namespace: string, config: string) => {
            workspace.getConfiguration(namespace).update(config, true, true);
        }
    );

    commandBuilder.registerCommand(
        COMMAND.DISABLE,
        (namespace: string, config: string) => {
            workspace.getConfiguration(namespace).update(config, false, true);
        }
    );

    commandBuilder.registerCommand(
        COMMAND.OPEN_DOCUMENTATION,
        async (showMultipleMethods: boolean, nativeMethods: NativeMethod[]) => {
            // `${searchQuery}${hash}`

            const useDefaultUrl = true;
            const selectNativeMethod = (showMultipleMethods) 
                ? await window.showQuickPick(
                    nativeMethods.map((nativeMethod: NativeMethod) => {
                        //const url = `${searchQuery}${hash}`;
                        const { name, hash } = nativeMethod;

                        return {
                            label: name, detail: hash, hash: hash, result: nativeMethod
                        };
                    }),
                    { title: 'Select a Native Method' }
                )
                : { result: nativeMethods[0] };

            if (!selectNativeMethod) {return;}

            const { name, hash } = selectNativeMethod.result;
            
            if (!showMultipleMethods) {
                env.openExternal(Uri.parse('https://vespura.com/doc/natives/?_' + hash));
                return;
            }


            const target = await window.showQuickPick(
                [
                    { label: 'Vespura', detail: name, description: hash, url: 'https://vespura.com/doc/natives/?_' + hash },
                    { label: 'Alloc8or', detail: name, description: hash, url: 'https://alloc8or.re/rdr3/nativedb/?n=' + hash },
                    { label: 'RDR2MODS',  detail: name,description: hash,  url: 'https://www.rdr2mods.com/nativedb/search/?s=' + hash },
                ],
                { title: 'Select which documentation page you want to open' });

            if (!target) {
                return;
            }

            env.openExternal(Uri.parse(target.url));
        }
    );

    const toggleNativeMethodCodeLens = async (
        identifier: string, codeLens: AbstractNativeMethodCodeLens, isLongNativeMethod: boolean
    ) => {   
        if (isLongNativeMethod) {
            expandedCodeLenses.delete(identifier);

            return;
        }
        
        expandedCodeLenses.set(identifier, codeLens);
    };

    commandBuilder.registerCommand(
        {
            identifier: COMMAND.SHOW_EXPANDED_NATIVE_METHOD_CODE_LENS,
            type: COMMAND_TYPE.TEXT_EDITOR,
        },
        async (
            textEditor: TextEditor, edit: TextEditorEdit, 
            codeLens: AbstractNativeMethodCodeLens, identifier: string, triggerProviderCompute: Function
        ) => {   
            toggleNativeMethodCodeLens(identifier, codeLens, false);
            triggerProviderCompute();
        }
    );


    commandBuilder.registerCommand(
        {
            identifier: COMMAND.SHOW_COLLAPSED_NATIVE_METHOD_CODE_LENS,
            type: COMMAND_TYPE.TEXT_EDITOR,
        },
        async (
            textEditor: TextEditor, edit: TextEditorEdit, 
            codeLens: AbstractNativeMethodCodeLens, identifier: string, triggerProviderCompute: Function
        ) => {   
            toggleNativeMethodCodeLens(identifier, codeLens, true);
            triggerProviderCompute();
        }
    );

    const disposables = commandBuilder.getDisposables();

    for(const disposable of disposables) {
        context.subscriptions.push(disposable);
    }
}

// this method is called when your extension is deactivated
export function deactivate() {}
