import { CodeLens, Range } from 'vscode';
import { CustomTextLine, LineContextItem } from './codeLensContext';

const searchQuery: string = 'https://vespura.com/doc/natives/?_';


export default class NativeDocumentationCodeLens extends CodeLens {
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

    // @ts-ignore
    this.command = {
      ... this.command,
      arguments: [
        urls.length > 1, urls
      ]
    };
  }
}