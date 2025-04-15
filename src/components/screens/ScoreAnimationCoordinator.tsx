import { GameConfiguration, GamePlayerConfiguration } from '../../engine/game-configuration/game-configuration';
import { Move } from '../../engine/score-calculator/move';
import { MoveScore } from '../../engine/score-calculator/move-score';
import { ScoreType } from '../../engine/score-calculator/score-type';
import { emitBeginVerticesAnimationsCommand, emitEndOfBonusPointsEvent, emitEndOfScoreAnimationsEvent, emitFinishVerticesAnimationsCommand, emitLinkAnimationCommand, EndGameBonusPointsEvent, useEndGameBonusPointsEventListener, usePlayerMadeMoveEventListener } from '../../events/events';

export class ScoreAnimationCoordinator {
    private static readonly intervalBetweenAnimations = 1500;
    private static readonly intervalBetweenLinksAnimations = 300;
    private readonly players: GamePlayerConfiguration[];

    public constructor(configuration: GameConfiguration) {
        this.players = configuration.players;
        usePlayerMadeMoveEventListener(payload => {
            setTimeout(() => {
                this.startScoreAnimation(payload);
            }, ScoreAnimationCoordinator.intervalBetweenAnimations);
        });

        useEndGameBonusPointsEventListener(payload => {
            setTimeout(() => {
                this.startEndGameBonusPointsAnimation(payload);
            }, ScoreAnimationCoordinator.intervalBetweenAnimations);
        });

    }
    private startEndGameBonusPointsAnimation(payload: EndGameBonusPointsEvent[]) {
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

        setTimeout(() => {
            this.startEndGameBonusPointsAnimation(payload);
        }, ScoreAnimationCoordinator.intervalBetweenAnimations);

    }

    private startScoreAnimation(payload: Move & { scores: MoveScore[]; }) {
        const currentScore = payload.scores.shift();

        if (!currentScore) {
            emitEndOfScoreAnimationsEvent();
            return;
        }
        emitBeginVerticesAnimationsCommand({ playerId: payload.playerId, score: currentScore });

        for (let i = 1; i < currentScore.vertices.length; i++) {
            setTimeout(() => {
                emitLinkAnimationCommand({
                    playerTurnOrder: this.players.findIndex(player => player.id == payload.playerId),
                    playerId: payload.playerId,
                    score: currentScore,
                    first: currentScore.vertices[i],
                    second: currentScore.vertices[i - 1]
                });

                //last link animation
                if (i === currentScore.vertices.length - 1) {
                    setTimeout(() => {
                        emitFinishVerticesAnimationsCommand({ playerId: payload.playerId, points: currentScore.points });
                        this.startScoreAnimation({
                            ...payload,
                            scores: payload.scores
                        });
                    }, ScoreAnimationCoordinator.intervalBetweenAnimations);

                }

            }, ScoreAnimationCoordinator.intervalBetweenLinksAnimations * i);
        }

    }
}
