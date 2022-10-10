import { Memento } from "vscode";

type DynamicType = any;

export class LocalStorageService {
    private storage: Memento;

    constructor(storage: Memento) {
        this.storage = storage;
    }   
    
    public getValue<T>(key : string, defaultValue: DynamicType = {}) : T {
        return this.storage.get<T>(key, defaultValue as T);
    }

    public setValue<T>(key : string, value : T){
        this.storage.update(key, value);
    }
}