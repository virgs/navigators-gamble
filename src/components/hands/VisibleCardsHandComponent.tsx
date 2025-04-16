import { Reorder } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { Card } from '../../engine/card';
import { GamePlayerCommonAttributes } from '../../engine/game-configuration/game-configuration';
import { emitVisibleCardSelectedEvent, MakeMoveCommand, useCardAddedToPlayerListener, useNewGameListener, useVisibleHandMakeMoveCommandListener, useVisibleVertixSelectedEventListener, VisibleVertixSelectedEvent } from '../../events/events';
import { CardComponent } from '../card/CardComponent';
import { ScoreComponent } from '../score/ScoreComponent';
import './VisibleCardsHandComponent.scss';


type VisibleCardsHandComponentProps = {
    player: GamePlayerCommonAttributes;
    turnOrder: number
};

export const VisibleCardsHandComponent = (props: VisibleCardsHandComponentProps): ReactNode => {
    const [makeMoveCommand, setMakeMoveCommand] = useState<MakeMoveCommand | undefined>(undefined);
    const [cards, setCards] = useState<Card[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string>('');

    useNewGameListener(() => setCards([]))

    useVisibleVertixSelectedEventListener((event: VisibleVertixSelectedEvent) => {
        setCards(cards.filter(card => card.id !== event.card.id))
        setSelectedCardId('');
        setMakeMoveCommand(undefined);
    })

    useCardAddedToPlayerListener((event) => {
        if (event.playerId === props.player.id) {
            event.card.reveal()
            setCards((prevCards) => [...prevCards, event.card]);
        }
    })

    useVisibleHandMakeMoveCommandListener((event => {
        if (event.playerId === props.player.id) {
            setMakeMoveCommand(event);
            setSelectedCardId('')
        } else {
            setMakeMoveCommand(undefined);
        }
    }))

    const onCardSelected = (card: Card) => {
        if (makeMoveCommand !== undefined) {
            setSelectedCardId(card.id);
            emitVisibleCardSelectedEvent({
                card: card,
                id: makeMoveCommand.commandId,
                playerId: props.player.id,
            });
        }
    }

    props.player

    return <div className='px-2'>
        <ScoreComponent turnOrder={props.turnOrder} player={props.player} ></ScoreComponent>
        <Reorder.Group className='d-flex p-0 m-0 align-items-start h-100' values={cards} onReorder={setCards} axis='x'>
            {cards.map(card => {
                return <Reorder.Item key={card.id} value={card}
                    style={{ padding: '2px', cursor: 'pointer' }}
                    whileHover={{ scale: 1.05 }}
                    className='d-flex align-items-center justify-content-center w-100'
                    drag={false}
                    onPointerDown={() => onCardSelected(card)}
                    dragElastic={0.2}
                    dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}>
                    <CardComponent selected={selectedCardId === card.id} card={card}></CardComponent>
                </Reorder.Item>
            }
            )}
        </Reorder.Group>
    </div>
};
