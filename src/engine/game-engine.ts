import { arrayShuffler } from '../contants/array-shufller'
import { Board } from './board'
import { Card } from './card'
import { Directions, directions } from './directions'
import { Move } from './move-score-checker/Move'

export interface Player {
    get id(): string
    drawCard(card: Card): void
    makeMove(board: Board): Move
}

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

export enum PlayerType {
    HUMAN,
    ARTIFICIAL_INTELLIGENCE,
}

export type GameConfiguration = {
    players: PlayerType[]
    cardsPerDirection: number
    cardsPerPlayer: number
}

export class GameEngine {
    private readonly cards: Card[]
    private readonly players: Player[]

    public constructor(config: GameConfiguration) {
        this.cards = arrayShuffler(
            directions
                .map((direction) => Array(config.cardsPerDirection).fill(direction))
                .flat()
                .map((direction, index) => new Card(`id${index}`, direction))
        )

        this.players = config.players.map((player, index) => {
            const newPlayer = new HumanPlayer(`id-${index}`)
            Array(config.cardsPerPlayer).forEach(() => newPlayer.drawCard(this.cards.pop()!))
            return newPlayer
        })
    }

    public isGameOver(): boolean {
        return thi
    }
}
