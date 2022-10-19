import { CodeLens, Range } from 'vscode';
import CommandBuilder from '../commands/base/commandBuilder';

/* The abstract class for the CodeLens. */
export default class SimpleTextCodeLens extends CodeLens {
  constructor(range: Range, text: string, tooltip?: string) {

    super(range, {
      title: text,
      command: CommandBuilder.get('noAction'),
      tooltip: tooltip
    });
  }
}
