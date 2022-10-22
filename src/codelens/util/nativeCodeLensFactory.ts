import { CodeLensProvider, Range } from "vscode";
import NativeMethodCodeLens from "../nativeMethodCodeLens/nativeMethodCodeLens";

type NativeMethodParameters = [
    range: Range, 
    hash: string, 
    identifier: string, 
    showPrefix: boolean
];

export default class NativeMethodCodeLensFactory {
    private provider: any;
    private params?: NativeMethodParameters;
    //private cache: Map<string, boolean> = new Map<string, boolean>();

    constructor() { }
    /**
     * It adds a provider to the current object.
     * @param {any} provider - The provider to add to the list of providers.
     * @returns The object itself.
     */
    public addProvider(provider: CodeLensProvider) {
        this.provider = provider;
    
        return this;
    }

    /**
     * It adds parameters to the method
     * @param {NativeMethodParameters} params - The parameters that the native method takes.
     * @returns The NativeMethodBuilder instance.
     */
    public addParams(...params: NativeMethodParameters) {
        this.params = params;

        return this;
    }

    private getParams(): NativeMethodParameters {
        return this.params as NativeMethodParameters;
    }

    public create(): NativeMethodCodeLens {
        const [ range, hash, identifier, showPrefix ] = this.getParams();

        return new NativeMethodCodeLens(
            range, hash, identifier, showPrefix,
            (runtimeData: any) => {
                this.provider.codeLensContext.setCodeLensExpandedState(identifier, !runtimeData?.isExpanded);
                this.provider.eventEmitter.fire();
            }
        );
    }
}