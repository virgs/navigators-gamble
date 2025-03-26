import { SerializabledBoard } from './board/serializable-board'
import { PlayerType } from './players/player-type'

export type GameConfiguration = {
    players: {
        type: PlayerType
        runs?: number
    }[]
    cardsPerDirection: number
    cardsPerPlayer: number
    board: SerializabledBoard
}
