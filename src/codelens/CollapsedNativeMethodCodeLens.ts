import { CodeLens, Range } from 'vscode';
import { snakeToPascalCase } from '../CodelensProvider';

export default class CollapsedNativeMethodCodeLens extends CodeLens {
  constructor(range: Range, identifier: string, data: any, cb?: Function) {
    const name = snakeToPascalCase(data.name);
    const return_type = data.return_type;

    super(range, {
      title: `${name}(...) : ${return_type}`,
      tooltip: 'Click to expand parameters',
      command: 'redm-codelens.toggleNativeMethodCodeLens',
      arguments: [identifier, false, cb],
    });
  }
}