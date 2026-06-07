import { Stop } from './stop';

export class Route {
    public id: string;
    public origin: string;
    public destination: string;
    public stops: Stop[];

    constructor(props: { id: string; origin: string; destination: string; stops: Stop[] }) {
        this.id = props.id;
        this.origin = props.origin;
        this.destination = props.destination;
        this.stops = props.stops;
    }
}
