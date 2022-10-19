import { commands, Disposable } from 'vscode';

type CommandIdentifier = 
  | 'noAction'
  | 'enable' 
  | 'disable' 
  | 'requestCollapsedStateChange' 
  | 'openDocumentation';

export default class CommandBuilder {
  static namespace: string = 'redmCodelens';
  static disposables: Disposable[] = [];
  
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