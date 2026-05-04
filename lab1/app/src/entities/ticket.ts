export class Ticket {
    public id: string;
    public movie: string;
    public seat: number;
    public price: string;
    public purchasedAt: string;

    constructor(props: {
        id: string;
        movie: string;
        seat: number;
        price: string;
        purchasedAt: string;
    }) {
        this.id = props.id;
        this.movie = props.movie;
        this.seat = props.seat;
        this.price = props.price;
        this.purchasedAt = props.purchasedAt;
    }
}
