import { Card } from '../card'
import { Directions } from '../directions'
import { Move } from '../score-calculator/move'
import { ChooseMoveInput, Player } from './player'

export class HumanPlayer implements Player {
    private readonly _id: string
    private _score: number = 0
    private readonly cards: Card[]

    public constructor(id: string, cards: Card[]) {
        this._id = id
        this.cards = cards
        this._score = 0
    }

    public get id(): string {
        return this._id
    }
    public get score(): number {
        return this._score
    }

    public addScore(score: number): void {
        this._score += score
    }

    public finish(): void {}

    public async makeMove(chooseMoveInput: ChooseMoveInput): Promise<Move> {
        console.log(`PLAYER ${this.id} turn`)
        console.log(`player cards: ${this.cards.map((card, index) => `(${index}) ${card.direction}`).join(', ')}`)
        console.log(
            `available vertices: ${chooseMoveInput.board
                .getEmptyVertices()
                .map((vertix) => vertix.id)
                .join(', ')}`
        )

        const cardPosition = prompt('Card index ')!
        const vertixId = prompt('VertixId ')!

        const chosenCard = this.cards[parseInt(cardPosition)]

        this.cards.splice(parseInt(cardPosition), 1)

        return {
            vertixId: vertixId,
            direction: chosenCard.direction,
            playerId: this.id,
        }
    }

    public drawCard(card: Card): void {
        console.log(`Player ${this.id} got card: ${Directions[card.direction]}`)
        this.cards.push(card)
    }
}
