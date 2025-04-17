import { Board } from '../../engine/board/board'
import { BoardSerializer } from '../../engine/board/board-serializer'
import { Directions, directions } from '../../engine/directions'
import { GameConfiguration } from '../../engine/game-configuration/game-configuration'
import { Move } from '../../engine/score-calculator/move'
import { MoveScore } from '../../engine/score-calculator/move-score'
import { arrayShuffler } from '../../math/array-shufller'
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
    private readonly iterationsPerAlternative: number
    private readonly gameCards: Directions[]

    constructor(initMessage: InitializeAiMessage) {
        this.gameConfig = initMessage.gameConfig
        this.iterationsPerAlternative = initMessage.configuration.iterationsPerAlternative
        this.playerId = initMessage.playerId
        this.playersIds = initMessage.playersIds
        this.playerTurnOrder = initMessage.turnOrder
        this.gameCards = directions.flatMap((dir) => Array(this.gameConfig.cardsPerDirection).fill(dir))
    }

    public async makeMove(moveRequest: MoveRequest): Promise<MoveResponse> {
        const board = BoardSerializer.deserialize(moveRequest.board)
        // the shuffling adds a randomness to the order of the moves
        // to avoid the same moves being always evaluated first
        const possibleMoves = arrayShuffler(
            this.findNextMoveAlternatives(this.playerId, moveRequest.playerCards, board)
        )

        const moveResults = new Map<number, Move & { score: number }>()
        for (let count = 0; count < this.iterationsPerAlternative; count++) {
            const boardCopy = board.clone()
            // randomly selects a move from the possible moves
            // to add some stupidness to the ai
            const index = Math.floor(Math.random() * possibleMoves.length)
            const possibleMove = possibleMoves[index]
            const moveWins: number = this.simulateRandomGame(possibleMove, moveRequest, boardCopy) ? 1 : 0
            if (moveResults.has(index)) {
                moveResults.set(index, { ...possibleMove, score: moveResults.get(index)!.score + moveWins })
            } else {
                moveResults.set(index, { ...possibleMove, score: moveWins })
            }
        }
        const bestMove = [...moveResults.values()].reduce(
            (acc, move) => {
                if (move.score > acc.score) {
                    return move
                }
                return acc
            },
            {
                ...possibleMoves[0],
                score: Number.NEGATIVE_INFINITY,
            }
        )

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

    private simulateRandomGame(initialMove: Move, moveRequest: MoveRequest, board: Board): boolean {
        let turn = this.playerTurnOrder
        let move = initialMove
        let playerHand = [...moveRequest.playerCards]
        const scores = { ...moveRequest.currentScores }
        const availableCards = this.computeNotPlayedCards(board, playerHand)

        while (board.getEmptyVertices().length > 0) {
            const moveScores = board.makeMove(move)

            if (turn === this.playerTurnOrder) {
                playerHand = this.updateCardsAfterMove(playerHand, move.direction, availableCards.pop())
            }

            //TODO terminate the method earlier in case of a expressive score difference
            scores[this.playerId] += this.calculateScore(moveScores, move.playerId)

            turn = (turn + 1) % this.playersIds.length

            const nextMoves = this.findNextMoveAlternatives(
                this.playersIds[turn],
                turn === this.playerTurnOrder ? playerHand : availableCards,
                board
            )

            move = nextMoves[Math.floor(Math.random() * nextMoves.length)]
        }
        //bonus points
        board.getVertices().forEach((vertix) => {
            if (vertix.ownerId !== undefined) {
                scores[vertix.ownerId] += vertix.direction ? 1 : 0
            }
        })
        const playerScore = scores[this.playerId] ?? 0

        const playerHasWon = Object.entries(scores)
            .filter(([id, _]) => id !== this.playerId)
            .every(([, score]) => {
                return score < playerScore
            })

        return playerHasWon
    }

    private updateCardsAfterMove(playerHand: Directions[], played: Directions, newCard?: Directions): Directions[] {
        const cardToBeRemovedIndex = playerHand.indexOf(played)
        return playerHand.filter((_, index) => index !== cardToBeRemovedIndex).concat(newCard ?? [])
    }

    private calculateScore(moveScores: MoveScore[], playerId: string): number {
        return moveScores.reduce((total, score) => {
            score.vertices.forEach((vertix) => (vertix.ownerId = playerId))
            return total + score.points
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

        cards.forEach((card, index) => {
            for (const vertix of empty) {
                if (!moves.find((move) => move.direction === card && move.vertixId === vertix.id)) {
                    moves.push({ vertixId: vertix.id, direction: card, playerId: playerId, cardIndex: index })
                }
            }
        })

        return moves
    }
}
