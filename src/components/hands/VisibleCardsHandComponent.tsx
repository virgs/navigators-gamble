import { ReactNode, use, useState } from 'react';
import { GamePlayerCommonAttributes } from '../../engine/game-configuration/game-configuration';
import { CardComponent } from '../CardComponent';
import { ScoreComponent } from '../ScoreComponent';
import './VisibleCardsHandComponent.scss';
import { Card } from '../../engine/card';
import { emitPlayerMadeMoveEvent, emitVisibleCardSelectedEvent, useCardAddedToPlayerListener, usePlayerTurnChangedListener } from '../../events/events';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { emit } from 'process';


type VisibleCardsHandComponentProps = {
    player: GamePlayerCommonAttributes;
};

export const VisibleCardsHandComponent = (props: VisibleCardsHandComponentProps): ReactNode => {
    const [cards, setCards] = useState<Card[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string>('');
    const [playerTurn, setPlayerTurn] = useState<boolean>(false);


    useCardAddedToPlayerListener((event) => {
        if (event.playerId === props.player.id) {
            setCards((prevCards) => [...prevCards, event.card]);
        }
    })

    usePlayerTurnChangedListener((event => {
        if (event.playerId === props.player.id) {
            setPlayerTurn(true)
            setSelectedCardId('')
        } else {
            setPlayerTurn(false)
        }
    }))

    const onCardSelected = (card: Card) => {
        if (playerTurn) {
            setSelectedCardId(card.id);
            emitVisibleCardSelectedEvent({ card: card });
        }
    }

    return <div className='px-2'>
        <ScoreComponent player={props.player} ></ScoreComponent>
        <Reorder.Group className='d-flex p-0 m-0 align-items-start' values={cards} onReorder={setCards} axis='x'>
            {cards.map(card => {
                return <Reorder.Item key={card.id} value={card}
                    className='p-1 w-100 d-flex justify-content-center'
                    dragListener={true}
                    axis='x'
                    onPointerDown={() => onCardSelected(card)}
                    // drag // allows to move in both directions
                    dragElastic={0.2}
                    dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}>
                    <CardComponent selected={selectedCardId === card.id} card={card}></CardComponent>
                </Reorder.Item>
            }
            )}
        </Reorder.Group>
    </div>
};
