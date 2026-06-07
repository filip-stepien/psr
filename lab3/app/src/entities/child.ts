export class Child {
    public id: string;
    public name: string;
    public value: string;
    public createdAt: string;

    constructor(props: { id: string; name: string; value: string; createdAt: string }) {
        this.id = props.id;
        this.name = props.name;
        this.value = props.value;
        this.createdAt = props.createdAt;
    }
}
