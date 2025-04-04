import { ReactNode, useState } from 'react';
import { Card } from '../../engine/card';
import { GamePlayerCommonAttributes } from '../../engine/game-configuration/game-configuration';
import { useCardAddedToPlayerListener } from '../../events/events';
import { CardComponent } from '../CardComponent';
import { ScoreComponent } from '../ScoreComponent';
import './HiddenCardsHandComponent.scss';
import { Reorder } from 'framer-motion';

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

    const old = <div className='px-2 h-100'>
        <ScoreComponent player={props.player} ></ScoreComponent>
        <div className='hidden-cards-hand'>
            {cards.map((card, index) => {
                return <div key={card.id} className='hidden-cards-hand-card' style={{ left: (index * spacingBetweenCards) + 'px' }}>
                    <CardComponent card={card}></CardComponent>
                </div>
            })}
        </div>
    </div>
    return <div className='px-2 h-100'>
        <ScoreComponent player={props.player} ></ScoreComponent>
        <Reorder.Group className='d-flex p-0 m-0 align-items-start' values={cards} onReorder={setCards} axis='x'
            style={{ position: 'relative' }}>
            {cards.map((card, index) => {
                return <Reorder.Item key={card.id} value={card}
                    className='d-flex justify-content-start'
                    style={{ width: '15%' }}
                    dragListener={false}
                    axis='' // do not allow drags
                >
                    <div key={card.id} className='hidden-cards-hand-card'
                    >
                        <CardComponent card={card}></CardComponent>
                    </div>
                </Reorder.Item>
            }
            )}
        </Reorder.Group>
    </div>
};

