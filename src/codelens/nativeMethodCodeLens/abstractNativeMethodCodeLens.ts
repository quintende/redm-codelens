import { CodeLens as OriginalCodeLens, Command, Range } from 'vscode';
import AbstractCodeLens from '../abstractCodeLens';

/* A class that extends another class. */
export default abstract class AbstractNativeMethodCodeLens extends AbstractCodeLens {
  protected showPrefix: boolean;
  protected triggerProviderCompute?: Function;
  protected onCollapsedStateChange?: Function;

  constructor(
    range: Range, hash: string, identifier: string, showPrefix: boolean = false,
    onCollapsedStateChange?: Function
  ) {
    super(
      range,
      hash,
      identifier
    );

    this.showPrefix = showPrefix;
    this.onCollapsedStateChange = onCollapsedStateChange;
  }

  requestCollapsedStateChange(runtimeData: any) {
    this.onCollapsedStateChange?.(runtimeData);
  }

  setShowPrefix(showPrefix: boolean) {
    this.showPrefix = showPrefix;
  }

  update(lineContext: any) {
    this.showPrefix = lineContext.showPrefix;
  }
}