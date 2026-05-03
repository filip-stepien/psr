import { Benchmark } from './benchmark/benchmark';
import { DataGenerator } from './benchmark/data-generator';
import { ResultWriter } from './benchmark/result-writer';
import { env } from './env';
import { HazelcastRepository } from './repository/hazelcast-repository';
import { Menu } from './ui/menu';

async function main() {
    const repository = new HazelcastRepository({
        mapName: env.hazelcastMapName,
        clusterName: env.hazelcastClusterName,
        clusterMembers: env.hazelcastMembers
    });

    const benchmark = new Benchmark({
        repository,
        dataGenerator: new DataGenerator(),
        resultWriter: new ResultWriter({ filePath: env.resultFilePath }),
        recordsCount: env.recordsCount,
        childrenPerParent: env.childrenPerParent
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
