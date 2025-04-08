import { ReactNode, useEffect, useState } from 'react';
import { GamePlayerCommonAttributes } from '../engine/game-configuration/game-configuration';
import { MoveScore } from '../engine/score-calculator/move-score';
import { emitEndOfScoreAnimationsEvent, emitScoreAnimationCommand, usePlayerMadeMoveEventListener, usePlayerTurnChangedListener } from '../events/events';
import { useTimeout } from '../hooks/use-timeout';
import './ScoreComponent.scss';


const intervalBetweenAnimations = 2000;
const intervalBetweenVerticesAnimations = 500

// →→➡︎➜➤➧➨➨➨➤➡︎
export const ScoreComponent = (props: { player: GamePlayerCommonAttributes }): ReactNode => {
    const [moveScoreAnimations, setMoveScoreAnimations] = useState<MoveScore[]>([]);
    const [nextAnimationDelay, setNextAnimationDelay] = useState<number | null>(null);
    const [score, setScore] = useState<number>(0);
    const [turn, setTurn] = useState<Boolean>(false);

    useEffect(() => {
        console.log('ScoreComponent', props.player.id);
    }, []);

    useTimeout(() => {
        console.log('triggered', moveScoreAnimations.length);
        if (moveScoreAnimations.length > 0) {
            const moveScore = moveScoreAnimations[0];
            setScore(score => score + moveScore.points);
            emitScoreAnimationCommand(moveScore);
            if (moveScoreAnimations.length === 1) {
                setNextAnimationDelay(null);
            }
            setMoveScoreAnimations(animations => animations.slice(1));
        } else {
            emitEndOfScoreAnimationsEvent();
        }
    }, nextAnimationDelay);

    usePlayerMadeMoveEventListener(payload => {
        if (payload.playerId === props.player.id) {
            if (payload.scores.length === 0) {
                console.log('No scores', payload.playerId);
                emitEndOfScoreAnimationsEvent();
                setNextAnimationDelay(null);
            } else {
                setNextAnimationDelay(intervalBetweenAnimations);
            }
        }
    });

    usePlayerTurnChangedListener(payload => {
        setTurn(payload.playerId === props.player.id);
    })
    return <div className='score'><span style={{ color: turn ? 'unset' : 'transparent' }}>➤ </span>Score: {score}</div>;
};
