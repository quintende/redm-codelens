import { CodeLens as OriginalCodeLens, Command, Range } from 'vscode';
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

export default abstract class AbstractCodeLens extends OriginalCodeLens {

  protected hash: string;
  protected identifier: string;
  protected triggerProviderCompute: Function | undefined;
  protected _command: Command;

  constructor(range: Range, hash: string, identifier: string, triggerProviderCompute?: Function) {
    super(range);

    // We do not initialize the command here, because we want to be able to
    // resolve the command later. If the commmand is passed through the parent
    // the CodeLens will be marked as resolved.
    this._command = {
      title: 'No command defined',
      command: 'redm-codelens.noAction'
    };

    this.hash = hash;
    this.identifier = identifier;
    this.triggerProviderCompute = triggerProviderCompute;
  }
  
  abstract resolve(nativeMethod: NativeMethod | NativeMethod[] | undefined) : void;

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