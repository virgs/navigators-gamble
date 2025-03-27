import { arrayShuffler } from '../math/array-shufller'
import { Board } from './board/board'
import { BoardSerializer } from './board/board-serializer'
import { Card } from './card'
import { directions } from './directions'
import { GameConfiguration } from './game-configuration/game-configuration'
import { AiPlayer, AiPlayerConfig } from './players/ai-player'
import { HumanPlayer } from './players/human-player'
import { Player } from './players/player'
import { PlayerType } from './game-configuration/player-type'
import { ScoreType } from './score-calculator/score-type'

export class GameEngine {
    private readonly cards: Card[]
    private readonly players: Player[]
    private readonly board: Board
    private lastTurnPlayerId: number

    public constructor(gameConfiguration: GameConfiguration) {
        this.cards = arrayShuffler(
            directions
                .map((direction) => Array(gameConfiguration.cardsPerDirection).fill(direction))
                .flat()
                .map((direction, index) => new Card(`id${index}`, direction))
        )

        this.board = BoardSerializer.deserialize(gameConfiguration.board)

        if (
            this.board.getVertices().length >=
            this.cards.length - gameConfiguration.players.length * gameConfiguration.cardsPerPlayer
        ) {
            throw Error(
                `Board has too many vertix to game configuration '${this.board.getVertices().length}'. Max allowed '${this.cards.length - gameConfiguration.players.length * gameConfiguration.cardsPerPlayer}'`
            )
        }

        const playersIds = gameConfiguration.players.map((_, index) => `player-${index}`)

        this.players = gameConfiguration.players.map((playerConfiguration, index) => {
            const cards = Array.from(Array(gameConfiguration.cardsPerPlayer)).map(() => this.cards.pop()!)
            if (playerConfiguration.type === PlayerType.HUMAN) {
                return new HumanPlayer(playersIds[index], cards)
            } else {
                const aiPlayerConfig: AiPlayerConfig = {
                    playerId: playersIds[index],
                    playersIds: playersIds,
                    cards: cards,
                    turnOrder: index,
                    gameConfig: gameConfiguration,
                    aiConfiguration: playerConfiguration,
                }
                return new AiPlayer(aiPlayerConfig)
            }
        })

        this.lastTurnPlayerId = -1
    }

    public isGameOver(): boolean {
        return this.board.getEmptyVertices().length <= 0
    }

    public finishGame(): void {
        const playerVerticesMap = this.board.getPlayerVerticesMap()
        console.log(`Adding bonus points`)
        this.players.forEach((player) => {
            player.finish()
            player.addScore(playerVerticesMap[player.id]?.length ?? 0)
        })
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

        console.log(`\tPlayer '${move.playerId}' putting card '${move.direction}' on vertix ${move.vertixId}`)

        const totalScore = moveScores.reduce((acc, moveScore) => {
            console.log(`\t======== ${ScoreType[moveScore.scoreType]} ========`)
            moveScore.vertices.forEach((vertix, index) => {
                vertix.ownerId = move.playerId

                // if (index > 0) {
                //     const link = vertix.getLinkTo(moveScore.vertices[index - 1])
                //     console.log(`\t\tChanging link '${link?.id}' to ${move.playerId}`)
                // }
            })
            console.log(
                `\t\t\tCombination vertices [${moveScore.vertices.length}]: ${moveScore.vertices.map((vertix) => `${vertix.id} (${vertix.direction!})`).join(', ')}`
            )
            return acc + moveScore.points
        }, 0)
        console.log(`\t\tTotal: ${totalScore}`)
        currentPlayer.addScore(totalScore)

        currentPlayer.drawCard(this.cards.pop()!)
        this.lastTurnPlayerId = turnPlayerId
        this.printBoard()
    }

    private printBoard() {
        const vertices = this.board.getVertices()
        for (let i = 0; i < 9; i += 3) {
            let text = ''
            for (let j = 0; j < 3; ++j) {
                const vertice = vertices[i + j]
                text += `(${vertice.id}) ${vertice.direction ?? '-'}\t\t\t\t`
            }
            console.log(text)
        }
        console.log(`Current score: ` + JSON.stringify(this.getScores()))
    }
}
