import {
    emitCardAddedToPlayer,
    emitMakeMoveCommand,
    emitPlayerMadeMoveEvent,
    emitPlayerTurnChanged,
} from '../events/events'
import { arrayShuffler } from '../math/array-shufller'
import { Board } from './board/board'
import { BoardSerializer } from './board/board-serializer'
import { Card } from './card'
import { Directions, directions } from './directions'
import { GameConfiguration } from './game-configuration/game-configuration'
import { PlayerType } from './game-configuration/player-type'
import { AiPlayer, AiPlayerConfig } from './players/ai-player'
import { HumanPlayer } from './players/human-player'
import { Player } from './players/player'
import { ScoreType } from './score-calculator/score-type'

export class GameEngine {
    private readonly _notPlayedCards: Card[]
    private readonly _players: Player[]
    private readonly _board: Board
    private lastPlayerToPlayIndex: number

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

        this._players = this.createPlayers(gameConfiguration)

        this.lastPlayerToPlayIndex = -1
    }

    private createPlayers(gameConfiguration: GameConfiguration): Player[] {
        return gameConfiguration.players.map((playerConfiguration, index) => {
            const cards = Array.from(Array(gameConfiguration.cardsPerPlayer)).map(() => this._notPlayedCards.pop()!)
            if (playerConfiguration.type === PlayerType.HUMAN) {
                return new HumanPlayer(playerConfiguration.id, index, cards)
            } else {
                const aiPlayerConfig: AiPlayerConfig = {
                    playerId: playerConfiguration.id,
                    playersIds: gameConfiguration.players.map((player) => player.id),
                    cards: cards,
                    turnOrder: index,
                    gameConfig: gameConfiguration,
                    aiConfiguration: playerConfiguration,
                }
                return new AiPlayer(aiPlayerConfig)
            }
        })
    }

    public get board(): Board {
        return this._board
    }

    public start(): void {
        this._players.forEach((player) => {
            console.log(`Player ${player.id} (${player.type})`)
            console.log(`\tCards: ${player.cards.map((card) => card.direction).join(', ')}`)
            player.cards.forEach((card) => {
                emitCardAddedToPlayer({
                    playerId: player.id,
                    card: card,
                })
            })
        })
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

    private startNextPlayerTurn(): Player {
        this.lastPlayerToPlayIndex
        const turnPlayerId = (this.lastPlayerToPlayIndex + 1) % this._players.length
        const currentPlayer = this._players[turnPlayerId]
        console.log(`\n\n================= Player ${currentPlayer.id} turn =================`)
        emitPlayerTurnChanged({
            playerId: currentPlayer.id,
        })
        return currentPlayer
    }

    public async playNextRound() {
        const currentPlayer = this.startNextPlayerTurn()

        emitMakeMoveCommand({
            playerId: currentPlayer.id,
        })
        const move = await currentPlayer.makeMove({ board: this._board, scores: this.getScores() })
        emitPlayerMadeMoveEvent(move)
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

        const playersNewCard = this._notPlayedCards.pop()
        if (playersNewCard) {
            currentPlayer.drawCard(playersNewCard)
            emitCardAddedToPlayer({
                playerId: currentPlayer.id,
                card: playersNewCard,
            })
        }

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
