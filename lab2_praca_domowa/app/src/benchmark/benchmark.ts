import { performance } from 'perf_hooks';
import { Route } from '../entities/route';
import { Stop } from '../entities/stop';
import { Repository } from '../repository/repository';
import { DataGenerator } from './data-generator';
import { ResultWriter } from './result-writer';

export class Benchmark {
    private readonly recordsCount: number;
    private readonly stopsPerRoute: number;
    private readonly repository: Repository;
    private readonly dataGenerator: DataGenerator;
    private readonly resultWriter: ResultWriter;

    constructor(props: {
        repository: Repository;
        dataGenerator: DataGenerator;
        resultWriter: ResultWriter;
        recordsCount: number;
        stopsPerRoute: number;
    }) {
        this.repository = props.repository;
        this.dataGenerator = props.dataGenerator;
        this.resultWriter = props.resultWriter;
        this.recordsCount = props.recordsCount;
        this.stopsPerRoute = props.stopsPerRoute;
    }

    private createData() {
        return this.dataGenerator.generateRoutes(this.recordsCount, this.stopsPerRoute);
    }

    private async seedData() {
        await this.repository.clear();

        const data = this.createData();
        await this.repository.saveMany(data);

        return data;
    }

    private prepareUpdatedData(data: Route[]) {
        return data.map(
            route =>
                new Route({
                    id: route.id,
                    origin: `${route.origin} updated`,
                    destination: `${route.destination} updated`,
                    stops: route.stops.map(
                        stop =>
                            new Stop({
                                id: stop.id,
                                location: stop.location,
                                estimatedArrival: stop.estimatedArrival,
                                status: `${stop.status} updated`
                            })
                    )
                })
        );
    }

    private async measure(operationName: string, operation: () => Promise<void>) {
        const start = performance.now();
        await operation();
        const end = performance.now();

        const timeInMilliseconds = Math.round(end - start);

        await this.resultWriter.append(
            this.repository.getStoreName(),
            operationName,
            timeInMilliseconds
        );

        console.log(`${this.repository.getStoreName()};${operationName};${timeInMilliseconds};`);
    }

    public async runSave() {
        await this.repository.clear();
        await this.measure('zapis', async () => {
            await this.repository.saveMany(this.createData());
        });
    }

    public async runGet() {
        await this.seedData();

        const ids = this.dataGenerator.generateRouteIds();

        await this.measure('pobieranie', async () => {
            const items = await this.repository.getMany(ids);

            if (items.length !== this.recordsCount) {
                throw new Error(`Expected ${this.recordsCount} records, got ${items.length}.`);
            }
        });
    }

    public async runUpdate() {
        const data = await this.seedData();
        const updatedData = this.prepareUpdatedData(data);

        await this.measure('aktualizacja', async () => {
            await this.repository.updateMany(updatedData);
        });
    }

    public async runDelete() {
        await this.seedData();

        const ids = this.dataGenerator.generateRouteIds();

        await this.measure('kasowanie', async () => {
            await this.repository.deleteMany(ids);
        });
    }

    public async runAll() {
        await this.resultWriter.clear();
        await this.runSave();
        await this.runGet();
        await this.runUpdate();
        await this.runDelete();
    }
}
