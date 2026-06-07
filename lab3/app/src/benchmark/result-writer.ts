import { appendFile, writeFile } from 'fs/promises';

export class ResultWriter {
    private readonly filePath: string;

    constructor(props: { filePath?: string } = {}) {
        this.filePath = props.filePath ?? 'Wyniki_Cassandra.txt';
    }

    public async clear() {
        await writeFile(this.filePath, '', 'utf8');
    }

    public async append(storeName: string, operationName: string, timeInMilliseconds: number) {
        await appendFile(
            this.filePath,
            `${storeName};${operationName};${timeInMilliseconds};\n`,
            'utf8'
        );
    }
}
