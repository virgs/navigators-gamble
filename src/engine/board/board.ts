import { Directions } from '../directions'
import { CancelScoreCalculator } from '../score-calculator/cancel-score-calculator'
import { Move } from '../score-calculator/Move'
import { MoveScore } from '../score-calculator/move-score'
import { MoveScoreCalculator } from '../score-calculator/move-score-checker'
import { PairScoreCalculator } from '../score-calculator/pair-score-calculator'
import { ScoreType } from '../score-calculator/score-type'
import { SequenceScoreCalculator } from '../score-calculator/sequence-score-calculator'
import { Vertix } from '../vertix'

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

    public getVertices(): Vertix[] {
        return Object.values(this.verticesMap)
    }

    public getEmptyVertices(): Vertix[] {
        return this.getVertices().filter((vertix) => vertix.direction === undefined)
    }

    public putCard(move: Move): MoveScore[] {
        const vertix = this.verticesMap[move.vertixId]
        if (vertix.direction !== undefined) {
            throw new Error(`Vertix ${move.vertixId} already has a card`)
        }
        console.log(`\tPlayer ${move.playerId} putting card '${Directions[move.direction]}' on vertix ${move.vertixId}`)
        vertix.direction = move.direction

        const moveScores = this.moveScoreCheckers
            .map((checker) => checker.calculateMoveScore(move))
            .filter((moveScore) => moveScore.length > 0)
            .flat()

        moveScores.forEach((moveScore) => {
            console.log(`\t======== ${ScoreType[moveScore.scoreType]} ========`)
            const scores = moveScores.reduce((acc, moveScore) => {
                moveScore.vertices.forEach((vertix, index) => {
                    vertix.ownerId = move.playerId
                    if (index > 0) {
                        const link = vertix.getLinkTo(moveScore.vertices[index - 1])
                        console.log(`\t\tChanging link '${link?.id}' to ${move.playerId}`)
                    }
                })
                console.log(
                    `\t\t\tCombination vertices: ${moveScore.vertices.map((vertix) => `${vertix.id} (${Directions[vertix.direction!]})`).join(', ')}`
                )
                return acc + moveScore.points
            }, 0)
            console.log(`\t\tTotal: ${scores}`)
        })
        return moveScores
    }
}
