import { Disposable, commands } from 'vscode';

export enum COMMAND {
  ENABLE = 'enable',
  DISABLE = 'disable',
  OPEN_DOCUMENTATION = 'openDocumentation',
  SHOW_EXPANDED_NATIVE_METHOD_CODE_LENS = 'showExpandedNativeMethodCodeLens',
  SHOW_COLLAPSED_NATIVE_METHOD_CODE_LENS = 'showCollapsedNativeMethodCodeLens'
}

export enum COMMAND_TYPE {
    DEFAULT,
    TEXT_EDITOR
}

export const namespace = 'redm-codelens'; 

type commandIdentifier = string;

interface CommandConfig {
  identifier: commandIdentifier,
  type: COMMAND_TYPE,
}

const isCommandConfig = (command: object | string): command is CommandConfig => (command as CommandConfig).identifier !== undefined;

export default class CommandBuilder {
  
  private readonly _namespace = namespace;
  private _disposables: Disposable[] = [];
  
  constructor() { }

  registerCommand(commandData: CommandConfig | commandIdentifier, callback: (...args: any[]) => any) {
    const isTextEditorCommand = isCommandConfig(commandData);

    const { registerCommand, registerTextEditorCommand } = commands;
    const register = isTextEditorCommand ? registerTextEditorCommand : registerCommand;
    const identifier = isTextEditorCommand ? commandData.identifier : commandData;

    this._disposables.push(
        register(`${this._namespace}.${identifier}`, callback)
    );
  }

  getDisposables() {
    return this._disposables;
  }
}