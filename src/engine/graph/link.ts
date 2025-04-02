import { Point } from '../../math/point'
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
}
