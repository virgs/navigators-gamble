import { Point } from '../../math/point'
import { Directions } from '../directions'
import { Link } from './link'

export type LinkedVertix = {
    vertix: Vertix
    link: Link
}

export class Vertix {
    private readonly _id: string
    private readonly links: Link[]
    private readonly _position: Point
    private _ownerId?: string | undefined
    private _direction?: Directions | undefined

    public constructor(id: string, position: Point, ownerId?: string, direction?: Directions) {
        this._id = id
        this._position = position
        this._direction = direction
        this._ownerId = ownerId
        this.links = []
    }

    public get position(): Point {
        return this._position
    }

    public linkTo(vertix: Vertix): void {
        const link = new Link(this, vertix)
        this.links.push(link)
        vertix.links.push(link)
    }

    public getLinkTo(vertix: Vertix): Link | undefined {
        return this.links.find((link) => link.getVertices().includes(vertix))
    }

    public hasCardOn(): boolean {
        return this._direction !== undefined
    }

    public get direction(): Directions | undefined {
        return this._direction
    }
    public set direction(value: Directions | undefined) {
        this._direction = value
    }
    public get ownerId(): string | undefined {
        return this._ownerId
    }
    public set ownerId(value: string | undefined) {
        this._ownerId = value
    }

    public get id(): string {
        return this._id
    }

    public getLinkedVertices(): LinkedVertix[] {
        return this.links.map((link) => {
            const linkVertices = link.getVertices()
            return {
                vertix: linkVertices.find((linkVertix) => linkVertix.id !== this._id) as Vertix,
                link: link,
            }
        })
    }

    public getLinkedVerticesWithDirection(): LinkedVertix[] {
        return this.getLinkedVertices().filter((linkedVertix) => linkedVertix.vertix.direction !== undefined)
    }
}
