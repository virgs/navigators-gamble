import { GameConfiguration, GamePlayerConfiguration } from '../../engine/game-configuration/game-configuration'
import { PlayerType } from '../../engine/game-configuration/player-type'
import { Move } from '../../engine/score-calculator/move'
import { MoveScore } from '../../engine/score-calculator/move-score'
import { ScoreType } from '../../engine/score-calculator/score-type'
import {
    emitAnnounceCommand,
    emitBeginVerticesAnimationsCommand,
    emitEndOfBonusPointsEvent,
    emitEndOfScoreAnimationsEvent,
    emitFinishVerticesAnimationsCommand,
    emitLinkAnimationCommand,
    EndGameBonusPointsEvent,
    useEndGameBonusPointsEventListener,
    usePlayerMadeMoveEventListener,
} from '../../events/events'
import { sleep } from '../../math/sleep'

const scoreAnnouncementMap: Record<ScoreType, string> = {
    [ScoreType.BONUS]: 'Bonus points',
    [ScoreType.CANCEL]: 'Directions cancel',
    [ScoreType.SEQUENCE]: 'Direction sequence',
    [ScoreType.PAIR]: 'Direction pair',
}

export class ScoreAnimationCoordinator {
    public static readonly INTERVAL_BETWEEN_ANIMATIONS = 2000
    public static readonly INTERVAL_BETWEEN_LINKS_ANIMATIONS = 300
    private readonly players: GamePlayerConfiguration[]

    public constructor(configuration: GameConfiguration) {
        this.players = configuration.players
    }

    public createHooks(): void {
        usePlayerMadeMoveEventListener((payload) => {
            this.startScoreAnimation(payload)
        })

        useEndGameBonusPointsEventListener(async (payload: EndGameBonusPointsEvent[]) => {
            const humanPlayerScore =
                payload.find((endGame) => endGame.playerType === PlayerType.HUMAN)?.playerScore ?? 0
            const humanPlayerHasWon = payload
                .filter((endGame) => endGame.playerType !== PlayerType.HUMAN)
                .every((endGame) => endGame.playerScore < humanPlayerScore)

            await sleep(ScoreAnimationCoordinator.INTERVAL_BETWEEN_ANIMATIONS)
            emitAnnounceCommand({
                announcement: scoreAnnouncementMap[ScoreType.BONUS],
                duration: ScoreAnimationCoordinator.INTERVAL_BETWEEN_ANIMATIONS,
            })

            await sleep(ScoreAnimationCoordinator.INTERVAL_BETWEEN_ANIMATIONS)
            await this.startEndGameBonusPointsAnimation(payload)

            await sleep(ScoreAnimationCoordinator.INTERVAL_BETWEEN_ANIMATIONS)

            emitAnnounceCommand({
                announcement: humanPlayerHasWon ? 'You won!' : 'You lost!',
                duration: ScoreAnimationCoordinator.INTERVAL_BETWEEN_ANIMATIONS,
            })
            await sleep(2 * ScoreAnimationCoordinator.INTERVAL_BETWEEN_ANIMATIONS)
            emitEndOfBonusPointsEvent()
        })
    }

    private async startEndGameBonusPointsAnimation(payload: EndGameBonusPointsEvent[]): Promise<void> {
        const currentBonus = payload.shift()
        if (currentBonus === undefined || currentBonus.vertices.length === 0) {
            return
        }

        emitBeginVerticesAnimationsCommand({
            playerId: currentBonus.playerId,
            score: {
                vertices: currentBonus.vertices,
                points: currentBonus.vertices.length,
                scoreType: ScoreType.BONUS,
            },
        })

        await sleep(ScoreAnimationCoordinator.INTERVAL_BETWEEN_ANIMATIONS)

        emitFinishVerticesAnimationsCommand({
            playerId: currentBonus.playerId,
            points: currentBonus.vertices.length,
        })

        await sleep(ScoreAnimationCoordinator.INTERVAL_BETWEEN_ANIMATIONS * 0.5)

        return await this.startEndGameBonusPointsAnimation(payload)
    }

    private async startScoreAnimation(payload: Move & { scores: MoveScore[] }, scoreType?: ScoreType): Promise<void> {
        const currentScore = payload.scores.shift()

        if (!currentScore) {
            emitEndOfScoreAnimationsEvent()
            return
        }

        await sleep(ScoreAnimationCoordinator.INTERVAL_BETWEEN_ANIMATIONS / 2)

        if (scoreType !== currentScore.scoreType) {
            emitAnnounceCommand({
                announcement: scoreAnnouncementMap[currentScore.scoreType],
                duration: ScoreAnimationCoordinator.INTERVAL_BETWEEN_ANIMATIONS * 0.75,
            })
            await sleep(ScoreAnimationCoordinator.INTERVAL_BETWEEN_ANIMATIONS)
        }

        emitBeginVerticesAnimationsCommand({ playerId: payload.playerId, score: currentScore })

        for (let i = 1; i < currentScore.vertices.length; i++) {
            await sleep(ScoreAnimationCoordinator.INTERVAL_BETWEEN_LINKS_ANIMATIONS)
            emitLinkAnimationCommand({
                playerTurnOrder: this.players.findIndex((player) => player.id == payload.playerId),
                playerId: payload.playerId,
                score: currentScore,
                first: currentScore.vertices[i],
                second: currentScore.vertices[i - 1],
            })
        }

        await sleep(ScoreAnimationCoordinator.INTERVAL_BETWEEN_ANIMATIONS)
        emitFinishVerticesAnimationsCommand({ playerId: payload.playerId, points: currentScore.points })
        await this.startScoreAnimation(
            {
                ...payload,
                scores: payload.scores,
            },
            currentScore.scoreType
        )
    }
}
