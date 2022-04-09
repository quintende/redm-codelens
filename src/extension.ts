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
    TextEditorEdit 
} from 'vscode';
import CommandBuilder, { COMMAND, COMMAND_TYPE } from './commands/CommandBuilder';
import { EVENT, NativeMethodsRepository } from './NativeMethodsRepository';
import { CodelensProvider, expandedCodeLenses } from './CodelensProvider';
import { compatibleFilesSelector } from './selectors/NativesSelectors';

export function activate(context: ExtensionContext) {

    const nativeMethodsRepository = new NativeMethodsRepository(context);

    nativeMethodsRepository
        .on(EVENT.NATIVES_FETCH_FAILED,
            () => { window.showErrorMessage( "Failed to fetch native methods." ) })
        .on(EVENT.NATIVES_FETCH_FALLBACK,
            (date: string) => { window.showWarningMessage( `Failed to fetch updated native methods. Will use fallback to natives from ${date}.` ) })
        .on(EVENT.NATIVES_FETCH_SUCCESS,
            () => { window.showInformationMessage( "Native methods fetched successfully." ) })
        .on(EVENT.NATIVES_FETCH_UPDATED,
            () => { window.showInformationMessage( "Native methods updated successfully." ) });

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
        (url: string) => {
            env.openExternal(Uri.parse(url));
        }
    );

    const toggleNativeMethodCodeLens = async (
        identifier: string, isLongNativeMethod: boolean, cb: Function
    ) => {   
        if (!isLongNativeMethod) {
            expandedCodeLenses.push(identifier);
        } else {
            const index = expandedCodeLenses.indexOf(identifier);
            if (index !== -1) expandedCodeLenses.splice(index, 1);
        }

        cb();
    }

    commandBuilder.registerCommand(
        {
            identifier: COMMAND.SHOW_EXPANDED_NATIVE_METHOD_CODE_LENS,
            type: COMMAND_TYPE.TEXT_EDITOR,
        },
        async (
            textEditor: TextEditor, edit: TextEditorEdit, 
            identifier: string, cb: Function
        ) => {   
            toggleNativeMethodCodeLens(identifier, false, cb);
        }
    );


    commandBuilder.registerCommand(
        {
            identifier: COMMAND.SHOW_COLLAPSED_NATIVE_METHOD_CODE_LENS,
            type: COMMAND_TYPE.TEXT_EDITOR,
        },
        async (
            textEditor: TextEditor, edit: TextEditorEdit, 
            identifier: string, cb: Function
        ) => {   
            toggleNativeMethodCodeLens(identifier, true, cb);
        }
    );

    const disposables = commandBuilder.getDisposables();

    for(const disposable of disposables) {
        context.subscriptions.push(disposable);
    }
}

// this method is called when your extension is deactivated
export function deactivate() {}
