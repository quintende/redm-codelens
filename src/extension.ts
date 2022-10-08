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
import { CodelensProvider, snakeToPascalCase } from './providers/codelensProvider';
import { compatibleFilesSelector } from './selectors/nativesSelectors';
import AbstractNativeMethodCodeLens from './codelens/nativeMethodCodeLens/abstractNativeMethodCodeLens';

export function activate(context: ExtensionContext) {

    console.log('starting extension');

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
                            label: snakeToPascalCase(name), description: hash, detail: name, hash: hash, result: nativeMethod
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
                    { label: 'Vespura', detail: 'https://vespura.com/doc/natives/', /* detail: name, description: hash, */ url: 'https://vespura.com/doc/natives/?_' + hash },
                    { label: 'Alloc8or', detail: 'https://alloc8or.re/rdr3/nativedb/', /* detail: name, description: hash, */ url: 'https://alloc8or.re/rdr3/nativedb/?n=' + hash },
                    { label: 'RDR2MODS', detail: 'https://www.rdr2mods.com/nativedb/', /* detail: name, description: hash, */  url: 'https://www.rdr2mods.com/nativedb/search/?s=' + hash },
                ],
                { title: 'Select which documentation page you want to open' });

            if (!target) {
                return;
            }

            env.openExternal(Uri.parse(target.url));
        }
    );

    commandBuilder.registerCommand( 
        { identifier: 'requestCollapsedStateChange', type: COMMAND_TYPE.TEXT_EDITOR, },
        async ( _te, _e, requestCollapsedStateChange: Function ) => requestCollapsedStateChange() 
    );

    const disposables = commandBuilder.getDisposables();

    for(const disposable of disposables) {
        context.subscriptions.push(disposable);
    }
}

// this method is called when your extension is deactivated
export function deactivate() {}
