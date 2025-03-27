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

        const clockwiseSequences = this.getSequences([vertix], isNextClockWise)
        const counterClockwiseSequences = this.getSequences([vertix], isPreviousClockWise).map((sequence) =>
            sequence.reverse()
        )

        return this.combineSequences(clockwiseSequences, counterClockwiseSequences)
            .filter((sequence: Vertix[]) => sequence.length >= 3)
            .map((sequence: Vertix[]) => {
                return {
                    scoreType: ScoreType.SEQUENCE,
                    points: sequence.length,
                    vertices: sequence,
                }
            })
    }

    private combineSequences(clockwiseSequences: Vertix[][], counterClockwiseSequences: Vertix[][]): Vertix[][] {
        const sequences: Vertix[][] = []
        if (clockwiseSequences.length === 0 || counterClockwiseSequences.length === 0) {
            return clockwiseSequences.concat(counterClockwiseSequences)
        } else if (clockwiseSequences.length + counterClockwiseSequences.length > 4) {
            counterClockwiseSequences.forEach((counterClockwiseSequence: Vertix[]) => {
                const nonDuplicatedCounterClockwiseSequence = counterClockwiseSequence.slice(0, -1)
                clockwiseSequences.forEach((clockwiseSequence: Vertix[]) => {
                    sequences.push(nonDuplicatedCounterClockwiseSequence.concat(clockwiseSequence))
                })
            })
        }
        return sequences
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
