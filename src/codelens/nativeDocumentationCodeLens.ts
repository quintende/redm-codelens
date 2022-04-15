import { CodeLens, Range } from 'vscode';
import { snakeToPascalCase } from '../providers/codelensProvider';
import { NativeMethod } from '../util/nativeMethodsRepository';
import { CustomTextLine, LineContextItem } from './util/codeLensContext';

const searchQuery: string = 'https://vespura.com/doc/natives/?_';


export default class NativeDocumentationCodeLens extends CodeLens {
  private hashes: string[] = [];

  constructor(range: Range, hash: string) {
    const url = `${searchQuery}${hash}`;

    super(range, {
      title: 'Documentation',
      arguments: [
        false, [ url ]
      ],
      command: 'redm-codelens.openDocumentation',
      tooltip: url
    });
  }
  public static isInstance(_instance: any) {
    return this.name === _instance.constructor.name;
  }

  update(lineContext: any) {
    const urls = lineContext.map(({ hash }: LineContextItem) => hash);
    this.hashes = urls;

    // @ts-ignore
    // this.command = {
    //   ... this.command,
    //   arguments: [
    //     urls.length > 1, urls
    //   ]
    // };
  }

  getHash() {
    return this.hashes;
  }

  resolve(nativeMethod: NativeMethod | NativeMethod[] | undefined) {
    if (!nativeMethod) {
      return;
    }

    const nativeMethods = Array.isArray(nativeMethod) ? nativeMethod : [ nativeMethod ];

    const parsedNativeMethods = nativeMethods.map((nativeMethod: NativeMethod) => ({
      ... nativeMethod,
      name: `${snakeToPascalCase(nativeMethod.name)} (${nativeMethod.name})`
    }));  

    // @ts-ignore
    this.command = {
      ... this.command,
      arguments: [
        parsedNativeMethods.length > 1, parsedNativeMethods
      ]
    };
  }
}