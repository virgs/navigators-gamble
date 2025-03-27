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

        return this.mergeSequences(clockwiseSequences, counterClockwiseSequences)
            .filter((sequence: Vertix[]) => sequence.length >= 3)
            .map((sequence: Vertix[]) => {
                return {
                    scoreType: ScoreType.SEQUENCE,
                    points: sequence.length,
                    vertices: sequence,
                }
            })
    }

    private mergeSequences(clockwiseSequences: Vertix[][], counterClockwiseSequences: Vertix[][]): Vertix[][] {
        const sequences: Vertix[][] = []
        if (clockwiseSequences.length === 0 || counterClockwiseSequences.length === 0) {
            return clockwiseSequences.concat(counterClockwiseSequences)
        } else {
            //cw: 4567
            //ccw: 23456
            counterClockwiseSequences.forEach((counterClockwiseSequence: Vertix[]) => {
                clockwiseSequences.forEach((clockwiseSequence: Vertix[]) => {
                    const firstNotIncludedItem = clockwiseSequence.findIndex(
                        // item 7, index: 3
                        (clockwiseItem) => !counterClockwiseSequence.includes(clockwiseItem)
                    )

                    sequences.push(counterClockwiseSequence.concat(clockwiseSequence.slice(firstNotIncludedItem)))
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
                (linkedVertix: LinkedVertix) => sequenceCheck(current.direction!, linkedVertix.vertix.direction!) // ensures direction
            )
            .filter(
                (linkedVertix: LinkedVertix) => !currentSequence.find((vertix) => vertix.id === linkedVertix.vertix.id) // prevents loops
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
