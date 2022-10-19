import { Range } from 'vscode';
import CommandBuilder from '../../commands/base/commandBuilder';
import { snakeToPascalCase } from '../../util/helpers';
import { NativeMethod } from '../../util/nativeMethodsRepository';
import AbstractNativeMethodCodeLens from './abstractNativeMethodCodeLens';

/* It's a code lens that shows a collapsed version of a native method */
export default class NativeMethodCodeLens extends AbstractNativeMethodCodeLens {
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

  resolve(nativeMethodData: NativeMethod | undefined, runtimeData: any) {
    if (!nativeMethodData) {
      this.updateCommand({
        title: 'Hash does not exist!'
      });

      return;
    }
    
    const { return_type, params, name } = nativeMethodData;
    const convertedName = snakeToPascalCase(name);
    const converedParams = runtimeData?.isExpanded 
                            ? params.map((param: any) => `${param.name}: ${param.type}`).join(', ')
                            : '...';

    const hash = this.hash.substring(0, 8) + '...';
    const prefix = this.showPrefix ? `${hash} ~ ` : '';


    const title = `${prefix}${convertedName}(${converedParams}) : ${return_type}`;
    
    this.updateCommand({
      title: title,
      tooltip: 'Click to toggle parameters',
      command: CommandBuilder.get('requestCollapsedStateChange'),
      arguments: [
        this.requestCollapsedStateChange.bind(this, runtimeData)
      ]
    });
  }
}