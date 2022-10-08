import { Command, Range } from "vscode";
import { snakeToPascalCase } from "../../providers/codelensProvider";
import { NativeMethod } from "../../util/nativeMethodsRepository";
import AbstractNativeMethodCodeLens from './abstractNativeMethodCodeLens';

/* It's a code lens that shows the full signature of a native method */
export default class ExpandedNativeMethodCodeLens extends AbstractNativeMethodCodeLens {
  
  constructor(
    range: Range, hash: string, identifier: string, showPrefix: boolean,
    onCollapsedStateChange?: Function
  ) {
    super(
      range,
      hash,
      identifier,
      showPrefix,
      onCollapsedStateChange  
    );

  }

  resolve(nativeMethod: NativeMethod | undefined | (NativeMethod | undefined)[]) {
    if (!nativeMethod) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    // @ts-ignore -
    const { return_type, params, name } = nativeMethod;
    const convertedName = snakeToPascalCase(name);

    const prefix = this.showPrefix ? `${this.hash} ~ ` : '';
    const joinedParams = params.map((param: any) => `${param.name}: ${param.type}`).join(', ');
      
    const title = `${prefix}${convertedName}(${joinedParams}) : ${return_type}`;

    this.updateCommand({
      title: title,
      tooltip: 'Click to collapse parameters',
      command: 'redm-codelens.requestCollapsedStateChange',
      arguments: [
        this.requestCollapsedStateChange.bind(this)
      ]
    });
  }
  
}