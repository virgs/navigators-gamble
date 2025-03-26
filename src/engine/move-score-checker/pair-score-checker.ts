import { Vertix, LinkedVertix } from '../vertix'
import { Move } from './Move'
import { MoveScoreChecker } from './move-score-checker'
import { MoveScore } from './move-score'
import { ScoreType } from './score-type'

export class PairScoreChecker implements MoveScoreChecker {
    private verticesMap: Record<string, Vertix>

    public constructor(verticesMap: Record<string, Vertix>) {
        this.verticesMap = verticesMap
    }

    public checkMoveScore(move: Move): MoveScore[] {
        const vertix = this.verticesMap[move.vertixId]

        const linkedVerticesWithCard: LinkedVertix[] = vertix.getLinkedVerticesWithCardValue()

        return linkedVerticesWithCard
            .filter((linkedVertice: LinkedVertix) => linkedVertice.vertix.direction === move.direction)
            .map((linkedVertix: LinkedVertix) => ({
                scoreType: ScoreType.PAIR,
                vertices: [vertix, linkedVertix.vertix],
                points: 1,
            }))
    }
}
