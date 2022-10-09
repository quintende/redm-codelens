import { CodeLensProvider, Range } from "vscode";
import CollapsedNativeMethodCodeLens from "../nativeMethodCodeLens/collapsedNativeMethodCodeLens";
import ExpandedNativeMethodCodeLens from "../nativeMethodCodeLens/expandedNativeMethodCodeLens";

type NativeMethodParameters = [range: Range, hash: string, identifier: string, showPrefix: boolean];

export default class NativeMethodCodeLensFactory {
    private provider: any;
    private params?: NativeMethodParameters;
    private cache: Map<string, boolean> = new Map<string, boolean>();

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

    public create(): ExpandedNativeMethodCodeLens | CollapsedNativeMethodCodeLens | undefined {
        if (!this.params) return;

        const [ _range, _hash, identifier ] = this.params;
        const isExpanded = this.cache.get(identifier) === true;

        this.cache.set(identifier, isExpanded);

        if (isExpanded) {
            return new ExpandedNativeMethodCodeLens(
                ... this.params,
                () => {
                    this.cache.set(identifier, false);
                    this.provider.eventEmitter.fire();
                    // this.provider.fireChangeCodeLenses();
                }
            );
        }
        
        return new CollapsedNativeMethodCodeLens(
            ... this.params,
            () => {
                this.cache.set(identifier, true);
                this.provider.eventEmitter.fire();
                // this.provider.fireChangeCodeLenses();
            }
        );
    }
}