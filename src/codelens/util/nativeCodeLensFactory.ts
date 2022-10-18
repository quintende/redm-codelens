import { CodeLensProvider, Range } from "vscode";
import CollapsedNativeMethodCodeLens from "../nativeMethodCodeLens/collapsedNativeMethodCodeLens";
import ExpandedNativeMethodCodeLens from "../nativeMethodCodeLens/expandedNativeMethodCodeLens";
import NativeMethodCodeLens from "../nativeMethodCodeLens/nativeMethodCodeLens";

type NativeMethodParameters = [
    range: Range, 
    hash: string, 
    identifier: string, 
    showPrefix: boolean,
    //isExpaned: boolean
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
        //const isExpanded = this.cache.get(identifier) === true;

        
        // this.cache.set(identifier, isExpanded);

        // if (isExpanded) {
        //     return new ExpandedNativeMethodCodeLens(
        //         range, hash, identifier, showPrefix,
        //         () => {
        //             this.provider.codeLensContext.setCodeLensExpandedState(identifier, false);
        //             // this.cache.set(identifier, false);
        //             this.provider.eventEmitter.fire();
        //         }
        //     );
        // }
        
        return new NativeMethodCodeLens(
            range, hash, identifier, showPrefix,
            (runtimeData: any) => {
                this.provider.codeLensContext.setCodeLensExpandedState(identifier, !runtimeData?.isExpanded);
                this.provider.eventEmitter.fire();
            }
        );
    }
}