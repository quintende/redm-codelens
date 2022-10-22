import { Range } from 'vscode';
import CommandBuilder from '../commands/base/commandBuilder';
import { NativeMethod } from '../util/nativeMethodsRepository';
import AbstractCodeLens from './abstractCodeLens';

/* It's a code lens that shows the documentation of a native method */
export default class NativeDocumentationCodeLens extends AbstractCodeLens {
  constructor(range: Range, hash: string) {
    super(
      range,
      hash,
      Math.random().toString()
    );
  }

  update(lineContext: any) {
    this.hash = lineContext.hash; // lineContext.map(({ hash }: LineContextItem) => hash);
  }

  resolve(nativeMethods: NativeMethod[]) { // | (NativeMethod | undefined)[]

    this.command = {
      ... this.command,
      title: 'Documentation',
      command: CommandBuilder.get('openDocumentation'),
      tooltip: 'Click to open documentation in browser',
      arguments: [
        nativeMethods.length > 1, nativeMethods
      ]
    };
  }
}