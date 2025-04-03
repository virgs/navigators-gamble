import { ReactNode, useState } from 'react';
import { GamePlayerCommonAttributes } from '../../engine/game-configuration/game-configuration';
import { CardComponent } from '../CardComponent';
import { ScoreComponent } from '../ScoreComponent';
import './VisibleCardsHandComponent.scss';
import { Card } from '../../engine/card';
import { useCardAddedToPlayerListener } from '../../events/events';


type VisibleCardsHandComponentProps = {
    player: GamePlayerCommonAttributes;
};

export const VisibleCardsHandComponent = (props: VisibleCardsHandComponentProps): ReactNode => {
    const [cards, setCards] = useState<Card[]>([]);

    useCardAddedToPlayerListener((event) => {
        if (event.playerId === props.player.id) {
            setCards((prevCards) => [...prevCards, event.card]);
        }
    })

    return <div className='px-2'>
        <ScoreComponent player={props.player} ></ScoreComponent>
        <div className='visible-cards-hand'>
            {cards.map(card => {
                return <CardComponent key={card.id} card={card}></CardComponent>
            })}
        </div>
    </div>
};
