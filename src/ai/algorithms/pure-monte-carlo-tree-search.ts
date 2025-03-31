import { Board } from '../../engine/board/board'
import { BoardSerializer } from '../../engine/board/board-serializer'
import { Directions, directions } from '../../engine/directions'
import { GameConfiguration } from '../../engine/game-configuration/game-configuration'
import { Vertix } from '../../engine/graph/vertix'
import { Move } from '../../engine/score-calculator/move'
import { MoveScore } from '../../engine/score-calculator/move-score'
import { InitializeAiMessage } from '../messages/initialize-ai-message'
import { MessageType } from '../messages/message-type'
import { MoveRequest } from '../messages/move-request'
import { MoveResponse } from '../messages/move-response'
import { AiAlgorithm } from './ai-algorithm'

export class PureMonteCarloTreeSearch implements AiAlgorithm {
    private readonly gameConfig: GameConfiguration
    private readonly playerId: string
    private readonly playersIds: string[]
    private readonly playerTurnOrder: number
    private readonly iterations: number
    private readonly gameCards: Directions[]

    constructor(initMessage: InitializeAiMessage) {
        this.gameConfig = initMessage.gameConfig
        this.iterations = initMessage.aiConfiguration.iterations
        this.playerId = initMessage.playerId
        this.playersIds = initMessage.playersIds
        this.playerTurnOrder = initMessage.turnOrder
        this.gameCards = directions.flatMap((dir) => Array(this.gameConfig.cardsPerDirection).fill(dir))
    }

    public async makeMove(moveRequest: MoveRequest): Promise<MoveResponse> {
        const board = BoardSerializer.deserialize(moveRequest.board)
        const possibleMoves = this.findNextMoveAlternatives(this.playerId, moveRequest.playerCards, board)

        let bestMove: Move & { score: number } = { ...possibleMoves[0], score: Number.NEGATIVE_INFINITY }
        //TODO: calculate number of moves left and take that into consideration so the iterations can reflect more precisely the number of iterations
        const iterationsPerMove = Math.ceil(this.iterations / possibleMoves.length)

        for (const move of possibleMoves) {
            let totalScore = 0

            for (let i = 0; i < iterationsPerMove; i++) {
                const boardCopy = board.clone()
                totalScore += this.simulateRandomGame(move, moveRequest, boardCopy)
            }

            if (totalScore > bestMove.score) {
                bestMove = { ...move, score: totalScore }
            }
        }

        return {
            messageType: MessageType.MOVE_RESPONSE,
            id: moveRequest.id,
            move: {
                vertixId: bestMove.vertixId,
                direction: bestMove.direction,
                cardIndex: moveRequest.playerCards.indexOf(bestMove.direction),
                playerId: this.playerId,
            },
        }
    }

    private simulateRandomGame(initialMove: Move, moveRequest: MoveRequest, board: Board): number {
        let turn = this.playerTurnOrder
        let move = initialMove
        let playerHand = [...moveRequest.playerCards]
        const scores = { ...moveRequest.currentScores }
        const availableCards = this.computeNotPlayedCards(board, playerHand)

        while (board.getEmptyVertices().length > 0) {
            const moveScores = board.makeMove(move)

            if (turn === this.playerTurnOrder) {
                playerHand = this.updateCardsAfterMove(playerHand, move.direction, availableCards.pop()!)
            }

            //TODO terminate the while earlier in case of a expressive score difference
            scores[this.playerId] += this.calculateScore(moveScores, move.playerId)

            turn = (turn + 1) % this.playersIds.length

            const nextMoves = this.findNextMoveAlternatives(
                this.playersIds[turn],
                turn === this.playerTurnOrder ? playerHand : availableCards,
                board
            )

            move = nextMoves[Math.floor(Math.random() * nextMoves.length)]
        }

        return this.calculateFinalScore(scores, board.getPlayerVerticesMap())
    }

    private updateCardsAfterMove(playerHand: Directions[], played: Directions, newCard: Directions): Directions[] {
        const cardToBeRemovedIndex = playerHand.indexOf(played)
        return playerHand.map((card, index) => (cardToBeRemovedIndex === index ? newCard : card))
    }

    private calculateScore(moveScores: MoveScore[], playerId: string): number {
        return moveScores.reduce((total, score) => {
            score.vertices.forEach((vertix) => (vertix.ownerId = playerId))
            return total + score.points
        }, 0)
    }

    private calculateFinalScore(scores: Record<string, number>, bonusMap: Record<string, Vertix[]>): number {
        return Object.entries(scores).reduce((total, [id, score]) => {
            const bonus = bonusMap[id]?.length ?? 0
            const playerScore = score + bonus
            return total + (id === this.playerId ? playerScore : -playerScore)
        }, 0)
    }

    private computeNotPlayedCards(board: Board, playerCards: Directions[]): Directions[] {
        const remaining = [...this.gameCards]
        const used = board
            .getVertices()
            .filter((vertix) => vertix.direction !== undefined)
            .map((vertix) => vertix.direction!)
            .concat(playerCards)

        used.forEach((dir) => {
            const index = remaining.indexOf(dir)
            if (index >= 0) remaining.splice(index, 1)
        })

        return remaining
    }

    private findNextMoveAlternatives(playerId: string, cards: Directions[], board: Board): Move[] {
        const empty = board.getEmptyVertices()
        const moves: Move[] = []

        for (const card of cards) {
            for (const vertix of empty) {
                if (!moves.find((move) => move.direction === card && move.vertixId === vertix.id)) {
                    moves.push({ vertixId: vertix.id, direction: card, playerId: playerId })
                }
            }
        }

        return moves
    }
}
