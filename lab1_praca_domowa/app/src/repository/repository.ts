import { Parent } from '../entities/parent';

export interface Repository {
    getStoreName(): string;

    connect(): Promise<void>;
    disconnect(): Promise<void>;
    clear(): Promise<void>;

    saveMany(items: Parent[]): Promise<void>;
    getMany(ids: string[]): Promise<Parent[]>;
    updateMany(items: Parent[]): Promise<void>;
    deleteMany(ids: string[]): Promise<void>;
}
