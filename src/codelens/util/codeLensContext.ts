import { CodeLens, Range, TextLine } from 'vscode';

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
  private lines: Map<number, number> = new Map<number, number>();
  private codelenses: Map<string, any> = new Map<string, any>();

  constructor() { }

  /**
   * If the current line is the same as the line passed in, return true, otherwise return false.
   * @param {TextLine} line - TextLine - The line to check against the current line.
   * @returns A boolean value.
   */
  public getLineState(line: TextLine) {
    return {
      showPrefix: (this.lines.get(line.lineNumber) ?? 0) >= 2
    };
  }

  public resetAll() {
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
    
    
    if (hasCodeLens) {
      return this.codelenses.get(identifier);
    }

    // TODO: to performance heavy -- should move to 'resolveCodeLens'
    return this.generateAndGetApproxCodeLensIdentifier(identifier); 
  }

  public updateCurrentLine(identifier: string, line: TextLine, lineContextItem: LineContextItem) {
    this.lines.set(
      line.lineNumber,
      (this.lines.get(line.lineNumber) ?? 0) + 1
    );
  }

  public setCodeLensExpandedState(identifier: any, state: boolean) {
    this.codelenses.set(identifier, {
      isExpanded: state
    });

    console.log('setCodeLensExpandedState', identifier, state);
  }
}