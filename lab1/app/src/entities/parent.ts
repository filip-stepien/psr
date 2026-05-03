import { Child } from './child';

export class Parent {
    public id: string;
    public name: string;
    public description: string;
    public children: Child[];

    constructor(props: { id: string; name: string; description: string; children: Child[] }) {
        this.id = props.id;
        this.name = props.name;
        this.description = props.description;
        this.children = props.children;
    }
}
