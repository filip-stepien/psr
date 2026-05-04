import { Ticket } from './ticket';

export class Viewer {
    public id: string;
    public name: string;
    public email: string;
    public tickets: Ticket[];

    constructor(props: { id: string; name: string; email: string; tickets: Ticket[] }) {
        this.id = props.id;
        this.name = props.name;
        this.email = props.email;
        this.tickets = props.tickets;
    }
}
