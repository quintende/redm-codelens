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
  private lines: Map<string, any> = new Map<string, any>();
  private _lastLine?: CustomTextLine;

  constructor() { }

  public currentLineEquals(line: TextLine) {
    const currentLine = this.getCurrentLineContext();

    if (!currentLine) {
      return false;
    }
    
    return currentLine.line.lineNumber === line.lineNumber;
  }

  public updateCurrentLine(line: TextLine, lineContextItem: LineContextItem) {
    if (this._lastLine && this._lastLine.line.lineNumber === line.lineNumber) {
      this.updateLineContext(lineContextItem);

      const _we = [...this.lines][this.lines.size-1][1];
      return _we.contexts;
    }

    this.initialiseLineContext(line, lineContextItem);


    const _we = [...this.lines][this.lines.size-1][1];
    return _we.contexts;
  }

  private initialiseLineContext(line: TextLine, context: LineContextItem) {
    this._setCurrentLineContext({
      line, context
    });
    
    this.lines.set(
      context.identifier,
      { line: line, contexts: [ context ] }
    );
  }

  private updateLineContext(lineContextItem: LineContextItem) {
    const currentLine = this.getCurrentLineContext();

    if (!currentLine) {
      return;
    }

    const { identifier } = currentLine.context;
    const currentLineContext = this.lines.get(identifier);


    this.lines.set(
      identifier,
      { ... currentLineContext, 
        contexts: [ ... currentLineContext.contexts, lineContextItem ] }
    );
  
  }

  public getCurrentLineContext() {
    return this._lastLine; 
  }

  public _setCurrentLineContext(line: CustomTextLine) {
    return this._lastLine = line; 
  }
}