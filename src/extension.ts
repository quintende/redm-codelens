import {
    ExtensionContext,
    env,
    Uri,
    languages,
    workspace,
    window,
    CodeLensProvider
} from 'vscode';
import CommandBuilder, { COMMAND, COMMAND_TYPE } from './commands/commandBuilder';
import { EVENT, NativeMethod, NativeMethodsRepository } from './util/nativeMethodsRepository';
import { CodelensProvider } from './providers/codelensProvider';
import { selectors, snakeToPascalCase } from './util/helpers';

export function activate(context: ExtensionContext) {
    const commandBuilder: CommandBuilder = new CommandBuilder();
    const codelensProvider: CodeLensProvider = new CodelensProvider(context);

    commandBuilder.build(
        COMMAND.ENABLE,
        (namespace: string, config: string) => {
            workspace.getConfiguration(namespace).update(config, true, true);
        }
    );

    commandBuilder.build(
        COMMAND.DISABLE,
        (namespace: string, config: string) => {
            workspace.getConfiguration(namespace).update(config, false, true);
        }
    );

    commandBuilder.build(
        COMMAND.OPEN_DOCUMENTATION,
        async (showMultipleMethods: boolean, nativeMethods: NativeMethod[]) => {
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
                    { label: 'Vespura', detail: 'https://vespura.com/doc/natives/', url: 'https://vespura.com/doc/natives/?_' + hash },
                    { label: 'Alloc8or', detail: 'https://alloc8or.re/rdr3/nativedb/', url: 'https://alloc8or.re/rdr3/nativedb/?n=' + hash },
                    { label: 'RDR2MODS', detail: 'https://www.rdr2mods.com/nativedb/', url: 'https://www.rdr2mods.com/nativedb/search/?s=' + hash },
                ],
                { title: 'Select which documentation page you want to open' });

            if (!target) {
                return;
            }

            env.openExternal(Uri.parse(target.url));
        }
    );

    commandBuilder.build( 
        'requestCollapsedStateChange',
        (requestCollapsedStateChange: Function ) => requestCollapsedStateChange() 
    );

    languages.registerCodeLensProvider(selectors, codelensProvider);

    for(const disposable of commandBuilder.getDisposables()) {
        context.subscriptions.push(disposable);
    }
}

// this method is called when your extension is deactivated
export function deactivate() {}
