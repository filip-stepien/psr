import {
    CreateDatabaseOperation,
    DeleteByQueryOperation,
    DocumentStore,
    GetDatabaseRecordOperation,
    IDocumentStore
} from 'ravendb';
import { Route } from '../entities/route';
import { Stop } from '../entities/stop';
import { Repository } from './repository';

export class RavenRepository implements Repository {
    private readonly urls: string[];
    private readonly databaseName: string;
    private readonly collectionName: string;
    private store?: IDocumentStore;

    constructor(props: { urls?: string[]; database?: string; collection?: string } = {}) {
        this.urls = props.urls ?? ['http://127.0.0.1:8080'];
        this.databaseName = props.database ?? 'psr';
        this.collectionName = props.collection ?? 'routes';
    }

    private getStore(): IDocumentStore {
        if (!this.store) {
            throw new Error('RavenDB store is not initialized. Call connect() first.');
        }
        return this.store;
    }

    private async ensureDatabaseExists(): Promise<void> {
        const store = this.getStore();
        const record = await store.maintenance.server.send(
            new GetDatabaseRecordOperation(this.databaseName)
        );

        if (!record) {
            await store.maintenance.server.send(
                new CreateDatabaseOperation({ databaseName: this.databaseName })
            );
        }
    }

    public getStoreName(): string {
        return this.collectionName;
    }

    public async connect(): Promise<void> {
        const store = new DocumentStore(this.urls, this.databaseName);
        store.conventions.findCollectionName = () => this.collectionName;
        store.initialize();
        this.store = store;

        await this.ensureDatabaseExists();
    }

    public async disconnect(): Promise<void> {
        if (this.store) {
            this.store.dispose();
        }
    }

    public async clear(): Promise<void> {
        const operation = await this.getStore().operations.send(
            new DeleteByQueryOperation(`from ${this.collectionName}`)
        );
        await operation.waitForCompletion();
    }

    public async saveMany(items: Route[]): Promise<void> {
        const bulkInsert = this.getStore().bulkInsert();

        try {
            for (const item of items) {
                await bulkInsert.store(item, item.id);
            }
        } finally {
            await bulkInsert.finish();
        }
    }

    public async getMany(ids: string[]): Promise<Route[]> {
        const session = this.getStore().openSession();

        try {
            const loaded = await session.load<Omit<Route, 'id'>>(ids);

            return ids.map(id => {
                const doc = loaded[id];

                if (!doc) {
                    throw new Error(`Document with id ${id} was not found.`);
                }

                return new Route({
                    id,
                    origin: doc.origin,
                    destination: doc.destination,
                    stops: doc.stops.map(stop => new Stop(stop))
                });
            });
        } finally {
            session.dispose();
        }
    }

    public async updateMany(items: Route[]): Promise<void> {
        const session = this.getStore().openSession();

        try {
            for (const item of items) {
                await session.store(item, item.id);
            }
            await session.saveChanges();
        } finally {
            session.dispose();
        }
    }

    public async deleteMany(ids: string[]): Promise<void> {
        const session = this.getStore().openSession();

        try {
            for (const id of ids) {
                session.delete(id);
            }
            await session.saveChanges();
        } finally {
            session.dispose();
        }
    }
}
