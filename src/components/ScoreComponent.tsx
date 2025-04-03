import { ReactNode, useEffect, useState } from 'react';
import { GamePlayerCommonAttributes } from '../engine/game-configuration/game-configuration';
import { usePlayerTurnChangedListener } from '../events/events';
import './ScoreComponent.scss';


// →→➡︎➜➤➧➨➨➨➤➡︎
export const ScoreComponent = (props: { player: GamePlayerCommonAttributes }): ReactNode => {
    const [score, setScore] = useState<number>(0);
    const [turn, setTurn] = useState<Boolean>(false);

    useEffect(() => {
        console.log('ScoreComponent mounted', props.player.id);
    }, [])

    usePlayerTurnChangedListener(payload => {
        if (payload.playerId === props.player.id) {
            console.log('Player turn notification', payload);
        }
        setTurn(payload.playerId === props.player.id);
    })
    return <div className='score'><span style={{ color: turn ? 'unset' : 'transparent' }}>➤ </span>Score: {score}</div>;
};
