import { performance } from 'perf_hooks';
import { Repository } from '../repository/repository';
import { DataGenerator } from './data-generator';
import { ResultWriter } from './result-writer';

export class Benchmark {
    private readonly recordsCount: number;
    private readonly ticketsPerViewer: number;
    private readonly repository: Repository;
    private readonly dataGenerator: DataGenerator;
    private readonly resultWriter: ResultWriter;

    constructor(props: {
        repository: Repository;
        dataGenerator: DataGenerator;
        resultWriter: ResultWriter;
        recordsCount: number;
        ticketsPerViewer: number;
    }) {
        this.repository = props.repository;
        this.dataGenerator = props.dataGenerator;
        this.resultWriter = props.resultWriter;
        this.recordsCount = props.recordsCount;
        this.ticketsPerViewer = props.ticketsPerViewer;
    }

    private createData() {
        return this.dataGenerator.generateViewers(this.recordsCount, this.ticketsPerViewer);
    }

    private async seedData() {
        await this.repository.clear();

        const data = this.createData();
        await this.repository.saveMany(data);

        return data;
    }

    private async measure(operationName: string, operation: () => Promise<void>) {
        const start = performance.now();
        await operation();
        const end = performance.now();

        const timeInMilliseconds = Math.round(end - start);
        const appendedLine = await this.resultWriter.append(
            this.repository.getStoreName(),
            operationName,
            timeInMilliseconds
        );

        console.log(appendedLine);
    }

    public async runSave() {
        await this.repository.clear();
        await this.measure('save', async () => {
            await this.repository.saveMany(this.createData());
        });
    }

    public async runGet() {
        await this.seedData();

        const ids = this.dataGenerator.generateViewerIds(this.recordsCount);

        await this.measure('select', async () => {
            const items = await this.repository.getMany(ids);

            if (items.length !== this.recordsCount) {
                throw new Error(`Expected ${this.recordsCount} records, got ${items.length}.`);
            }
        });
    }

    public async runUpdate() {
        const data = await this.seedData();
        const updatedData = this.dataGenerator.generateUpdatedViewers(data);

        await this.measure('update', async () => {
            await this.repository.updateMany(updatedData);
        });
    }

    public async runDelete() {
        await this.seedData();

        const ids = this.dataGenerator.generateViewerIds(this.recordsCount);

        await this.measure('delete', async () => {
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
