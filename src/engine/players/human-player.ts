import { emitVisibleHandMakeMoveCommand, useVisibleVertixSelectedEventListener } from '../../events/events'
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
        // this._cards.sort((a, b) => a.direction - b.direction)
        this._movePromises = {}

        useVisibleVertixSelectedEventListener((event) => {
            if (event.playerId === this._id) {
                const cardPosition = this._cards.findIndex((card) => card.id === event.card.id)
                if (cardPosition === -1) {
                    throw new Error(
                        `Card with id ${event.card.id} not found in player ${this._id} cards: cards: ${this._cards.map((card) => card.id).join(', ')}`
                    )
                }
                this._cards.splice(cardPosition, 1)
                this._movePromises[event.moveId]({
                    cardIndex: cardPosition,
                    vertixId: event.vertix.id,
                    direction: event.card.direction,
                    playerId: event.playerId,
                    cardId: event.card.id,
                    moveId: event.moveId,
                })
                delete this._movePromises[event.moveId]
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
            commandId: id,
        })
        return new Promise<Move>((resolve) => {
            this._movePromises[id] = resolve
        })
    }

    public drawCard(card: Card): void {
        this._cards.push(card)
    }
}
