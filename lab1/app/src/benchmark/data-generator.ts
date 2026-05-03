import { faker } from '@faker-js/faker';
import { Child } from '../entities/child';
import { Parent } from '../entities/parent';

export class DataGenerator {
    private getParentId(index: number) {
        return `parent-${index}`;
    }

    private generateChildren(parentIndex: number, childrenPerParent: number) {
        const children: Child[] = [];

        for (let childIndex = 1; childIndex <= childrenPerParent; childIndex++) {
            children.push(
                new Child({
                    id: `child-${parentIndex}-${childIndex}`,
                    name: faker.commerce.productName(),
                    value: faker.commerce.price(),
                    createdAt: faker.date.recent().toISOString()
                })
            );
        }

        return children;
    }

    public generateParents(count: number, childrenPerParent: number) {
        const parents: Parent[] = [];

        for (let parentIndex = 1; parentIndex <= count; parentIndex++) {
            const children = this.generateChildren(parentIndex, childrenPerParent);

            parents.push(
                new Parent({
                    id: this.getParentId(parentIndex),
                    name: faker.person.fullName(),
                    description: faker.lorem.sentence(),
                    children
                })
            );
        }

        return parents;
    }

    public generateParentIds(count: number) {
        const ids: string[] = [];

        for (let index = 1; index <= count; index++) {
            ids.push(this.getParentId(index));
        }

        return ids;
    }
}
