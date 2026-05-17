import { MongoClient, Collection, ObjectId } from 'mongodb';
import { Child } from '../entities/child';
import { Parent } from '../entities/parent';
import { Repository } from './repository';

type WithObjectId<T extends { id: string }> = Omit<T, 'id'> & { _id: ObjectId };

export class MongoRepository implements Repository {
    private readonly url: string;
    private readonly databaseName: string;
    private readonly collectionName: string;
    private client?: MongoClient;
    private collection?: Collection<WithObjectId<Parent>>;

    constructor(props: { url?: string; database?: string; collection?: string } = {}) {
        this.url = props.url ?? 'mongodb://127.0.0.1:27017';
        this.databaseName = props.database ?? 'psr';
        this.collectionName = props.collection ?? 'parents';
    }

    private getCollection(): Collection<WithObjectId<Parent>> {
        if (!this.collection) {
            throw new Error('MongoDB collection is not initialized. Call connect() first.');
        }
        return this.collection;
    }

    public getStoreName(): string {
        return this.collectionName;
    }

    public async connect(): Promise<void> {
        this.client = new MongoClient(this.url);
        await this.client.connect();
        this.collection = this.client
            .db(this.databaseName)
            .collection<WithObjectId<Parent>>(this.collectionName);
    }

    public async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
        }
    }

    public async clear(): Promise<void> {
        await this.getCollection().deleteMany({});
    }

    public async saveMany(items: Parent[]): Promise<void> {
        const docs = items.map(({ id, ...fields }) => ({ _id: new ObjectId(id), ...fields }));
        await this.getCollection().insertMany(docs);
    }

    public async getMany(ids: string[]): Promise<Parent[]> {
        const objectIds = ids.map(id => new ObjectId(id));
        const docs = await this.getCollection()
            .find({ _id: { $in: objectIds } })
            .toArray();

        return docs.map(
            ({ _id, name, description, children }) =>
                new Parent({
                    id: _id.toHexString(),
                    name,
                    description,
                    children: children.map(c => new Child(c))
                })
        );
    }

    public async updateMany(items: Parent[]): Promise<void> {
        await Promise.all(
            items.map(({ id, ...fields }) =>
                this.getCollection().replaceOne({ _id: new ObjectId(id) }, fields)
            )
        );
    }

    public async deleteMany(ids: string[]): Promise<void> {
        const objectIds = ids.map(id => new ObjectId(id));
        await this.getCollection().deleteMany({ _id: { $in: objectIds } });
    }
}
