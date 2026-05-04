import { Client, IMap } from 'hazelcast-client';
import { Ticket } from '../entities/ticket';
import { Viewer } from '../entities/viewer';
import { Repository } from './repository';

export class HazelcastRepository implements Repository {
    private readonly mapName: string;
    private readonly clusterName: string;
    private readonly clusterMembers: string[];
    private client?: InstanceType<typeof Client>;
    private map?: IMap<string, string>;

    constructor(props: { mapName?: string; clusterName?: string; clusterMembers?: string[] } = {}) {
        this.mapName = props.mapName ?? 'dev-map';
        this.clusterName = props.clusterName ?? 'dev';
        this.clusterMembers = props.clusterMembers ?? ['127.0.0.1:5701'];
    }

    private getMap() {
        if (!this.map) {
            throw new Error('Hazelcast map is not initialized. Call connect() first.');
        }

        return this.map;
    }

    private serialize(viewer: Viewer) {
        return JSON.stringify(viewer);
    }

    private deserialize(value: string) {
        const parsed = JSON.parse(value) as Viewer;

        return new Viewer({
            id: parsed.id,
            name: parsed.name,
            email: parsed.email,
            tickets: parsed.tickets.map(ticket => new Ticket({ ...ticket }))
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

    public async saveMany(items: Viewer[]) {
        await Promise.all(items.map(item => this.getMap().put(item.id, this.serialize(item))));
    }

    public async getMany(ids: string[]) {
        const values = await Promise.all(ids.map(id => this.getMap().get(id)));
        return values.map(value => this.deserialize(value));
    }

    public async updateMany(items: Viewer[]) {
        await this.saveMany(items);
    }

    public async deleteMany(ids: string[]) {
        await Promise.all(ids.map(id => this.getMap().remove(id)));
    }
}
