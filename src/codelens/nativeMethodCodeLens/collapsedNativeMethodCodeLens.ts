import { Range } from 'vscode';
import CommandBuilder from '../../commands/base/commandBuilder';
import { snakeToPascalCase } from '../../util/helpers';
import { NativeMethod } from '../../util/nativeMethodsRepository';
import AbstractNativeMethodCodeLens from './abstractNativeMethodCodeLens';

/* It's a code lens that shows a collapsed version of a native method */
export default class CollapsedNativeMethodCodeLens extends AbstractNativeMethodCodeLens {
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
    // @ts-ignore
    const { return_type, name } = nativeMethod;
    const convertedName = snakeToPascalCase(name);

    const hash = this.hash.substring(0, 8) + '...';
    const prefix = this.showPrefix ? `${hash} ~ ` : '';
      
    const title = `${prefix}${convertedName}(...) : ${return_type}`;
    
    this.updateCommand({
      title: title,
      tooltip: 'Click to expand parameters',
      command: CommandBuilder.get('requestCollapsedStateChange'),
      arguments: [
        this.requestCollapsedStateChange.bind(this)
      ]
    });
  }
}