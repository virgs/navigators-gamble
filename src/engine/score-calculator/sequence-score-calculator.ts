import { isNextClockWise, isPreviousClockWise } from '../directions'
import { Vertix } from '../graph/vertix'
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
}
