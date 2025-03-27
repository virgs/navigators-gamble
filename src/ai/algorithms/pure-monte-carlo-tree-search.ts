import { Board } from '../../engine/board/board'
import { BoardSerializer } from '../../engine/board/board-serializer'
import { Directions, directions } from '../../engine/directions'
import { GameConfiguration } from '../../engine/game-configuration'
import { Move } from '../../engine/score-calculator/move'
import { InitializeAiMessage } from '../messages/initialize-message'
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
        this.iterations = initMessage.iterations
        this.playerId = initMessage.playerId
        this.playersIds = initMessage.playersIds
        this.playerTurnOrder = initMessage.turnOrder
        this.gameCards = directions.map((direction) => Array(this.gameConfig.cardsPerDirection).fill(direction)).flat()
    }

    public async makeMove(moveRequest: MoveRequest): Promise<MoveResponse> {
        const board = BoardSerializer.deserialize(moveRequest.board)

        const nextMoveAlternatives: Move[] = this.findNextMoveAlternatives(
            this.playerId,
            moveRequest.playerCards,
            board
        )

        let bestMove: Move & { score: number } = { ...nextMoveAlternatives[0], score: 0 }
        const iterationsPerAlternative = Math.ceil(this.iterations / nextMoveAlternatives.length)
        nextMoveAlternatives.map((moveAlternative) => {
            let alternativeTotalScore = 0
            Array.from(Array(iterationsPerAlternative)).forEach(() => {
                alternativeTotalScore += this.randomlyPlayUntilGameIsOver(
                    moveAlternative,
                    moveRequest,
                    BoardSerializer.deserialize(BoardSerializer.serialize(board))
                )
            })
            if (alternativeTotalScore > bestMove.score) {
                bestMove = { ...moveAlternative, score: alternativeTotalScore }
            }
        })

        return {
            messageType: MessageType.MOVE_RESPONSE,
            id: moveRequest.id,
            move: {
                vertixId: bestMove.vertixId,
                cardIndex: moveRequest.playerCards.indexOf(bestMove.direction),
                direction: bestMove.direction,
                playerId: this.playerId,
            },
        }
    }

    private findNextMoveAlternatives(playerId: string, playerCards: Directions[], board: Board): Move[] {
        const emptyVertices = board.getEmptyVertices()

        const alternatives: Move[] = []
        for (const playerCard of playerCards) {
            for (const emptyVertix of emptyVertices) {
                if (
                    !alternatives.find(
                        (savedCombinations) =>
                            savedCombinations.direction === playerCard && savedCombinations.vertixId === emptyVertix.id
                    )
                ) {
                    alternatives.push({ vertixId: emptyVertix.id, direction: playerCard, playerId: playerId })
                }
            }
        }
        // console.log(playerCards.length, emptyVertices.length, alternatives.length)
        return alternatives
    }

    private randomlyPlayUntilGameIsOver(move: Move, moveRequest: MoveRequest, board: Board): number {
        let turnPlayer = this.playerTurnOrder
        let currentMove = move
        const playerCards = [...moveRequest.playerCards]
        const currentScores = JSON.parse(JSON.stringify(moveRequest.currentScores))

        //Not played cards = All cards - boardCards - playerCards
        const notPlayedCards = [...this.gameCards]
        board
            .getVertices()
            .filter((vertix) => vertix.direction !== undefined)
            .map((vertix) => vertix.direction!)
            .concat(moveRequest.playerCards)
            .forEach((directionToRemove: Directions) =>
                notPlayedCards.splice(notPlayedCards.indexOf(directionToRemove), 1)
            )

        //Game is not over
        while (board.getEmptyVertices().length > 0) {
            const moveScores = board.makeMove(currentMove)
            if (turnPlayer === this.playerTurnOrder) {
                const newCard = notPlayedCards.pop()!
                //remove player's card and give them a new one
                playerCards.splice(playerCards.indexOf(currentMove.direction), 1)
                playerCards.push(newCard)
            }

            currentScores[this.playerId] += moveScores.reduce((acc, moveScore) => acc + moveScore.points, 0)

            turnPlayer = (turnPlayer + 1) % this.gameConfig.players.length

            const nextMoveAlternatives: Move[] = this.findNextMoveAlternatives(
                this.playersIds[turnPlayer],
                turnPlayer === this.playerTurnOrder ? playerCards : notPlayedCards,
                board
            )

            currentMove = nextMoveAlternatives[Math.floor(Math.random() * nextMoveAlternatives.length)]
        }

        const bonusPoints = board.getPlayerVerticesMap()
        return Object.keys(currentScores).reduce((acc, playerId) => {
            const playerPoints = currentScores[playerId] + (bonusPoints[playerId]?.length ?? 0)
            return acc + (playerId === this.playerId ? playerPoints : -playerPoints)
        }, 0)
    }
}
