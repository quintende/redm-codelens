import { ExtensionContext, languages } from 'vscode';
import CommandBuilder from './commands/base/commandBuilder';
import { CodelensProvider } from './providers/codelensProvider';
import { selectors } from './util/data';

import './commands';

export function activate(context: ExtensionContext) {
    languages.registerCodeLensProvider(
        selectors, 
        new CodelensProvider(context)
    );

    for (const disposable of CommandBuilder.getDisposables()) {
        context.subscriptions.push(disposable);
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
    // TODO: check if we need to do something here
}
