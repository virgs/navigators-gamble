import { SerializabledBoard } from './board/serializable-board'

export type GameState = {
    board: SerializabledBoard
    playersScores: Record<string, number>
}
