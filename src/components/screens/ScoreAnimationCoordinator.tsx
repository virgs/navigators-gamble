import { GamePlayerConfiguration, GameConfiguration } from '../../engine/game-configuration/game-configuration';
import { Move } from '../../engine/score-calculator/move';
import { MoveScore } from '../../engine/score-calculator/move-score';
import { usePlayerMadeMoveEventListener, emitEndOfScoreAnimationsEvent, emitBeginVerticesAnimationsCommand, emitLinkAnimationCommand, emitFinishVerticesAnimationsCommand } from '../../events/events';

export class ScoreAnimationCoordinator {
    private static readonly intervalBetweenAnimations = 2000;
    private static readonly intervalBetweenLinksAnimations = 500;
    private readonly players: GamePlayerConfiguration[];

    public constructor(configuration: GameConfiguration) {
        this.players = configuration.players;
        console.log(this.players);
        usePlayerMadeMoveEventListener(payload => {
            setTimeout(() => {
                this.startScoreAnimation(payload);
            }, ScoreAnimationCoordinator.intervalBetweenAnimations);
        });

    }

    private startScoreAnimation(payload: Move & { scores: MoveScore[]; }) {
        if (payload.scores.length === 0) {
            emitEndOfScoreAnimationsEvent();
            return;
        }
        const currentScore = payload.scores[0];
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
                        emitFinishVerticesAnimationsCommand({ points: currentScore.points });
                        this.startScoreAnimation({
                            ...payload,
                            scores: payload.scores.slice(1)
                        });
                    }, ScoreAnimationCoordinator.intervalBetweenAnimations);

                }

            }, ScoreAnimationCoordinator.intervalBetweenLinksAnimations * i);
        }

    }
}
