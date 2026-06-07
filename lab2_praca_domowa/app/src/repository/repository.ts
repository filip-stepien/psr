import { Route } from '../entities/route';

export interface Repository {
    getStoreName(): string;

    connect(): Promise<void>;
    disconnect(): Promise<void>;
    clear(): Promise<void>;

    saveMany(items: Route[]): Promise<void>;
    getMany(ids: string[]): Promise<Route[]>;
    updateMany(items: Route[]): Promise<void>;
    deleteMany(ids: string[]): Promise<void>;
}
