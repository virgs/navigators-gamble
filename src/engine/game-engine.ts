import { arrayShuffler } from '../contants/array-shufller'
import { Card } from './card'
import { directions } from './directions'
import { GameConfiguration } from './game-configuration'
import { HumanPlayer } from './players/human-player'
import { Player } from './players/player'

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
