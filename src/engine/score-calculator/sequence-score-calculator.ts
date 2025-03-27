import { DirectionsComparer, isNextClockWise, isPreviousClockWise } from '../directions'
import { LinkedVertix, Vertix } from '../graph/vertix'
import { Move } from './move'
import { MoveScore } from './move-score'
import { MoveScoreCalculator } from './move-score-checker'
import { ScoreType } from './score-type'

export class SequenceScoreCalculator implements MoveScoreCalculator {
    private verticesMap: Record<string, Vertix>

    public constructor(verticesMap: Record<string, Vertix>) {
        this.verticesMap = verticesMap
    }

    public calculateMoveScore(move: Move): MoveScore[] {
        const vertix = this.verticesMap[move.vertixId]

        const increasingSequences = this.getSequences([vertix], isNextClockWise)
        const decreasingSequences = this.getSequences([vertix], isPreviousClockWise)

        return this.combineSequences(increasingSequences, decreasingSequences)
            .filter((sequence: Vertix[]) => sequence.length >= 3)
            .map((sequence: Vertix[]) => {
                return {
                    scoreType: ScoreType.SEQUENCE,
                    points: sequence.length,
                    vertices: sequence,
                }
            })
    }

    private combineSequences(increasingSequences: Vertix[][], decreasingSequences: Vertix[][]) {
        if (increasingSequences.length === 0 || decreasingSequences.length === 0) {
            return increasingSequences.concat(decreasingSequences)
        } else {
            const sequences: Vertix[][] = []
            increasingSequences.forEach((increasingSequence: Vertix[]) => {
                decreasingSequences.forEach((decreasingSequence: Vertix[]) => {
                    const [, ...restIncreasingSequence] = increasingSequence
                    sequences.push(restIncreasingSequence.concat(decreasingSequence))
                })
            })
            return sequences
        }
    }

    private getSequences(currentSequence: Vertix[], sequenceCheck: DirectionsComparer): Vertix[][] {
        const current: Vertix = currentSequence[currentSequence.length - 1]
        const result: Vertix[][] = []

        const linkedVertices = current.getLinkedVerticesWithDirection()

        linkedVertices
            .filter(
                (linkedVertix: LinkedVertix) => !currentSequence.find((vertix) => vertix.id === linkedVertix.vertix.id) // evita ciclos
            )
            .filter(
                (linkedVertix: LinkedVertix) => sequenceCheck(current.direction!, linkedVertix.vertix.direction!) // confere direção
            )
            .forEach((linkedVertix: LinkedVertix) => {
                const extendedSequence = currentSequence.concat(linkedVertix.vertix)
                const childSequences = this.getSequences(extendedSequence, sequenceCheck)

                if (childSequences.length === 0) {
                    result.push(extendedSequence)
                } else {
                    result.push(...childSequences)
                }
            })

        return result
    }
}
