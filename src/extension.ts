import CommandBuilder, { COMMAND, COMMAND_TYPE } from './commands/CommandBuilder';
import { CodelensProvider, kebabCase, expandedCodeLenses } from './CodelensProvider';
import { compatibleFilesSelector } from './selectors/NativesSelectors';

export function activate(context: ExtensionContext) {


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
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "redm-codelens" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('redm-codelens.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from redm-codelens!');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
