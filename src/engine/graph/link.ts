import { Vertix } from './vertix'

export class Link {
    private readonly first: Vertix
    private readonly second: Vertix
    private readonly _id: string

    constructor(first: Vertix, second: Vertix) {
        this.first = first
        this.second = second
        this._id = `${first.id}-${second.id}`
    }

    public get id(): string {
        return this._id
    }

    public getVertices(): Vertix[] {
        return [this.first, this.second]
    }

    public get length(): number {
        const xDistance = this.first.position.x - this.second.position.x
        const yDistance = this.first.position.y - this.second.position.y
        return Math.sqrt(xDistance * xDistance + yDistance * yDistance)
    }

    public get inclination(): number {
        const xDistance = this.first.position.x - this.second.position.x
        const yDistance = this.first.position.y - this.second.position.y
        return Math.atan(yDistance / xDistance)
    }
}
