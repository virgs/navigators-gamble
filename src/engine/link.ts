import { Vertix } from './vertix'

export class Link {
    private readonly first: Vertix
    private readonly second: Vertix
    private readonly id: string

    constructor(first: Vertix, second: Vertix) {
        this.first = first
        this.second = second
        this.id = `${first.getId()}-${second.getId()}`
        console.log(`Link created '${this.id}': ${this.first.getId()} <-> ${this.second.getId()}`)
    }

    public getVertices(): Vertix[] {
        return [this.first, this.second]
    }
}
