import { ExitPromptError } from '@inquirer/core';
import { select } from '@inquirer/prompts';
import { Benchmark } from '../benchmark/benchmark';

export class Menu {
    private readonly benchmark: Benchmark;
    private readonly recordsCount: number;

    constructor(props: { benchmark: Benchmark; recordsCount: number }) {
        this.benchmark = props.benchmark;
        this.recordsCount = props.recordsCount;
    }

    private getChoices() {
        return [
            { name: `Zapisz ${this.recordsCount} danych`, value: 'save' },
            { name: `Pobierz ${this.recordsCount} danych`, value: 'get' },
            { name: `Zaktualizuj ${this.recordsCount} danych`, value: 'update' },
            { name: `Usun ${this.recordsCount} danych`, value: 'delete' },
            { name: 'Uruchom caly benchmark', value: 'all' },
            { name: 'Wyjscie', value: 'exit' }
        ] as const;
    }

    private async selectOption() {
        try {
            return await select({
                message: 'Wybierz operacje',
                choices: this.getChoices(),
                theme: {
                    indexMode: 'number'
                }
            });
        } catch (error) {
            if (error instanceof ExitPromptError) {
                return 'exit';
            }

            throw error;
        }
    }

    public async start() {
        let shouldRun = true;

        while (shouldRun) {
            const option = await this.selectOption();

            switch (option) {
                case 'save':
                    await this.benchmark.runSave();
                    break;
                case 'get':
                    await this.benchmark.runGet();
                    break;
                case 'update':
                    await this.benchmark.runUpdate();
                    break;
                case 'delete':
                    await this.benchmark.runDelete();
                    break;
                case 'all':
                    await this.benchmark.runAll();
                    break;
                case 'exit':
                    shouldRun = false;
                    break;
            }
        }
    }
}
