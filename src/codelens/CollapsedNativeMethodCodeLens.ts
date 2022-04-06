import { Range } from 'vscode';
import { snakeToPascalCase } from '../CodelensProvider';
import { NativeMethod } from '../NativeMethodsRepository';
import AbstractNativeMethodCodeLens from './AbstractNativeMethodCodeLens';

export default class CollapsedNativeMethodCodeLens extends AbstractNativeMethodCodeLens {
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
    console.log(nativeMethod);
    if (!nativeMethod) {
      return;
    }

    const { return_type, name } = nativeMethod;
    const convertedName = snakeToPascalCase(name);

    const hash = this.hash.substring(0, 8) + '...';
    const prefix = this.showPrefix ? `${hash} ~ ` : '';
      
    const title = `${prefix}${convertedName}(...) : ${return_type}`;
    this.updateCommand({
      title: title,
      tooltip: 'Click to expand parameters',
      command: 'redm-codelens.showExpandedNativeMethodCodeLens' // toggleNativeMethodCodeLens
    });
  }
}