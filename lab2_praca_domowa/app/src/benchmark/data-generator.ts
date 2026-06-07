import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { Route } from '../entities/route';
import { Stop } from '../entities/stop';

export class DataGenerator {
    private readonly generatedIds: string[] = [];

    private generateStops(stopsPerRoute: number) {
        const stops: Stop[] = [];

        for (let i = 0; i < stopsPerRoute; i++) {
            stops.push(
                new Stop({
                    id: randomUUID(),
                    location: faker.location.streetAddress(),
                    estimatedArrival: faker.date.soon().toISOString(),
                    status: faker.helpers.arrayElement(['pending', 'arrived', 'departed', 'delayed'])
                })
            );
        }

        return stops;
    }

    public generateRoutes(count: number, stopsPerRoute: number) {
        this.generatedIds.length = 0;
        const routes: Route[] = [];

        for (let i = 0; i < count; i++) {
            const id = `routes/${randomUUID()}`;
            this.generatedIds.push(id);

            routes.push(
                new Route({
                    id,
                    origin: faker.location.city(),
                    destination: faker.location.city(),
                    stops: this.generateStops(stopsPerRoute)
                })
            );
        }

        return routes;
    }

    public generateRouteIds() {
        return [...this.generatedIds];
    }
}
