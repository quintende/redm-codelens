import { CodeLens, Range } from 'vscode';
import { snakeToPascalCase } from '../providers/codelensProvider';
import { NativeMethod } from '../util/nativeMethodsRepository';
import AbstractCodeLens from './abstractCodeLens';
import { CustomTextLine, LineContextItem } from './util/codeLensContext';

const searchQuery: string = 'https://vespura.com/doc/natives/?_';


export default class NativeDocumentationCodeLens extends AbstractCodeLens {
  constructor(range: Range, hash: string) {
    super(
      range,
      hash,
      Math.random().toString()
    );
  }

  update(lineContext: any) {
    this.hash = lineContext.map(({ hash }: LineContextItem) => hash);;

    // @ts-ignore
    // this.command = {
    //   ... this.command,
    //   arguments: [
    //     urls.length > 1, urls
    //   ]
    // };
  }

  resolve(nativeMethod: NativeMethod | NativeMethod[] | undefined) {
    if (!nativeMethod) {
      return;
    }

    const nativeMethods = Array.isArray(nativeMethod) ? nativeMethod : [ nativeMethod ];

    /*const parsedNativeMethods = nativeMethods.map((nativeMethod: NativeMethod) => ({
      ... nativeMethod,
      name: `${snakeToPascalCase(nativeMethod.name)} (${nativeMethod.name})`
    }));  */

    // @ts-ignore
    this.command = {
      ... this.command,
      title: 'Documentation',
      command: 'redm-codelens.openDocumentation',
      tooltip: 'Clickt to open documentation in browser',
      arguments: [
        nativeMethods.length > 1, nativeMethods
      ]
    };
  }
}