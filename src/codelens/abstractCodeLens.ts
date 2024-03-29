import { CodeLens as OriginalCodeLens, Command, Range } from 'vscode';
import CommandBuilder from '../commands/base/commandBuilder';
import { NativeMethod } from '../util/nativeMethodsRepository';

export interface ResolvableData {
    hash: string;
    identifier: string;
    showPrefix: boolean;
    callback: Function;
}

export interface ResolvedData {
    nativeMethods: NativeMethod[];
}

/* The abstract class for the CodeLens. */
export default abstract class AbstractCodeLens extends OriginalCodeLens {

  protected hash: string;
  protected identifier: string;
  protected _command: Command;

  constructor(range: Range, hash: string, identifier: string) {
    super(range);

    // We do not initialize the command here, because we want to be able to
    // resolve the command later. If the commmand is passed through the parent
    // the CodeLens will be marked as resolved.
    this._command = {
      title: 'No command defined',
      command: CommandBuilder.get('noAction')
    };

    this.hash = hash;
    this.identifier = identifier;
  }
  
  abstract resolve(nativeMethod: NativeMethod[], runtimeData: any) : void;

  public static isInstance(_instance: any) {
    return this.name === _instance.constructor.name;
  }

  updateCommand(properties: Partial<Command>) {
    // @ts-ignore
    this.command = {
        ... this._command,
        ... properties
    };
  }

  getHash() {
    return this.hash;
  }

  public getIdentifier() {
    return this.identifier;
  }
}