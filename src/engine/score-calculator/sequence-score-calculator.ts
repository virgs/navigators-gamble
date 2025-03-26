import { isNextClockWise, isPreviousClockWise } from '../directions'
import { MoveScoreCalculator } from './move-score-checker'
import { MoveScore } from './move-score'
import { ScoreType } from './score-type'
import { Vertix, LinkedVertix } from '../graph/vertix'
import { Move } from './move'

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

    private getSequences(currentSequence: Vertix[], sequenceCheck: Function): Vertix[][] {
        const vertix: Vertix = currentSequence[currentSequence.length - 1]
        if (currentSequence.includes(vertix)) return []
        const result: Vertix[][] = []

        const linkedVertices = vertix.getLinkedVerticesWithDirection()
        linkedVertices
            .filter((linkedVertix: LinkedVertix) => !currentSequence.includes(linkedVertix.vertix))
            .filter((linkedVertix: LinkedVertix) => sequenceCheck(vertix.direction!, linkedVertix.vertix.direction!))
            .forEach((linkedVertix: LinkedVertix) => {
                const children = this.getSequences([...currentSequence, linkedVertix.vertix], sequenceCheck)
                if (children.length === 0) {
                    result.push([vertix, linkedVertix.vertix])
                } else {
                    children.forEach((children: Vertix[]) => {
                        result.push([vertix, ...children])
                    })
                }
            })
        return result
    }
}
