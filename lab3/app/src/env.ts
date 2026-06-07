import path from 'path';
import { fileURLToPath } from 'url';
import envVar from 'env-var';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __root = path.join(__dirname, '..');

export const env = {
    cassandraContactPoints: envVar
        .get('CASSANDRA_CONTACT_POINTS')
        .default('127.0.0.1')
        .asArray(),
    cassandraLocalDataCenter: envVar
        .get('CASSANDRA_LOCAL_DATACENTER')
        .default('datacenter1')
        .asString(),
    cassandraKeyspace: envVar.get('CASSANDRA_KEYSPACE').default('psr').asString(),
    cassandraTable: envVar.get('CASSANDRA_TABLE').default('parents').asString(),
    recordsCount: envVar.get('RECORDS_COUNT').default(1000).asIntPositive(),
    childrenPerParent: envVar.get('CHILDREN_PER_PARENT').default(5).asIntPositive(),
    resultFilePath: path.resolve(
        __root,
        envVar.get('RESULT_FILE_PATH').default('../Wyniki_Cassandra.txt').asString()
    )
};
