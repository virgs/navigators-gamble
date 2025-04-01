import { ReactNode } from 'react';
import { Card } from '../engine/card';
import { CardComponent } from './CardComponent';
import './PlayerHandComponent.scss'

type PlayerHandComponentProps = {
    cards: Card[];
    score: number;
    turn: boolean;
    onCardSelected: (cardId: string, vertixId: string) => void;
};

export const PlayerHandComponent = (props: PlayerHandComponentProps): ReactNode => {
    //score
    //turn
    return <div className='player-hand' style={{ height: '100%' }}>
        {props.cards.map(card => {
            return <CardComponent key={card.id} card={card}></CardComponent>
        })}
    </div>
};
