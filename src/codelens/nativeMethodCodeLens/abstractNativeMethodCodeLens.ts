import { CodeLens as OriginalCodeLens, Command, Range } from 'vscode';
import AbstractCodeLens from '../abstractCodeLens';

export default abstract class AbstractNativeMethodCodeLens extends AbstractCodeLens {
  protected showPrefix: boolean;

  constructor(range: Range, hash: string, identifier: string, showPrefix: boolean = false, triggerProviderCompute?: Function) {
    super(
      range,
      hash,
      identifier,
      triggerProviderCompute
    );

    this.showPrefix = showPrefix;
  }

  setShowPrefix(showPrefix: boolean) {
    this.showPrefix = showPrefix;
  }

  update(lineContext: any) {
    this.showPrefix = lineContext.showPrefix;
  }
}