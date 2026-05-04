import path from 'path';
import { fileURLToPath } from 'url';
import envVar from 'env-var';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __root = path.join(__dirname, '..');

export const env = {
    hazelcastMapName: envVar.get('HAZELCAST_MAP_NAME').default('cinema').asString(),
    hazelcastClusterName: envVar.get('HAZELCAST_CLUSTER_NAME').default('dev').asString(),
    hazelcastMembers: envVar
        .get('HAZELCAST_MEMBERS')
        .default('127.0.0.1:5701')
        .asArray()
        .map(member => member.trim())
        .filter(Boolean),
    recordsCount: envVar.get('RECORDS_COUNT').default(1000).asIntPositive(),
    ticketsPerViewer: envVar.get('TICKETS_PER_VIEWER').default(5).asIntPositive(),
    resultFilePath: path.resolve(
        __root,
        envVar.get('RESULT_FILE_PATH').default('../Wyniki_Hazelcast.txt').asString()
    )
};
