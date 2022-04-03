'use strict';

import { Memento } from "vscode";

export class LocalStorageService {
    private storage: Memento;

    constructor(storage: Memento) {
        this.storage = storage;
    }   
    
    public getValue<T>(key : string) : T {
        return this.storage.get<T>(key, {} as T);
    }

    public setValue<T>(key : string, value : T){
        this.storage.update(key, value);
    }
}