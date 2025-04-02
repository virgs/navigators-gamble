import { Directions } from './directions'

export class Card {
    private readonly _id: string
    private readonly _direction: Directions
    private _ownerId?: string | undefined
    private hidden: boolean

    public constructor(id: string, direction: Directions) {
        this._id = id
        this._direction = direction
        this.hidden = true
    }

    public get direction(): Directions {
        return this._direction
    }

    public get id(): string {
        return this._id
    }

    public get covered(): boolean {
        return this.hidden
    }

    public get ownerId(): string | undefined {
        return this._ownerId
    }
    public set ownerId(value: string | undefined) {
        this._ownerId = value
    }

    public reveal() {
        this.hidden = false
    }
}
