import {
    emitCardAddedToPlayer,
    emitEndGameBonusPointsEvent,
    emitNewGame,
    emitPlayerMadeMoveEvent,
    emitPlayerTurnChanged,
    EndGameBonusPointsEvent,
} from '../events/events'
import { arrayShuffler } from '../math/array-shufller'
import { Board } from './board/board'
import { BoardSerializer } from './board/board-serializer'
import { Card } from './card'
import { directions } from './directions'
import { GameConfiguration } from './game-configuration/game-configuration'
import { GameConfigurationValidator } from './game-configuration/game-configuration-validator'
import { PlayerType } from './game-configuration/player-type'
import { AiPlayer, AiPlayerInitialization } from './players/ai-player'
import { HumanPlayer } from './players/human-player'
import { Player } from './players/player'
import { MoveScore } from './score-calculator/move-score'

export class GameEngine {
    private readonly _notPlayedYetCards: Card[]
    private readonly _players: Player[]
    private readonly _board: Board
    private started: boolean = false
    private currentlyPlayingPlayerIndex: number

    public constructor(gameConfiguration: GameConfiguration) {
        this._notPlayedYetCards = arrayShuffler(
            directions
                .map((direction) => Array(gameConfiguration.cardsPerDirection).fill(direction))
                .flat()
                .map((direction, index) => new Card(`card-${index}`, direction))
        )

        const validation = new GameConfigurationValidator(gameConfiguration).validate()
        if (!validation.valid) {
            throw Error(
                `Game configuration is not valid. Please check the game configuration. ${validation.errors.join('\n')}`
            )
        }
        this._board = BoardSerializer.deserialize(gameConfiguration.board)

        this._players = this.createPlayers(gameConfiguration)

        this.currentlyPlayingPlayerIndex = -1
    }

    private createPlayers(gameConfiguration: GameConfiguration): Player[] {
        return gameConfiguration.players.map((playerConfiguration, index) => {
            const cards = Array.from(Array(gameConfiguration.initialCardsPerPlayer)).map(
                () => this._notPlayedYetCards.pop()!
            )
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

    public createHooks(): void {
        this._players.forEach((player) => player.createHooks())
    }

    public start(): boolean {
        if (this.started) {
            return false
        }
        emitNewGame()

        this._players.forEach((player) => {
            player.cards.forEach((card) => {
                emitCardAddedToPlayer({
                    playerId: player.id,
                    card: card,
                })
            })
        })
        this.started = true
        return this.started
    }

    public isGameOver(): boolean {
        return this._board.getEmptyVertices().length <= 0
    }

    public calculateEndGameBonusPoints(): void {
        const endBonusPayload: EndGameBonusPointsEvent[] = []
        this._players.forEach((player, index) => {
            const vetices = this._board.getVertices().filter((vertix) => vertix.ownerId === player.id)
            player.addScore(vetices.length)
            const newLocal = {
                playerId: player.id,
                playerType: player.type,
                playerScore: player.score,
                playerTurnOrder: index,
                vertices: vetices,
            }
            endBonusPayload.push(newLocal)
        })
        emitEndGameBonusPointsEvent(endBonusPayload)
    }

    public finish(): void {
        this._players.forEach((player) => {
            player.finish()
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
            console.log('Game over. No more moves to play')
            return
        }
        const currentPlayer = this.startNextTurn()

        const move = await currentPlayer.makeMove({ board: this._board, scores: this.getScores() })
        const moveScores: MoveScore[] = this._board.makeMove(move)
        const totalScore = moveScores.reduce((acc, moveScore) => {
            moveScore.vertices.forEach((vertix) => (vertix.ownerId = move.playerId))
            return acc + moveScore.points
        }, 0)
        currentPlayer.addScore(totalScore)

        emitPlayerMadeMoveEvent({
            ...move,
            scores: moveScores,
            playerTurn: this.currentlyPlayingPlayerIndex,
        })

        const playersNewCard = this._notPlayedYetCards.pop()
        if (playersNewCard) {
            currentPlayer.drawCard(playersNewCard)
            emitCardAddedToPlayer({
                playerId: currentPlayer.id,
                card: playersNewCard,
            })
        }
    }
}
