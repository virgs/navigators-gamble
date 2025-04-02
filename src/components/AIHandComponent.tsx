import { ReactNode } from 'react';
import { Card } from '../engine/card';
import { CardComponent } from './CardComponent';
import { ScoreComponent } from './ScoreComponent';
import './AIHandComponent.scss'

type AIHandComponentProps = {
    cards: Card[];
    score: number;
    turn: boolean;
    onCardSelected: (cardId: string, vertixId: string) => void;
};

export const AIHandComponent = (props: AIHandComponentProps): ReactNode => {
    const spacingBetweenCards = 20;
    return <div className='px-2'>
        <ScoreComponent score={props.score} turn={props.turn} ></ScoreComponent>
        <div className='ai-hand'>
            {props.cards.map((card, index) => {
                return <div key={card.id} className='ai-card' style={{ left: (index * spacingBetweenCards) + 'px' }}><CardComponent card={card}></CardComponent></div>
            })}
            <ScoreComponent score={props.score} turn={props.turn} ></ScoreComponent>
        </div>
    </div>
};

