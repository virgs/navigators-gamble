import { ReactNode, useState } from 'react';
import { Card } from '../../engine/card';
import { GamePlayerCommonAttributes } from '../../engine/game-configuration/game-configuration';
import { useCardAddedToPlayerListener } from '../../events/events';
import { CardComponent } from '../CardComponent';
import { ScoreComponent } from '../ScoreComponent';
import './HiddenCardsHandComponent.scss';

type HiddenCardsHandComponentProps = {
    player: GamePlayerCommonAttributes
};

const spacingBetweenCards = 20;
export const HiddenCardsHandComponent = (props: HiddenCardsHandComponentProps): ReactNode => {
    const [cards, setCards] = useState<Card[]>([]);

    useCardAddedToPlayerListener((event) => {
        if (event.playerId === props.player.id) {
            setCards((prevCards) => [...prevCards, event.card]);
        }
    })

    return <div className='px-2'>
        <ScoreComponent player={props.player} ></ScoreComponent>
        <div className='hidden-cards-hand'>
            {cards.map((card, index) => {
                return <div key={card.id} className='hidden-cards-hand-card' style={{ left: (index * spacingBetweenCards) + 'px' }}>
                    <CardComponent card={card}></CardComponent>
                </div>
            })}
        </div>
    </div>
};

