import { ReactNode } from 'react';
import './ScoreComponent.scss'


// →→➡︎➜➤➧➨➨➨➤➡︎
export const ScoreComponent = (props: { score: number, turn: boolean }): ReactNode => {
    return <div className='score'><span style={{ color: props.turn ? 'unset' : 'transparent' }}>➤ </span>Score: {props.score}</div>;
};
