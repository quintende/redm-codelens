import axios from 'axios';
import { ExtensionContext, Memento } from 'vscode';
import { LocalStorageService } from './LocalStorageService';
import to from 'await-to-js';
import * as hash from 'object-hash';

//import { context } from 'vscode';

export interface NativeMethod {
    name: string;
    params: {
        name: string;
        type: string;
    };
    return_type: string;
}

export enum EVENT {
    NATIVES_FETCH_FAILED,
    NATIVES_FETCH_SUCCESS,
    NATIVES_FETCH_UPDATED,
    NATIVES_FETCH_FALLBACK
}

export enum STORAGE_STATE {
    STALE,
    NEW,
    CACHED
}

interface ServerResponse {
    data: ServerData
}
  
type ServerData = Array<object>;

type StorageResponse = STORAGE_STATE | null

const logger = (...args: any[]) => {}

export class NativeMethodsRepository {

    private static instance: NativeMethodsRepository;

    private readonly rdrNativesUrl: string = 'https://raw.githubusercontent.com/alloc8or/rdr3-nativedb-data/master/natives.json';

    private readonly cfxNativesUrl: string = 'https://runtime.fivem.net/doc/natives_cfx.json';

    /* Flag */
    private isInitialised: boolean = false;

    private cache: Map<string, NativeMethod> = new Map<string, NativeMethod>();

    private storageManager: LocalStorageService | undefined;

    private events: any = {};

    constructor(context?: ExtensionContext) {
        if (NativeMethodsRepository.instance) {
            return NativeMethodsRepository.instance;
        }

        if (context) {
            this.initialiseRepository(context.globalState);
            NativeMethodsRepository.instance = this;
        }
    }

    private parseAndSaveNatives(nativeNamespaces: any) {
        const namespaces: any = Object.values(nativeNamespaces);

        for (const namespace of namespaces) {
            const natives: any = Object.entries(namespace);

            for (const [key, { name, params, return_type }] of natives) {
                this.storageManager?.setValue<NativeMethod>(key, {
                    name,
                    params,
                    return_type
                });
            }
        }
    }

    async fetchAndSaveNatives(): Promise<StorageResponse> {
        const [rdrError, rdrResponse] = await to<ServerResponse>(axios.get(this.rdrNativesUrl));
        const [cfxError, cfxResponse] = await to<ServerResponse>(axios.get(this.cfxNativesUrl));

        if (rdrError) throw rdrError;
        if (cfxError) throw cfxError;

        const responseHash = `${hash(rdrResponse.data)}-${hash(cfxResponse.data)}`;
        const cachedHash = this.storageManager?.getValue<string>('hash', null);

        logger(`Fetched data with content hash: ${responseHash}`);

        if (cachedHash === responseHash) {
            return STORAGE_STATE.CACHED;
        }

        this.storageManager?.setValue<string>('hash', responseHash);

        this.parseAndSaveNatives(rdrResponse.data);
        this.parseAndSaveNatives(cfxResponse.data);
        
        return cachedHash === null ? STORAGE_STATE.NEW : STORAGE_STATE.STALE;
    }

    async initialiseRepository(storage: Memento) {
        const hashMatch = '0x275F255ED201B937';
        const hasGlobalStorageHit = storage.get(hashMatch) !== undefined;

        this.storageManager = new LocalStorageService(storage);

        const [error, response] = await to<StorageResponse>(this.fetchAndSaveNatives());
        
        if (error && !hasGlobalStorageHit) {
            this.trigger(EVENT.NATIVES_FETCH_FAILED);
            logger(error);

            return;
        }

        if (error && hasGlobalStorageHit) {
            this.trigger(EVENT.NATIVES_FETCH_FALLBACK);
            logger(error);

            return;
        }

        if (response === STORAGE_STATE.NEW) {
            this.trigger(EVENT.NATIVES_FETCH_SUCCESS);
        }

        if (response === STORAGE_STATE.STALE) {
            this.trigger(EVENT.NATIVES_FETCH_UPDATED);
        }

        if (response === STORAGE_STATE.CACHED) {
            console.log("Using cached data");
        }

        this.isInitialised = true;

    }

    public get(hash: string): NativeMethod {
        if (!this.storageManager) {
            throw new Error('Storage manager is not initialised');
        }

        if (!this.cache.has(hash)) {
            const nativeMethod = this.storageManager.getValue<NativeMethod>(hash, null);
            
            if (nativeMethod) {
            this.cache.set(hash, nativeMethod);
            return nativeMethod;
            }
        }

        return this.cache.get(hash) as NativeMethod;
    }

    public on(event: EVENT, cb: (data: any) => void) {
        this.events[event] = cb;

        return this;
    }

    public trigger(event: EVENT, ...args: any[]) {
        if (this.events[event]) this.events[event](...args);
    }
}