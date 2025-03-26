import { Move } from './move'
import { MoveScore } from './move-score'

export interface MoveScoreCalculator {
    calculateMoveScore(move: Move): MoveScore[]
}
