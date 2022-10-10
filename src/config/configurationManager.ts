import { workspace } from 'vscode';

export default class ConfigurationManager {

    static userConfig;
    static appConfig;
    static runtimeConfig: any;
    
    static {
        this.runtimeConfig = {
            renderCodelens: false
        };

        this.appConfig = workspace.getConfiguration('redm-codelens');
        this.userConfig = workspace.getConfiguration('redm-codelens');
    }

    static getConfig(key: string, condition: any) {
        const config = this.appConfig.get(key);

        if (!condition) {
            return config;
        }

        return config === condition;
    }

    static getRuntimeConfig(key: string, condition: any) {
        const config = this.runtimeConfig[key];
        
        if (!condition) {
            return config;
        }

        return config === condition;
    }

    static setConfig(key: string, value: any) {
        this.appConfig.update(key, value);
    }
}