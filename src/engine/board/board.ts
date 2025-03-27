import { Vertix } from '../graph/vertix'
import { CancelScoreCalculator } from '../score-calculator/cancel-score-calculator'
import { Move } from '../score-calculator/move'
import { MoveScore } from '../score-calculator/move-score'
import { MoveScoreCalculator } from '../score-calculator/move-score-checker'
import { PairScoreCalculator } from '../score-calculator/pair-score-calculator'
import { SequenceScoreCalculator } from '../score-calculator/sequence-score-calculator'
import { BoardSerializer } from './board-serializer'

export class Board {
    private readonly verticesMap: Record<string, Vertix>
    private readonly moveScoreCheckers: MoveScoreCalculator[]

    constructor(verticesMap: Record<string, Vertix>) {
        this.verticesMap = verticesMap

        this.moveScoreCheckers = [
            new PairScoreCalculator(this.verticesMap),
            new CancelScoreCalculator(this.verticesMap),
            new SequenceScoreCalculator(this.verticesMap),
        ]
    }

    public clone(): Board {
        return BoardSerializer.deserialize(BoardSerializer.serialize(this))
    }

    public getVertices(): Vertix[] {
        return Object.values(this.verticesMap)
    }

    public getPlayerVerticesMap(): Record<string, Vertix[]> {
        return this.getVertices()
            .filter((vertix) => vertix.ownerId !== undefined)
            .reduce(
                (acc, vertix) => {
                    ;(acc[vertix.ownerId!] ??= []).push(vertix)
                    return acc
                },
                {} as Record<string, Vertix[]>
            )
    }

    public getEmptyVertices(): Vertix[] {
        return this.getVertices().filter((vertix) => vertix.direction === undefined)
    }

    public makeMove(move: Move): MoveScore[] {
        const vertix = this.verticesMap[move.vertixId]
        if (vertix.direction !== undefined) {
            throw new Error(`Vertix ${move.vertixId} already has a card`)
        }
        vertix.direction = move.direction

        const moveScores = this.moveScoreCheckers
            .map((checker) => checker.calculateMoveScore(move))
            .filter((moveScore) => moveScore.length > 0)
            .flat()

        return moveScores
    }
}
