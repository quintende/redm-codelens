import { CodeLens, Range } from "vscode";
import { snakeToPascalCase } from "../CodelensProvider";

export default class ExpandedNativeMethodCodeLens extends CodeLens {
  constructor(range: Range, identifier: string, data: any, cb?: Function) {
    const name = snakeToPascalCase(data.name);
    const params = data.params.map((param: any) => `${param.name}: ${param.type}`).join(', ');
    const return_type = data.return_type;

    super(range, {
      title: `${name}(${params}) : ${return_type}`,
      tooltip: 'Click to collapse parameters',
      command: 'redm-codelens.toggleNativeMethodCodeLens',
      arguments: [identifier, true, cb],
    });
  }
}