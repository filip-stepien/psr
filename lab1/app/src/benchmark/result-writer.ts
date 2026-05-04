import { appendFile, writeFile } from 'fs/promises';

export class ResultWriter {
    private readonly filePath: string;

    constructor(props: { filePath?: string } = {}) {
        this.filePath = props.filePath ?? 'Wyniki_Hazelcast.txt';
    }

    public async clear() {
        await writeFile(this.filePath, '', 'utf8');
    }

    public async append(storeName: string, operationName: string, timeInMilliseconds: number) {
        const line = `${storeName};${operationName};${timeInMilliseconds}\n`;
        await appendFile(this.filePath, line, 'utf8');
        return line;
    }
}
