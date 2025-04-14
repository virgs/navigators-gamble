import { ReactNode, useState } from 'react';
import { colors } from '../constants/colors';
import { GamePlayerCommonAttributes } from '../engine/game-configuration/game-configuration';
import { useFinishVerticesAnimationsCommandListener, usePlayerTurnChangedListener } from '../events/events';
import './ScoreComponent.scss';

export const ScoreComponent = (props: { player: GamePlayerCommonAttributes, turnOrder: number }): ReactNode => {
    const color: string = props.turnOrder !== undefined ? colors[props.turnOrder] : 'var(--compass-highlight-red)'

    const [score, setScore] = useState<number>(0);
    const [turn, setTurn] = useState<Boolean>(false);

    useFinishVerticesAnimationsCommandListener(payload => {
        if (payload.playerId === props.player.id) {
            setScore(score + payload.points);
        }
    });

    usePlayerTurnChangedListener(payload => {
        setTurn(payload.playerId === props.player.id);
    })

    return <div className='score d-flex align-items-center' style={{ color: color, fontSize: '1.75rem' }}>
        <i className="bi bi-coin mx-2" style={{}}></i>
        {score}
        <span className='ms-1 turn-arrow' style={{ color: turn ? color : 'transparent' }}>⬅︎</span>
    </div>;
};
