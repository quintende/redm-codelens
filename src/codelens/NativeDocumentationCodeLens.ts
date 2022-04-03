import { CodeLens, Range } from 'vscode';

const searchQuery: string = 'https://vespura.com/doc/natives/?_';

export default class NativeDocumentationCodeLens extends CodeLens {
  constructor(range: Range, hash: string) {
    const url = `${searchQuery}${hash}`;

    super(range, {
      title: 'Documentation',
      arguments: [url],
      command: 'redm-codelens.openDocumentation',
      tooltip: url
    });
  }
}