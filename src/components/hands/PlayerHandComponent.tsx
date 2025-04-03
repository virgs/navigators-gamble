import { ReactNode } from 'react';
import './PlayerHandComponent.scss'
import { Card } from '../../engine/card';
import { CardComponent } from '../CardComponent';
import { ScoreComponent } from '../ScoreComponent';


type PlayerHandComponentProps = {
    cards: Card[];
    score: number;
    turn: boolean;
    onCardSelected: (cardId: string, vertixId: string) => void;
};

export const PlayerHandComponent = (props: PlayerHandComponentProps): ReactNode => {
    return <div className='px-2'>
        <ScoreComponent score={props.score} turn={props.turn} ></ScoreComponent>
        <div className='player-hand'>
            {props.cards.map(card => {
                return <CardComponent key={card.id} card={card}></CardComponent>
            })}
        </div>
    </div>
};
