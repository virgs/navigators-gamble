import { Card } from '../card'
import { Directions } from '../directions'
import { PlayerType } from '../game-configuration/player-type'
import { Move } from '../score-calculator/move'
import { ChooseMoveInput, Player } from './player'

export class HumanPlayer implements Player {
    private readonly _id: string
    private readonly _cards: Card[]
    private readonly _turnOrder: number
    private _score: number = 0

    public constructor(id: string, turnOrder: number, cards: Card[]) {
        this._id = id
        this._cards = cards
        this._score = 0
        this._turnOrder = turnOrder
        this._cards.forEach((card) => card.reveal())
        this._cards.sort((a, b) => a.direction - b.direction)
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

    public async makeMove(chooseMoveInput: ChooseMoveInput): Promise<Move> {
        console.log(`PLAYER ${this.id} turn`)
        console.log(`player cards: ${this._cards.map((card, index) => `(${index}) ${card.direction}`).join(', ')}`)
        console.log(
            `available vertices: ${chooseMoveInput.board
                .getEmptyVertices()
                .map((vertix) => vertix.id)
                .join(', ')}`
        )

        const cardPosition = prompt('Card index ')!
        const vertixId = prompt('VertixId ')!

        const chosenCard = this._cards[parseInt(cardPosition)]

        this._cards.splice(parseInt(cardPosition), 1)

        return {
            vertixId: vertixId,
            direction: chosenCard.direction,
            playerId: this.id,
        }
    }

    public drawCard(card: Card): void {
        console.log(`Player ${this.id} got card: ${Directions[card.direction]}`)
        card.reveal()
        this._cards.push(card)
    }
}
