import { AiAlgorithmType } from '../ai/algorithms/ai-algorithm-type'
import { SerializabledBoard } from './board/serializable-board'
import { PlayerType } from './players/player-type'

export type GameConfiguration = {
    players: {
        type: PlayerType
        aiAlgorithm: AiAlgorithmType
        runs?: number
    }[]
    cardsPerDirection: number
    cardsPerPlayer: number
    board: SerializabledBoard
}
