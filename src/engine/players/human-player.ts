import { emitVisibleHandMakeMoveCommand, usePlayerMadeMoveEventListener } from '../../events/events'
import { generateUID } from '../../math/generate-id'
import { Card } from '../card'
import { Directions } from '../directions'
import { PlayerType } from '../game-configuration/player-type'
import { Move } from '../score-calculator/move'
import { Player } from './player'

export class HumanPlayer implements Player {
    private readonly _id: string
    private readonly _cards: Card[]
    private readonly _movePromises: Record<string, (value: Move | PromiseLike<Move>) => void>
    private _score: number = 0

    public constructor(id: string, cards: Card[]) {
        this._id = id
        this._cards = cards
        this._score = 0
        this._cards.forEach((card) => card.reveal())
        this._cards.sort((a, b) => a.direction - b.direction)
        this._movePromises = {}

        usePlayerMadeMoveEventListener((event) => {
            if (event.playerId === this._id) {
                const cardPosition = this._cards.findIndex((card) => card.id === event.cardId)
                if (cardPosition === -1) {
                    throw new Error(`Card with id ${event.cardId} not found in player ${this._id} cards`)
                }
                this._cards.splice(cardPosition, 1)
                this._movePromises[event.moveId!](event)
                delete this._movePromises[event.moveId!]
            }
        })
    }

    public get type() {
        return PlayerType.HUMAN
    }

    public get id(): string {
        return this._id
    }
    public get score(): number {
        return this._score
    }

    public get cards(): Card[] {
        return this._cards
    }

    public addScore(score: number): void {
        this._score += score
    }

    public finish(): void {}

    public async makeMove(): Promise<Move> {
        const id = generateUID()
        emitVisibleHandMakeMoveCommand({
            playerId: this.id,
            id: id,
        })
        return new Promise<Move>((resolve) => {
            this._movePromises[id] = resolve
        })
    }

    public drawCard(card: Card): void {
        console.log(`Player ${this.id} got card: ${Directions[card.direction]}`)
        card.reveal()
        this._cards.push(card)
    }
}
