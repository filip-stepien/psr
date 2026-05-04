import { faker } from '@faker-js/faker';
import { Ticket } from '../entities/ticket';
import { Viewer } from '../entities/viewer';

export class DataGenerator {
    private getViewerId(index: number) {
        return `viewer:${index}`;
    }

    private getTicketId(viewerIndex: number, ticketIndex: number) {
        return `ticket:${viewerIndex}:${ticketIndex}`;
    }

    private getRandomTicketData(): Omit<Ticket, 'id'> {
        return {
            movie: faker.book.title(),
            seat: faker.number.int({ min: 1, max: 100 }),
            price: faker.commerce.price(),
            purchasedAt: faker.date.anytime().toString()
        };
    }

    private getRandomViewerData(): Omit<Viewer, 'id' | 'tickets'> {
        return {
            name: faker.person.fullName(),
            email: faker.internet.email()
        };
    }

    private generateTickets(viewerIndex: number, ticketsPerViewer: number) {
        const tickets: Ticket[] = [];

        for (let ticketIndex = 1; ticketIndex <= ticketsPerViewer; ticketIndex++) {
            tickets.push(
                new Ticket({
                    ...this.getRandomTicketData(),
                    id: this.getTicketId(viewerIndex, ticketIndex)
                })
            );
        }

        return tickets;
    }

    public generateViewers(count: number, ticketsPerViewer: number) {
        const viewers: Viewer[] = [];

        for (let viewerIndex = 1; viewerIndex <= count; viewerIndex++) {
            viewers.push(
                new Viewer({
                    ...this.getRandomViewerData(),
                    id: this.getViewerId(viewerIndex),
                    tickets: this.generateTickets(viewerIndex, ticketsPerViewer)
                })
            );
        }

        return viewers;
    }

    public generateUpdatedViewers(viewers: Viewer[]) {
        return viewers.map(
            viewer =>
                new Viewer({
                    ...this.getRandomViewerData(),
                    id: viewer.id,
                    tickets: viewer.tickets.map(
                        ticket => new Ticket({ ...this.getRandomTicketData(), id: ticket.id })
                    )
                })
        );
    }

    public generateViewerIds(count: number) {
        const ids: string[] = [];

        for (let index = 1; index <= count; index++) {
            ids.push(this.getViewerId(index));
        }

        return ids;
    }
}
