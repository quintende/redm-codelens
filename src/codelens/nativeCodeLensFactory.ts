import { Range } from "vscode";
import { CODELENS_TYPE } from "../CodelensProvider";
import CollapsedNativeMethodCodeLens from "./CollapsedNativeMethodCodeLens";
import ExpandedNativeMethodCodeLens from "./ExpandedNativeMethodCodeLens";

type NativeMethodParameters = [range: Range, hash: string, identifier: string, showPrefix: boolean];

export default class NativeMethodCodeLensFactory {
    private provider: any;
    private params?: NativeMethodParameters;
    
    constructor() { }

    public addProvider(provider: any) {
        this.provider = provider;
    
        return this;
    }

    public addParams(...params: NativeMethodParameters) {
        this.params = params;

        return this;
    }

    public create(type: CODELENS_TYPE) {
        const parameters = this.params as NativeMethodParameters;

        if (type === CODELENS_TYPE.EXPANDED) {
            return new ExpandedNativeMethodCodeLens(
                ... parameters,
                () => this.provider._onDidChangeCodeLenses.fire()
            );
        }

        if (type === CODELENS_TYPE.COLLAPSED) {
            return new CollapsedNativeMethodCodeLens(
                ... parameters,
                () => this.provider._onDidChangeCodeLenses.fire()
            );
        }
        
        throw new Error('Unknown type');
    }
}