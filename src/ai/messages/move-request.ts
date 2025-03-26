import { SerializabledBoard } from '../engine/board/serializable-board'
import { Directions } from '../engine/directions'
import { WebWorkerMessage } from './message'

export type MoveRequest = {
    board: SerializabledBoard
    currentScores: Record<string, number>
    cards: Directions[]
} & WebWorkerMessage
