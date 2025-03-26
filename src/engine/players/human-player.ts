import { Board } from '../board/board'
import { Card } from '../card'
import { Directions } from '../directions'
import { Move } from '../score-calculator/Move'

Object.defineProperty(window, 'play', {
    get: function () {
        function move(direction: string, vertixId: string) {
            board.putCard({
                vertixId: vertixId,
                direction: parseInt(direction),
                playerId: Colors[Colors.WHITE],
            })
        }
        return move
        //your code logic
    },
})

export class HumanPlayer implements Player {
    private readonly _id: string
    private readonly cards: Card[]

    public constructor(id: string) {
        this._id = id
        this.cards = []
    }
    public makeMove(board: Board): Move {
        console.log(`available vertices: ${board.getEmptyVertices().map((vertix) => vertix.id)}`)
        console.log(`player cards: ${this.cards.map((card) => Directions[card.direction])}`)
        const vertixId = prompt('VertixId? ')!
        const cardPosition = prompt('Card? ')!
        return {
            vertixId: vertixId,
            card: this.cards[parseInt(cardPosition)],
            playerId: this.id,
        }
    }

    public get id(): string {
        return this._id
    }

    public drawCard(card: Card): void {
        this.cards.push(card)
    }
}
