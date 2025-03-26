import { Directions } from './directions'

export class Card {
    private readonly _id: string
    private readonly _direction: Directions

    public constructor(id: string, direction: Directions) {
        this._id = id
        this._direction = direction
    }

    public get direction(): Directions {
        return this._direction
    }

    public get id(): string {
        return this._id
    }
}
