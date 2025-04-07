import { ReactNode, useState } from 'react';
import { GamePlayerCommonAttributes } from '../engine/game-configuration/game-configuration';
import { usePlayerTurnChangedListener } from '../events/events';
import './ScoreComponent.scss';


// →→➡︎➜➤➧➨➨➨➤➡︎
export const ScoreComponent = (props: { player: GamePlayerCommonAttributes }): ReactNode => {
    const [score, setScore] = useState<number>(0);
    const [turn, setTurn] = useState<Boolean>(false);

    usePlayerTurnChangedListener(payload => {
        setTurn(payload.playerId === props.player.id);
    })
    return <div className='score'><span style={{ color: turn ? 'unset' : 'transparent' }}>➤ </span>Score: {score}</div>;
};
