import { Client, concurrent, types } from 'cassandra-driver';
import { Child } from '../entities/child';
import { Parent } from '../entities/parent';
import { Repository } from './repository';

interface ChildUdt {
    id: types.Uuid;
    name: string;
    value: string;
    created_at: string;
}

interface ParentRow {
    id: types.Uuid;
    name: string;
    description: string;
    children: ChildUdt[] | null;
}

export class CassandraRepository implements Repository {
    private readonly contactPoints: string[];
    private readonly localDataCenter: string;
    private readonly keyspace: string;
    private readonly tableName: string;
    private client?: Client;

    constructor(
        props: {
            contactPoints?: string[];
            localDataCenter?: string;
            keyspace?: string;
            table?: string;
        } = {}
    ) {
        this.contactPoints = props.contactPoints ?? ['127.0.0.1'];
        this.localDataCenter = props.localDataCenter ?? 'datacenter1';
        this.keyspace = props.keyspace ?? 'psr';
        this.tableName = props.table ?? 'parents';
    }

    private getClient(): Client {
        if (!this.client) {
            throw new Error('Cassandra client is not initialized. Call connect() first.');
        }
        return this.client;
    }

    private toChildUdt(child: Child): ChildUdt {
        return {
            id: types.Uuid.fromString(child.id),
            name: child.name,
            value: child.value,
            created_at: child.createdAt
        };
    }

    private toParent(row: ParentRow): Parent {
        return new Parent({
            id: row.id.toString(),
            name: row.name,
            description: row.description,
            children: (row.children ?? []).map(
                child =>
                    new Child({
                        id: child.id.toString(),
                        name: child.name,
                        value: child.value,
                        createdAt: child.created_at
                    })
            )
        });
    }

    public getStoreName(): string {
        return this.tableName;
    }

    public async connect(): Promise<void> {
        const bootstrap = new Client({
            contactPoints: this.contactPoints,
            localDataCenter: this.localDataCenter
        });
        await bootstrap.connect();
        await bootstrap.execute(
            `CREATE KEYSPACE IF NOT EXISTS ${this.keyspace} ` +
                `WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}`
        );
        await bootstrap.shutdown();

        this.client = new Client({
            contactPoints: this.contactPoints,
            localDataCenter: this.localDataCenter,
            keyspace: this.keyspace
        });
        await this.client.connect();

        await this.client.execute(
            `CREATE TYPE IF NOT EXISTS child ` +
                `(id uuid, name text, value text, created_at text)`
        );
        await this.client.execute(
            `CREATE TABLE IF NOT EXISTS ${this.tableName} ` +
                `(id uuid PRIMARY KEY, name text, description text, children list<frozen<child>>)`
        );
    }

    public async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.shutdown();
        }
    }

    public async clear(): Promise<void> {
        await this.getClient().execute(`TRUNCATE ${this.tableName}`);
    }

    public async saveMany(items: Parent[]): Promise<void> {
        const query =
            `INSERT INTO ${this.tableName} (id, name, description, children) ` +
            `VALUES (?, ?, ?, ?)`;

        const parameters = items.map(item => [
            types.Uuid.fromString(item.id),
            item.name,
            item.description,
            item.children.map(child => this.toChildUdt(child))
        ]);

        await concurrent.executeConcurrent(this.getClient(), query, parameters);
    }

    public async getMany(ids: string[]): Promise<Parent[]> {
        const query = `SELECT id, name, description, children FROM ${this.tableName} WHERE id IN ?`;
        const uuids = ids.map(id => types.Uuid.fromString(id));

        const result = await this.getClient().execute(query, [uuids], { prepare: true });

        return result.rows.map(row => this.toParent(row as unknown as ParentRow));
    }

    public async updateMany(items: Parent[]): Promise<void> {
        await this.saveMany(items);
    }

    public async deleteMany(ids: string[]): Promise<void> {
        const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
        const parameters = ids.map(id => [types.Uuid.fromString(id)]);

        await concurrent.executeConcurrent(this.getClient(), query, parameters);
    }
}
