import { Command, Range } from "vscode";
import { snakeToPascalCase } from "../CodelensProvider";
import { NativeMethod } from "../NativeMethodsRepository";
import AbstractNativeMethodCodeLens, { ResolvedData } from './AbstractNativeMethodCodeLens';

export default class ExpandedNativeMethodCodeLens extends AbstractNativeMethodCodeLens {
  
  constructor(range: Range, hash: string, identifier: string, showPrefix: boolean, cb?: Function) {
    super(
      range,
      hash,
      identifier,
      showPrefix,
      cb  
    );

  }

  resolve(nativeMethod: NativeMethod | undefined) {
    if (!nativeMethod) {
      return;
    }

    const { return_type, params, name } = nativeMethod;
    const convertedName = snakeToPascalCase(name);

    const prefix = this.showPrefix ? `${this.hash} ~ ` : '';
    const joinedParams = params.map((param: any) => `${param.name}: ${param.type}`).join(', ');
      
    const title = `${prefix}${convertedName}(${joinedParams}) : ${return_type}`;

    this.updateCommand({
      title: title,
      tooltip: 'Click to collapse parameters',
      command: 'redm-codelens.showCollapsedNativeMethodCodeLens'
    });
  }
  
}