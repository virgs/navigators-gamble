import { Directions } from './directions'
import { CancelScoreChecker } from './move-score-checker/cancel-score-checker'
import { Move } from './move-score-checker/Move'
import { MoveScore } from './move-score-checker/move-score'
import { MoveScoreChecker } from './move-score-checker/move-score-checker'
import { PairScoreChecker } from './move-score-checker/pair-score-checker'
import { ScoreType } from './move-score-checker/score-type'
import { SequenceScoreChecker } from './move-score-checker/sequence-score-checker'
import { Vertix } from './vertix'

export type SerializableBoard = {
    vertices: {
        id: string
        direction?: Directions
        ownerId?: string
        linkedVertices: {
            vertixId: string
        }[]
    }[]
}

export class Board {
    private readonly verticesMap: Record<string, Vertix>
    private readonly moveScoreCheckers: MoveScoreChecker[]

    constructor(serializableBoard: SerializableBoard) {
        this.verticesMap = {}
        this.initializeVerticesMap(serializableBoard)

        this.moveScoreCheckers = [
            new PairScoreChecker(this.verticesMap),
            new CancelScoreChecker(this.verticesMap),
            new SequenceScoreChecker(this.verticesMap),
        ]
    }

    private initializeVerticesMap(serializableBoard: SerializableBoard) {
        serializableBoard.vertices.forEach((serializableVertix) => {
            this.verticesMap[serializableVertix.id] = new Vertix(
                serializableVertix.id,
                serializableVertix.ownerId,
                serializableVertix.direction
            )
        })

        serializableBoard.vertices.forEach((serializableVertix) => {
            serializableVertix.linkedVertices.forEach((linkedVertix) => {
                this.verticesMap[serializableVertix.id].linkTo(this.verticesMap[linkedVertix.vertixId])
            })
        })
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
            .map((checker) => checker.checkMoveScore(move))
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
