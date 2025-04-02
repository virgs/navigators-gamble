import { arrayShuffler } from '../math/array-shufller'
import { Board } from './board/board'
import { BoardSerializer } from './board/board-serializer'
import { Card } from './card'
import { Directions, directions } from './directions'
import { GameConfiguration } from './game-configuration/game-configuration'
import { AiPlayer, AiPlayerConfig } from './players/ai-player'
import { HumanPlayer } from './players/human-player'
import { Player } from './players/player'
import { PlayerType } from './game-configuration/player-type'
import { ScoreType } from './score-calculator/score-type'

export class GameEngine {
    private readonly _notPlayedCards: Card[]
    private readonly _players: Player[]
    private readonly _board: Board
    private lastTurnPlayerId: number

    public constructor(gameConfiguration: GameConfiguration) {
        this._notPlayedCards = arrayShuffler(
            directions
                .map((direction) => Array(gameConfiguration.cardsPerDirection).fill(direction))
                .flat()
                .map((direction, index) => new Card(`id${index}`, direction))
        )

        this._board = BoardSerializer.deserialize(gameConfiguration.board)

        if (
            this._board.getVertices().length >=
            this._notPlayedCards.length - gameConfiguration.players.length * gameConfiguration.cardsPerPlayer
        ) {
            throw Error(
                `Board has too many vertix to game configuration '${this._board.getVertices().length}'. Max allowed '${this._notPlayedCards.length - gameConfiguration.players.length * gameConfiguration.cardsPerPlayer}'`
            )
        }

        const playersIds = gameConfiguration.players.map((_, index) => `player-${index}`)

        this._players = gameConfiguration.players.map((playerConfiguration, index) => {
            const cards = Array.from(Array(gameConfiguration.cardsPerPlayer)).map(() => this._notPlayedCards.pop()!)
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

    public get players(): Player[] {
        return this._players
    }

    public get board(): Board {
        return this._board
    }

    public isGameOver(): boolean {
        return this._board.getEmptyVertices().length <= 0
    }

    public finishGame(): void {
        const playerVerticesMap = this._board.getPlayerVerticesMap()
        console.log(`Adding bonus points`)
        this._players.forEach((player) => {
            player.finish()
            player.addScore(playerVerticesMap[player.id]?.length ?? 0)
        })
    }

    public getScores(): Record<string, number> {
        return this._players.reduce(
            (acc, player) => {
                acc[player.id] = player.score
                return acc
            },
            {} as Record<string, number>
        )
    }

    public async playNextRound() {
        const turnPlayerId = (this.lastTurnPlayerId + 1) % this._players.length
        const currentPlayer = this._players[turnPlayerId]

        const move = await currentPlayer.makeMove({ board: this._board, scores: this.getScores() })
        const moveScores = this._board.makeMove(move)

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

        currentPlayer.drawCard(this._notPlayedCards.pop()!)
        this.lastTurnPlayerId = turnPlayerId
        this.printBoard()
    }

    private printBoard() {
        const vertices = this._board.getVertices()
        for (let i = 0; i < 9; i += 3) {
            let text = ''
            for (let j = 0; j < 3; ++j) {
                const vertice = vertices[i + j]
                text += `(${vertice.id}) ${vertice.direction ? Directions[vertice.direction] : '-'}\t\t\t\t`
            }
            console.log(text)
        }
        console.log(`Current score: ` + JSON.stringify(this.getScores()))
    }
}
