import { Benchmark } from './benchmark/benchmark';
import { DataGenerator } from './benchmark/data-generator';
import { ResultWriter } from './benchmark/result-writer';
import { env } from './env';
import { RavenRepository } from './repository/raven-repository';
import { Menu } from './ui/menu';

async function main() {
    const repository = new RavenRepository({
        urls: env.ravenUrls,
        database: env.ravenDatabase,
        collection: env.ravenCollection
    });

    const benchmark = new Benchmark({
        repository,
        dataGenerator: new DataGenerator(),
        resultWriter: new ResultWriter({ filePath: env.resultFilePath }),
        recordsCount: env.recordsCount,
        stopsPerRoute: env.stopsPerRoute
    });

    const menu = new Menu({ benchmark, recordsCount: env.recordsCount });

    await repository.connect();

    try {
        await menu.start();
    } finally {
        await repository.disconnect();
    }
}

main();
