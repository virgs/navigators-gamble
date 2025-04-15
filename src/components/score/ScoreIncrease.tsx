import { ReactNode, useEffect } from 'react';
import "./ScoreIncrease.scss";



export const ScoreIncrease = (props: {
    id: string
    increase: number
    onDismiss: (id: string) => void
}): ReactNode => {

    useEffect(() => {
        setTimeout(() => {
            props.onDismiss(props.id)
        }, 2000)
    }, [])

    return (
        <div className='score-increase-container'>
            <div className="score-increase">+{props.increase}</div>
        </div>
    );
}