import { GameConfiguration, GamePlayerConfiguration } from '../../engine/game-configuration/game-configuration';
import { Move } from '../../engine/score-calculator/move';
import { MoveScore } from '../../engine/score-calculator/move-score';
import { ScoreType } from '../../engine/score-calculator/score-type';
import { emitAnnounceScoreCommand, emitBeginVerticesAnimationsCommand, emitEndOfBonusPointsEvent, emitEndOfScoreAnimationsEvent, emitFinishVerticesAnimationsCommand, emitLinkAnimationCommand, EndGameBonusPointsEvent, useEndGameBonusPointsEventListener, usePlayerMadeMoveEventListener } from '../../events/events';
import { sleep } from '../../math/sleep';

export class ScoreAnimationCoordinator {
    public static readonly INTERVAL_BETWEEN_ANIMATIONS = 2000;
    public static readonly INTERVAL_BETWEEN_LINKS_ANIMATIONS = 300;
    private readonly players: GamePlayerConfiguration[];

    public constructor(configuration: GameConfiguration) {
        this.players = configuration.players;
        usePlayerMadeMoveEventListener(payload => {
            this.startScoreAnimation(payload);
        });

        useEndGameBonusPointsEventListener(async payload => {
            await sleep(ScoreAnimationCoordinator.INTERVAL_BETWEEN_ANIMATIONS);
            this.startEndGameBonusPointsAnimation(payload);
        });

    }
    private async startEndGameBonusPointsAnimation(payload: EndGameBonusPointsEvent[]) {
        const currentBonus = payload.shift();
        if (currentBonus?.vertices.length === 0) {
            this.startEndGameBonusPointsAnimation(payload);
            return;
        }

        if (!currentBonus) {
            emitEndOfBonusPointsEvent();
            return;
        }

        emitBeginVerticesAnimationsCommand({
            playerId: currentBonus.playerId,
            score: { vertices: currentBonus.vertices, points: currentBonus.vertices.length, scoreType: ScoreType.BONUS }
        });

        emitFinishVerticesAnimationsCommand({
            playerId: currentBonus.playerId,
            points: currentBonus.vertices.length
        });
        this.startEndGameBonusPointsAnimation(payload);
        await sleep(ScoreAnimationCoordinator.INTERVAL_BETWEEN_ANIMATIONS);
    }

    private async startScoreAnimation(payload: Move & { scores: MoveScore[]; }) {
        const currentScore = payload.scores.shift();

        if (!currentScore) {
            emitEndOfScoreAnimationsEvent();
            return;
        }

        await sleep(ScoreAnimationCoordinator.INTERVAL_BETWEEN_ANIMATIONS / 2);

        emitAnnounceScoreCommand({ type: currentScore.scoreType })

        await sleep(ScoreAnimationCoordinator.INTERVAL_BETWEEN_ANIMATIONS);

        emitBeginVerticesAnimationsCommand({ playerId: payload.playerId, score: currentScore });

        for (let i = 1; i < currentScore.vertices.length; i++) {
            await sleep(ScoreAnimationCoordinator.INTERVAL_BETWEEN_LINKS_ANIMATIONS);
            emitLinkAnimationCommand({
                playerTurnOrder: this.players.findIndex(player => player.id == payload.playerId),
                playerId: payload.playerId,
                score: currentScore,
                first: currentScore.vertices[i],
                second: currentScore.vertices[i - 1]
            });

            //last link animation
            if (i === currentScore.vertices.length - 1) {
                await sleep(ScoreAnimationCoordinator.INTERVAL_BETWEEN_ANIMATIONS)
                emitFinishVerticesAnimationsCommand({ playerId: payload.playerId, points: currentScore.points });
                this.startScoreAnimation({
                    ...payload,
                    scores: payload.scores
                });

            }


        }
    }
}
