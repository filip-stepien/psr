import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { Child } from '../entities/child';
import { Parent } from '../entities/parent';

export class DataGenerator {
    private readonly generatedIds: string[] = [];

    private generateChildren(childrenPerParent: number) {
        const children: Child[] = [];

        for (let i = 0; i < childrenPerParent; i++) {
            children.push(
                new Child({
                    id: randomUUID(),
                    name: faker.commerce.productName(),
                    value: faker.commerce.price(),
                    createdAt: faker.date.recent().toISOString()
                })
            );
        }

        return children;
    }

    public generateParents(count: number, childrenPerParent: number) {
        this.generatedIds.length = 0;
        const parents: Parent[] = [];

        for (let i = 0; i < count; i++) {
            const id = randomUUID();
            this.generatedIds.push(id);

            parents.push(
                new Parent({
                    id,
                    name: faker.person.fullName(),
                    description: faker.lorem.sentence(),
                    children: this.generateChildren(childrenPerParent)
                })
            );
        }

        return parents;
    }

    public generateParentIds() {
        return [...this.generatedIds];
    }
}
