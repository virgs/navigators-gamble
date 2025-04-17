import { directions } from '../directions'
import { LinkedVertix, Vertix } from '../graph/vertix'
import { Move } from './move'
import { MoveScore } from './move-score'
import { MoveScoreCalculator as ScoreCalculator } from './move-score-checker'
import { ScoreType } from './score-type'

export class CancelScoreCalculator implements ScoreCalculator {
    private verticesMap: Record<string, Vertix>

    public constructor(verticesMap: Record<string, Vertix>) {
        this.verticesMap = verticesMap
    }

    public calculateMoveScore(move: Move): MoveScore[] {
        const vertix = this.verticesMap[move.vertixId]

        const linkedVerticesWithCard: LinkedVertix[] = vertix.getLinkedVerticesWithDirection()

        return linkedVerticesWithCard
            .filter((linkedVertice: LinkedVertix) => {
                const linkedVertixDirection = linkedVertice.vertix.direction!
                const moveDirection = move.direction
                return Math.abs(linkedVertixDirection - moveDirection) === directions.length / 2
            })
            .map((linkedVertix: LinkedVertix) => ({
                scoreType: ScoreType.CANCEL,
                vertices: [vertix, linkedVertix.vertix],
                points: 2,
            }))
    }
}
