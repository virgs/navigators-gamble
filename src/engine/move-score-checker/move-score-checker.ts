import { Move } from './Move'
import { MoveScore } from './move-score'

export interface MoveScoreChecker {
    checkMoveScore(move: Move): MoveScore[]
}
