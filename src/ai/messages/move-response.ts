import { Move } from '../engine/score-calculator/move'
import { WebWorkerMessage } from './message'

export type MoveResponse = {
    move: Move & { cardIndex: number }
} & WebWorkerMessage
