import { Vertix } from '../vertix'
import { ScoreType } from './score-type'

export type MoveScore = {
    scoreType: ScoreType
    points: number
    vertices: Vertix[]
}
