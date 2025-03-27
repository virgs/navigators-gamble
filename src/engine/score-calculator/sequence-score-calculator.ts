import { DirectionsComparer, isNextClockWise, isPreviousClockWise } from '../directions'
import { LinkedVertix, Vertix } from '../graph/vertix'
import { Move } from './move'
import { MoveScore } from './move-score'
import { MoveScoreCalculator } from './move-score-checker'
import { ScoreType } from './score-type'
import { SequenceMerger } from './sequence-merger'
import { UniqueSequenceFinder } from './unique-sequence-finder'

export class SequenceScoreCalculator implements MoveScoreCalculator {
    private readonly verticesMap: Record<string, Vertix>
    private readonly merger: SequenceMerger

    public constructor(verticesMap: Record<string, Vertix>) {
        this.verticesMap = verticesMap
        this.merger = new SequenceMerger()
    }

    public calculateMoveScore(move: Move): MoveScore[] {
        const vertix = this.verticesMap[move.vertixId]

        const finderCW = new UniqueSequenceFinder()
        const clockwiseSequences = finderCW.findUniqueSequences([vertix], isNextClockWise)

        const finderCCW = new UniqueSequenceFinder()
        const counterClockwiseSequences = finderCCW
            .findUniqueSequences([vertix], isPreviousClockWise)
            .map((seq) => seq.reverse())

        return this.merger
            .merge(clockwiseSequences, counterClockwiseSequences)
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
}
