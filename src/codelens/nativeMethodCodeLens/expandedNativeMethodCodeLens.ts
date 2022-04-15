import { Command, Range } from "vscode";
import { snakeToPascalCase } from "../../providers/codelensProvider";
import { NativeMethod } from "../../util/nativeMethodsRepository";
import AbstractNativeMethodCodeLens from './abstractNativeMethodCodeLens';

export default class ExpandedNativeMethodCodeLens extends AbstractNativeMethodCodeLens {
  
  constructor(range: Range, hash: string, identifier: string, showPrefix: boolean, triggerProviderCompute?: Function) {
    super(
      range,
      hash,
      identifier,
      showPrefix,
      triggerProviderCompute  
    );

  }

  resolve(nativeMethod: NativeMethod | undefined) {
    if (!nativeMethod) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { return_type, params, name } = nativeMethod;
    const convertedName = snakeToPascalCase(name);

    const prefix = this.showPrefix ? `${this.hash} ~ ` : '';
    const joinedParams = params.map((param: any) => `${param.name}: ${param.type}`).join(', ');
      
    const title = `${prefix}${convertedName}(${joinedParams}) : ${return_type}`;

    this.updateCommand({
      title: title,
      tooltip: 'Click to collapse parameters',
      command: 'redm-codelens.showCollapsedNativeMethodCodeLens',
      arguments: [
        this, this.identifier, this.triggerProviderCompute
      ]
    });
  }
  
}