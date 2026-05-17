import path from 'path';
import { fileURLToPath } from 'url';
import envVar from 'env-var';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __root = path.join(__dirname, '..');

export const env = {
    mongoUrl: envVar.get('MONGO_URL').default('mongodb://127.0.0.1:27017').asString(),
    mongoDatabase: envVar.get('MONGO_DATABASE').default('psr').asString(),
    mongoCollection: envVar.get('MONGO_COLLECTION').default('parents').asString(),
    recordsCount: envVar.get('RECORDS_COUNT').default(1000).asIntPositive(),
    childrenPerParent: envVar.get('CHILDREN_PER_PARENT').default(5).asIntPositive(),
    resultFilePath: path.resolve(
        __root,
        envVar.get('RESULT_FILE_PATH').default('../Wyniki_MongoDB.txt').asString()
    )
};
