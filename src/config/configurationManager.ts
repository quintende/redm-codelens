import { workspace } from 'vscode';

interface Config {
    'documentation.renderCodelens': boolean;
    'documentation.links': string[];
    'documentation.showQuickPick': boolean;
    'native.renderCodelens': boolean;
    'native.showPrefix': boolean;
};

interface RuntimeConfig  {
    'renderCodelens': boolean,
};

type RuntimeEvent = 'expandAll' | 'collapseAll' | 'reload' | 'refetch';

export default class ConfigurationManager {

    static appConfig;
    static currentRuntimeEvent: RuntimeEvent | undefined;
    static runtimeConfig: RuntimeConfig;
    
    static {
        this.runtimeConfig = {
            renderCodelens: false
        };

        this.appConfig = workspace.getConfiguration('redmCodelens');
    }

    static getConfig<T>(key: keyof Config): T | undefined {
        const config = this.appConfig.get<T>(key);

        return config;
    }

    static assertConfig(key: keyof Config, condition: any):  boolean {
        const config = this.appConfig.get(key);

        return config === condition;
    }

    static getRuntimeConfig(key: keyof RuntimeConfig, condition?: any) {
        const config = this.runtimeConfig[key];
        
        if (!condition) {
            return config;
        }

        return config === condition;
    }

    static getRuntimeEvent() {
        return this.currentRuntimeEvent;
    }

    static setRuntimeEvent(key: RuntimeEvent | undefined) {
        this.currentRuntimeEvent = key;
    }

    static setRuntimeConfig(key: keyof RuntimeConfig, value: any) {
        // @ts-ignore
        this.runtimeConfig[key] = value;
    }

    static setConfig(key: keyof Config, value: any) {
        this.appConfig.update(key, value);
    }
}