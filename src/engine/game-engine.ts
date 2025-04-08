import { emitCardAddedToPlayer, emitNewGame, emitPlayerMadeMoveEvent, emitPlayerTurnChanged } from '../events/events'
import { arrayShuffler } from '../math/array-shufller'
import { Board } from './board/board'
import { BoardSerializer } from './board/board-serializer'
import { Card } from './card'
import { Directions, directions } from './directions'
import { GameConfiguration } from './game-configuration/game-configuration'
import { PlayerType } from './game-configuration/player-type'
import { AiPlayer, AiPlayerInitialization } from './players/ai-player'
import { HumanPlayer } from './players/human-player'
import { Player } from './players/player'
import { MoveScore } from './score-calculator/move-score'
import { ScoreType } from './score-calculator/score-type'

export class GameEngine {
    private readonly _notPlayedYetCards: Card[]
    private readonly _players: Player[]
    private readonly _board: Board
    private currentlyPlayingPlayerIndex: number

    public constructor(gameConfiguration: GameConfiguration) {
        this._notPlayedYetCards = arrayShuffler(
            directions
                .map((direction) => Array(gameConfiguration.cardsPerDirection).fill(direction))
                .flat()
                .map((direction, index) => new Card(`card-${index}`, direction))
        )

        this._board = BoardSerializer.deserialize(gameConfiguration.board)

        if (
            this._board.getVertices().length >=
            this._notPlayedYetCards.length - gameConfiguration.players.length * gameConfiguration.cardsPerPlayer
        ) {
            throw Error(
                `Board has too many vertix to game configuration '${this._board.getVertices().length}'. Max allowed '${this._notPlayedYetCards.length - gameConfiguration.players.length * gameConfiguration.cardsPerPlayer}'`
            )
        }

        this._players = this.createPlayers(gameConfiguration)

        this.currentlyPlayingPlayerIndex = -1
    }

    private createPlayers(gameConfiguration: GameConfiguration): Player[] {
        return gameConfiguration.players.map((playerConfiguration, index) => {
            const cards = Array.from(Array(gameConfiguration.cardsPerPlayer)).map(() => this._notPlayedYetCards.pop()!)
            // .map((card) => {
            //     card.ownerId = playerConfiguration.id
            //     return card
            // })
            if (playerConfiguration.type === PlayerType.HUMAN) {
                return new HumanPlayer(playerConfiguration.id, cards)
            } else {
                const aiPlayerConfig: AiPlayerInitialization = {
                    playerId: playerConfiguration.id,
                    playersIds: gameConfiguration.players.map((player) => player.id),
                    cards: cards,
                    turnOrder: index,
                    gameConfig: gameConfiguration,
                    configuration: playerConfiguration,
                }
                return new AiPlayer(aiPlayerConfig)
            }
        })
    }

    public get board(): Board {
        return this._board
    }

    public start(): void {
        emitNewGame()

        this._players.forEach((player) => {
            player.cards.forEach((card) => {
                emitCardAddedToPlayer({
                    playerId: player.id,
                    card: card,
                })
            })
        })
    }

    public isGameOver(): boolean {
        if (this._notPlayedYetCards.length <= 0) {
            console.log('No more cards to play')
            return true
        }

        return this._board.getEmptyVertices().length <= 0
    }

    public finish(): void {
        const playerVerticesMap = this._board.getPlayerVerticesMap()
        console.log(`Adding bonus points`)
        this._players.forEach((player) => {
            player.finish()
            player.addScore(playerVerticesMap[player.id]?.length ?? 0)
        })
        console.log(`Final score: ` + JSON.stringify(this.getScores()))
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

    private startNextTurn(): Player {
        this.currentlyPlayingPlayerIndex = (this.currentlyPlayingPlayerIndex + 1) % this._players.length
        const currentPlayer = this._players[this.currentlyPlayingPlayerIndex]
        emitPlayerTurnChanged({
            turnOrder: this.currentlyPlayingPlayerIndex,
            playerId: currentPlayer.id,
        })

        return currentPlayer
    }

    public async playNextRound(): Promise<void> {
        if (this.isGameOver()) {
            console.log('Game over')
            return
        }
        const currentPlayer = this.startNextTurn()
        console.log(`\n\n========= Player ${currentPlayer.id} turn =========`)

        const move = await currentPlayer.makeMove({ board: this._board, scores: this.getScores() })
        const moveScores: MoveScore[] = this._board.makeMove(move)
        emitPlayerMadeMoveEvent({ ...move, scores: moveScores })

        const totalScore = moveScores.reduce((acc, moveScore) => {
            console.log(`\t======== ${ScoreType[moveScore.scoreType]} ========`)
            moveScore.vertices.forEach((vertix) => {
                vertix.ownerId = move.playerId

                // if (index > 0) {
                //     const link = vertix.getLinkTo(moveScore.vertices[index - 1])
                //     console.log(`\t\tChanging link '${link?.id}' to ${move.playerId}`)
                // }
            })
            console.log(
                `\t\t\tCombination vertices [${moveScore.vertices.length}]: ${moveScore.vertices.map((vertix) => `${vertix.id} (${Directions[vertix.direction!]})`).join(', ')}`
            )
            return acc + moveScore.points
        }, 0)
        console.log(`\t\tRound total: ${totalScore}`)
        currentPlayer.addScore(totalScore)

        const playersNewCard = this._notPlayedYetCards.pop()
        if (playersNewCard) {
            currentPlayer.drawCard(playersNewCard)
            emitCardAddedToPlayer({
                playerId: currentPlayer.id,
                card: playersNewCard,
            })
        }
        console.log(`Current score: ` + JSON.stringify(this.getScores()))
    }
}
