export class Stop {
    public id: string;
    public location: string;
    public estimatedArrival: string;
    public status: string;

    constructor(props: { id: string; location: string; estimatedArrival: string; status: string }) {
        this.id = props.id;
        this.location = props.location;
        this.estimatedArrival = props.estimatedArrival;
        this.status = props.status;
    }
}
