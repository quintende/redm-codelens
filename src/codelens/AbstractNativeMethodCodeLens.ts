import { Func } from 'mocha';
import { CodeLens as OriginalCodeLens, Command, Range } from 'vscode';
import { snakeToPascalCase } from '../CodelensProvider';
import { NativeMethod } from '../NativeMethodsRepository';

export interface ResolvableData {
    hash: string;
    identifier: string;
    showPrefix: boolean;
    callback: Function;
}

export interface ResolvedData {
    nativeMethods: NativeMethod[];
}

export default abstract class AbstractNativeMethodCodeLens extends OriginalCodeLens {

  protected hash: string;
  protected identifier: string;
  protected showPrefix: boolean;
  protected cb: Function | undefined;
  protected _command: Command;

  constructor(range: Range, hash: string, identifier: string, showPrefix: boolean = false, cb?: Function) {
    super(range);

    // We do not initialize the command here, because we want to be able to
    // resolve the command later. If the commmand is passed through the parent
    // the CodeLens will be marked as resolved.
    this._command = {
      title: 'No native method found',
      command: 'redm-codelens.noAction'
    };

    this.hash = hash;
    this.identifier = identifier;
    this.showPrefix = showPrefix;
    this.cb = cb;
  }
  
  abstract resolve(nativeMethod: NativeMethod | undefined) : void

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

  setShowPrefix(showPrefix: boolean) {
    this.showPrefix = showPrefix;
  }
}