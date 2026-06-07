import path from 'path';
import { fileURLToPath } from 'url';
import envVar from 'env-var';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __root = path.join(__dirname, '..');

export const env = {
    ravenUrls: envVar.get('RAVEN_URLS').default('http://127.0.0.1:8080').asArray(),
    ravenDatabase: envVar.get('RAVEN_DATABASE').default('psr').asString(),
    ravenCollection: envVar.get('RAVEN_COLLECTION').default('routes').asString(),
    recordsCount: envVar.get('RECORDS_COUNT').default(1000).asIntPositive(),
    stopsPerRoute: envVar.get('STOPS_PER_ROUTE').default(5).asIntPositive(),
    resultFilePath: path.resolve(
        __root,
        envVar.get('RESULT_FILE_PATH').default('../Wyniki_RavenDB.txt').asString()
    )
};
