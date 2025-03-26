import { Board } from '../board/board'
import { Card } from '../card'
import { Directions } from '../directions'
import { Move } from '../score-calculator/move'
import { Player } from './player'

// Object.defineProperty(window, 'play', {
//     get: function () {
//         function move(direction: string, vertixId: string) {
//             board.putCard({
//                 vertixId: vertixId,
//                 direction: parseInt(direction),
//                 playerId: Colors[Colors.WHITE],
//             })
//         }
//         return move
//         //your code logic
//     },
// })

export class HumanPlayer implements Player {
    private readonly _id: string
    private _score: number = 0
    private readonly cards: Card[]

    public constructor(id: string) {
        this._id = id
        this.cards = []
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

    public async chooseMove(board: Board): Promise<Move> {
        console.log(`PLAYER ${this.id} turn`)
        console.log(`available vertices: ${board.getEmptyVertices().map((vertix) => vertix.id)}`)
        console.log(`player cards: ${this.cards.map((card) => Directions[card.direction])}`)
        const vertixId = prompt('VertixId? ')!
        const cardPosition = prompt('Card? ')!

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
