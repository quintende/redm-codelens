import { CodeLens, Range } from 'vscode';
import { NativeMethod } from '../util/nativeMethodsRepository';
import AbstractCodeLens from './abstractCodeLens';
import { CustomTextLine, LineContextItem } from './util/codeLensContext';

const searchQuery: string = 'https://vespura.com/doc/natives/?_';


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
    this.hash = lineContext.map(({ hash }: LineContextItem) => hash);
  }

  resolve(nativeMethod: NativeMethod | undefined | (NativeMethod | undefined)[]) {
    if (!nativeMethod) {
      return;
    }

    const nativeMethods = Array.isArray(nativeMethod) ? nativeMethod : [ nativeMethod ];

    this.command = {
      ... this.command,
      title: 'Documentation',
      command: 'redm-codelens.openDocumentation',
      tooltip: 'Click to open documentation in browser',
      arguments: [
        nativeMethods.length > 1, nativeMethods
      ]
    };
  }
}