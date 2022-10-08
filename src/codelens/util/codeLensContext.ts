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

/**
 * If the current line is the same as the line passed in, return true, otherwise return false.
 * @param {TextLine} line - TextLine - The line to check against the current line.
 * @returns A boolean value.
 */
  public doesCurrentLineEqualTo(line: TextLine) {
    const currentLine = this.getCurrentLineContext();

    if (!currentLine) {
      return false;
    }
    
    return currentLine.line.lineNumber === line.lineNumber;
  }

/**
 * > It updates the current line context
 * @param {TextLine} line - TextLine - this is the line that is being updated
 * @param {LineContextItem} lineContextItem - LineContextItem
 * @returns The contexts of the last line.
 */
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

/**
 * It sets the current line context and adds the line to the lines map
 * @param {TextLine} line - The TextLine object that the context is being added to.
 * @param {LineContextItem} context - LineContextItem
 */
  private initialiseLineContext(line: TextLine, context: LineContextItem) {
    this._setCurrentLineContext({
      line, context
    });
    
    this.lines.set(
      context.identifier,
      { line: line, contexts: [ context ] }
    );
  }

/**
 * It takes a `LineContextItem` and adds it to the current line's context
 * @param {LineContextItem} lineContextItem - LineContextItem
 * @returns The current line context.
 */
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

/**
 * > This function returns the last line of the file
 * @returns The last line of the file.
 */
  public getCurrentLineContext() {
    return this._lastLine; 
  }

/**
 * > This function sets the current line context
 * @param {CustomTextLine} line - CustomTextLine - The current line being processed.
 * @returns The last line of the text.
 */
  public _setCurrentLineContext(line: CustomTextLine) {
    return this._lastLine = line; 
  }
}