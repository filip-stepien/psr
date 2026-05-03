import { Client, IMap } from 'hazelcast-client';
import { Child } from '../entities/child';
import { Parent } from '../entities/parent';
import { Repository } from './repository';

export class HazelcastRepository implements Repository {
    private readonly mapName: string;
    private readonly clusterName: string;
    private readonly clusterMembers: string[];
    private client?: InstanceType<typeof Client>;
    private map?: IMap<string, string>;

    constructor(props: { mapName?: string; clusterName?: string; clusterMembers?: string[] } = {}) {
        this.mapName = props.mapName ?? 'parents';
        this.clusterName = props.clusterName ?? 'dev';
        this.clusterMembers = props.clusterMembers ?? ['127.0.0.1:5701'];
    }

    private getMap() {
        if (!this.map) {
            throw new Error('Hazelcast map is not initialized. Call connect() first.');
        }

        return this.map;
    }

    private serialize(parent: Parent) {
        return JSON.stringify(parent);
    }

    private deserialize(value: string) {
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

    public getStoreName() {
        return this.mapName;
    }

    public async connect() {
        this.client = await Client.newHazelcastClient({
            clusterName: this.clusterName,
            network: { clusterMembers: this.clusterMembers },
            properties: { 'hazelcast.logging.level': 'OFF' }
        });

        this.map = await this.client.getMap<string, string>(this.mapName);
    }

    public async disconnect() {
        if (this.client) {
            await this.client.shutdown();
        }
    }

    public async clear() {
        await this.getMap().clear();
    }

    public async saveMany(items: Parent[]) {
        await Promise.all(items.map(item => this.getMap().put(item.id, this.serialize(item))));
    }

    public async getMany(ids: string[]) {
        const values = await Promise.all(ids.map(id => this.getMap().get(id)));
        return values.map(value => this.deserialize(value));
    }

    public async updateMany(items: Parent[]) {
        await this.saveMany(items);
    }

    public async deleteMany(ids: string[]) {
        await Promise.all(ids.map(id => this.getMap().remove(id)));
    }
}
