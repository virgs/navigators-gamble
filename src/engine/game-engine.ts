import { arrayShuffler } from '../math/array-shufller'
import { Board } from './board/board'
import { BoardSerializer } from './board/board-serializer'
import { Card } from './card'
import { Directions, directions } from './directions'
import { GameConfiguration } from './game-configuration'
import { AiPlayer, AiPlayerConfig } from './players/ai-player'
import { Player } from './players/player'
import { ScoreType } from './score-calculator/score-type'

export class GameEngine {
    private readonly cards: Card[]
    private readonly players: Player[]
    private board: Board
    private lastTurnPlayerId: number

    public constructor(config: GameConfiguration) {
        this.cards = arrayShuffler(
            directions
                .map((direction) => Array(config.cardsPerDirection).fill(direction))
                .flat()
                .map((direction, index) => new Card(`id${index}`, direction))
        )

        this.board = BoardSerializer.deserialize(config.board)

        this.players = config.players.map((player, index) => {
            const cards = Array.from(Array(config.cardsPerPlayer)).map(() => this.cards.pop()!)
            const aiPlayerConfig: AiPlayerConfig = {
                id: `id-${index}`,
                runs: player.runs!,
                gameConfig: config,
                cards: cards,
                algorithm: player.aiAlgorithm,
            }
            const newPlayer = new AiPlayer(aiPlayerConfig)

            return newPlayer
        })

        this.lastTurnPlayerId = 0
    }

    public isGameOver(): boolean {
        return this.board.getEmptyVertices().length <= 0
    }

    public finishGame(): void {
        this.players.forEach((player) => player.finish())
    }

    public getScores(): Record<string, number> {
        return this.players.reduce(
            (acc, player) => {
                acc[player.id] = player.score
                return acc
            },
            {} as Record<string, number>
        )
    }

    public async playNextRound() {
        const turnPlayerId = (this.lastTurnPlayerId + 1) % this.players.length
        const currentPlayer = this.players[turnPlayerId]
        const move = await currentPlayer.makeMove({ board: this.board, scores: this.getScores() })
        const moveScores = this.board.makeMove(move)

        moveScores.forEach((moveScore) => {
            console.log(`\t======== ${ScoreType[moveScore.scoreType]} ========`)
            const totalScore = moveScores.reduce((acc, moveScore) => {
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
            console.log(`\t\tTotal: ${totalScore}`)
            currentPlayer.addScore(totalScore)
        })

        currentPlayer.drawCard(this.cards.pop()!)
        this.lastTurnPlayerId = turnPlayerId
    }
}
