import { directions } from '../directions'
import { LinkedVertix, Vertix } from '../vertix'
import { Move } from './Move'
import { MoveScoreChecker } from './move-score-checker'
import { MoveScore } from './move-score'
import { ScoreType } from './score-type'

export class CancelScoreChecker implements MoveScoreChecker {
    private verticesMap: Record<string, Vertix>

    public constructor(verticesMap: Record<string, Vertix>) {
        this.verticesMap = verticesMap
    }

    public checkMoveScore(move: Move): MoveScore[] {
        const vertix = this.verticesMap[move.vertixId]

        const linkedVerticesWithCard: LinkedVertix[] = vertix.getLinkedVerticesWithCardValue()

        return linkedVerticesWithCard
            .filter(
                (linkedVertice: LinkedVertix) =>
                    Math.abs(linkedVertice.vertix.direction! - move.direction) === directions.length / 2
            )
            .map((linkedVertix: LinkedVertix) => ({
                scoreType: ScoreType.CANCEL,
                vertices: [vertix, linkedVertix.vertix],
                points: 2,
            }))
    }
}
