import Memjs from 'memjs';
import { Child } from '../entities/child';
import { Parent } from '../entities/parent';
import { Repository } from './repository';

export class MemcachedRepository implements Repository {
    private readonly storeName: string;
    private readonly servers: string;
    private client?: InstanceType<typeof Memjs.Client>;

    constructor(props: { storeName?: string; servers?: string } = {}) {
        this.storeName = props.storeName ?? 'parents';
        this.servers = props.servers ?? '127.0.0.1:11211';
    }

    private getClient() {
        if (!this.client) {
            throw new Error('Memcached client is not initialized. Call connect() first.');
        }
        return this.client;
    }

    private serialize(parent: Parent): string {
        return JSON.stringify(parent);
    }

    private deserialize(value: string): Parent {
        const parsed = JSON.parse(value) as Parent;
        return new Parent({
            id: parsed.id,
            name: parsed.name,
            description: parsed.description,
            children: parsed.children.map(
                child =>
                    new Child({
                        id: child.id,
                        name: child.name,
                        value: child.value,
                        createdAt: child.createdAt
                    })
            )
        });
    }

    public getStoreName(): string {
        return this.storeName;
    }

    public async connect(): Promise<void> {
        this.client = Memjs.Client.create(this.servers);
    }

    public async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.quit();
        }
    }

    public async clear(): Promise<void> {
        await this.getClient().flush();
    }

    public async saveMany(items: Parent[]): Promise<void> {
        await Promise.all(
            items.map(item => this.getClient().set(item.id, this.serialize(item), { expires: 0 }))
        );
    }

    public async getMany(ids: string[]): Promise<Parent[]> {
        const results = await Promise.all(ids.map(id => this.getClient().get(id)));
        return results.map(result => this.deserialize(result.value!.toString()));
    }

    public async updateMany(items: Parent[]): Promise<void> {
        await this.saveMany(items);
    }

    public async deleteMany(ids: string[]): Promise<void> {
        await Promise.all(ids.map(id => this.getClient().delete(id)));
    }
}
