import { Reorder } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import { Card } from '../../engine/card';
import { GamePlayerCommonAttributes } from '../../engine/game-configuration/game-configuration';
import { Move } from '../../engine/score-calculator/move';
import { useCardAddedToPlayerListener, useNewGameListener, usePlayerMadeMoveEventListener } from '../../events/events';
import { CardComponent } from '../CardComponent';
import { ScoreComponent } from '../ScoreComponent';
import './HiddenCardsHandComponent.scss';

type HiddenCardsHandComponentProps = {
    player: GamePlayerCommonAttributes
};

export const HiddenCardsHandComponent = (props: HiddenCardsHandComponentProps): ReactNode => {
    const [cards, setCards] = useState<Card[]>([]);

    useNewGameListener(() => setCards([]))


    useEffect(() => {
        console.log('HiddenCardsHandComponent', props.player.id);
    }, []);


    usePlayerMadeMoveEventListener((event: Move) => {
        setCards(cards.filter(card => card.id !== event.cardId))
    })

    useCardAddedToPlayerListener((event) => {
        if (event.playerId === props.player.id) {
            setCards((prevCards) => [...prevCards, event.card]);
        }
    })

    return <div className='px-2 h-100'>
        <ScoreComponent player={props.player} ></ScoreComponent>
        <Reorder.Group className='d-flex p-0 m-0 align-items-start' values={cards} onReorder={setCards} axis='x'
            style={{ position: 'relative' }}>
            {cards.map((card) => {
                return <Reorder.Item key={card.id} value={card}
                    className='d-flex justify-content-start'
                    style={{ width: '15%' }}
                    axis='' // do not allow drags
                    dragListener={false}>
                    <div key={card.id} className='hidden-cards-hand-card'>
                        <CardComponent card={card} selected={false}></CardComponent>
                    </div>
                </Reorder.Item>
            }
            )}
        </Reorder.Group>
    </div>
};


