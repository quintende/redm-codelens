import { commands, Disposable } from 'vscode';

type CommandIdentifier = 
  | 'noAction'
  | 'reload' 
  | 'refetch' 
  | 'requestCollapsedStateChange'
  | 'executeRefetchRepository' 
  | 'openDocumentation'
  | 'collapseAll'
  | 'expandAll';

export default class CommandBuilder {
  static namespace: string = 'redmCodelens';
  static disposables: Disposable[] = [];
 
  static on(name: CommandIdentifier, callback: (...args: any[]) => any, thisArg?: any) {
    CommandBuilder.build(name, callback, thisArg);
  }

  static build(name: CommandIdentifier, callback: (...args: any[]) => any, thisArg?: any) {
    const { registerCommand } = commands;
    const disposable = registerCommand(`${CommandBuilder.namespace}.${name}`, callback);

    CommandBuilder.disposables.push(disposable);

    return disposable;
  }

  static get(name: CommandIdentifier) {
    return `${CommandBuilder.namespace}.${name}`;
  }

  static getDisposables() {
    return CommandBuilder.disposables;
  }
}