import { CodeLens, Range, TextLine } from 'vscode';
import ConfigurationManager from '../../config/configurationManager';

export interface LineContext {
  hashes: string[];
  identifiers: string[];
}

export interface LineContextItem {
  hash: string;
  identifier: string;
}

export interface CustomTextLine {
  line: TextLine;
  context: LineContextItem;
}

export default class CodeLensContext {
  private forceExpandedState?: boolean;
  private lines: Map<number, any> = new Map<number, any>();
  private codelenses: Map<string, any> = new Map<string, any>();

  constructor() { }

  /**
   * If the current line is the same as the line passed in, return true, otherwise return false.
   * @param {TextLine} line - TextLine - The line to check against the current line.
   * @returns A boolean value.
   */
  public getLineState(textLine: TextLine | number) {
    const line = (typeof textLine === 'number') ? textLine : textLine.lineNumber;
    
    return {
        hashes: this.lines.get(line) ?? [],
        showPrefix: (this.lines.get(line)?.length ?? 0) >= 2
    };
  }

  private cleanUp() {
    this.forceExpandedState = false;
    ConfigurationManager.setRuntimeConfig('globalCodeLensFlag', undefined);
  }

  public resetAll() {
    const globalConfig = ConfigurationManager.getRuntimeConfig('globalCodeLensFlag');

    this.cleanUp();

    if (globalConfig === 'expandAll') {
      this.forceExpandedState = true;
    }

    if (globalConfig === 'collapseAll') {
      this.codelenses.clear();
    }

    this.lines.clear();
  }

  private generateAndGetApproxCodeLensIdentifier(identifier: string) {
    const [line, hash, params] = identifier.split('|');

    for (const key of this.codelenses.keys()) {
      if (key.includes(`${line}|${hash}`) || key.includes(`${hash}|${params}`)) {
        const value = this.codelenses.get(key);
        
        this.codelenses.set(identifier, value);
        this.codelenses.delete(key);

        return value;
      }
    }
    
    return null;
  }

  public getCodeLensState(identifier: string) {
    const hasCodeLens = this.codelenses.has(identifier);

    if (this.forceExpandedState) {
      this.setCodeLensExpandedState(identifier, true);
    }

    if (hasCodeLens) {
      return this.codelenses.get(identifier);
    }

    return this.generateAndGetApproxCodeLensIdentifier(identifier); 
  }

  public updateCurrentLine(line: TextLine, hash: string) {
    const lineData = this.lines.get(line.lineNumber);

    this.lines.set(
      line.lineNumber,
      [ ...(lineData ?? []), { hash: hash } ]
    );
  }

  public setCodeLensExpandedState(identifier: any, state: boolean) {
    this.codelenses.set(identifier, {
      isExpanded: state
    });
  }
}