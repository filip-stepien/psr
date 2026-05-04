import { Viewer } from '../entities/viewer';

export interface Repository {
    getStoreName(): string;

    connect(): Promise<void>;
    disconnect(): Promise<void>;
    clear(): Promise<void>;

    saveMany(items: Viewer[]): Promise<void>;
    getMany(ids: string[]): Promise<Viewer[]>;
    updateMany(items: Viewer[]): Promise<void>;
    deleteMany(ids: string[]): Promise<void>;
}
