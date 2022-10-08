import { CodeLens, Range } from 'vscode';

/* The abstract class for the CodeLens. */
export default class SimpleTextCodeLens extends CodeLens {
  constructor(range: Range, text: string, tooltip?: string) {

    super(range, {
      title: text,
      command: 'redm-codelens.noAction',
      tooltip: tooltip
    });
  }
}
