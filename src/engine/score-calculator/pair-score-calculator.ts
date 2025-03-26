import { MoveScoreCalculator } from './move-score-checker'
import { MoveScore } from './move-score'
import { ScoreType } from './score-type'
import { Vertix, LinkedVertix } from '../graph/vertix'
import { Move } from './move'

export class PairScoreCalculator implements MoveScoreCalculator {
    private verticesMap: Record<string, Vertix>

    public constructor(verticesMap: Record<string, Vertix>) {
        this.verticesMap = verticesMap
    }

    public calculateMoveScore(move: Move): MoveScore[] {
        const vertix = this.verticesMap[move.vertixId]

        const linkedVerticesWithCard: LinkedVertix[] = vertix.getLinkedVerticesWithDirection()

        return linkedVerticesWithCard
            .filter((linkedVertice: LinkedVertix) => linkedVertice.vertix.direction === move.direction)
            .map((linkedVertix: LinkedVertix) => ({
                scoreType: ScoreType.PAIR,
                vertices: [vertix, linkedVertix.vertix],
                points: 1,
            }))
    }
}
