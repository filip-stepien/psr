import path from 'path';
import { fileURLToPath } from 'url';
import envVar from 'env-var';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __root = path.join(__dirname, '..');

export const env = {
    memcachedServers: envVar.get('MEMCACHED_SERVERS').default('127.0.0.1:11211').asString(),
    memcachedStoreName: envVar.get('MEMCACHED_STORE_NAME').default('parents').asString(),
    recordsCount: envVar.get('RECORDS_COUNT').default(1000).asIntPositive(),
    childrenPerParent: envVar.get('CHILDREN_PER_PARENT').default(5).asIntPositive(),
    resultFilePath: path.resolve(
        __root,
        envVar.get('RESULT_FILE_PATH').default('../Wyniki_Memcached.txt').asString()
    )
};
