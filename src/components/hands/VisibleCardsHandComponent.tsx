import { Reorder } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { Card } from '../../engine/card';
import { GamePlayerCommonAttributes } from '../../engine/game-configuration/game-configuration';
import { emitVisibleCardSelectedEvent, MakeMoveCommand, useCardAddedToPlayerListener, useVisibleHandMakeMoveCommandListener } from '../../events/events';
import { CardComponent } from '../CardComponent';
import { ScoreComponent } from '../ScoreComponent';
import './VisibleCardsHandComponent.scss';


type VisibleCardsHandComponentProps = {
    player: GamePlayerCommonAttributes;
};

export const VisibleCardsHandComponent = (props: VisibleCardsHandComponentProps): ReactNode => {
    const [makeMoveCommand, setMakeMoveCommand] = useState<MakeMoveCommand | undefined>(undefined);
    const [cards, setCards] = useState<Card[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string>('');
    // const [playerTurn, setPlayerTurn] = useState<boolean>(false);


    useCardAddedToPlayerListener((event) => {
        if (event.playerId === props.player.id) {
            setCards((prevCards) => [...prevCards, event.card]);
        }
    })

    useVisibleHandMakeMoveCommandListener((event => {
        if (event.playerId === props.player.id) {
            setMakeMoveCommand(event);
            // setPlayerTurn(true)
            setSelectedCardId('')
        } else {
            setMakeMoveCommand(undefined);
            // setPlayerTurn(false)
        }
    }))

    const onCardSelected = (card: Card) => {
        if (makeMoveCommand) {
            setSelectedCardId(card.id);
            emitVisibleCardSelectedEvent({
                card: card,
                id: makeMoveCommand.id,
                playerId: props.player.id
            });
        }
    }

    return <div className='px-2'>
        <ScoreComponent player={props.player} ></ScoreComponent>
        <Reorder.Group className='d-flex p-0 m-0 align-items-start row' values={cards} onReorder={setCards} axis='x'>
            {cards.map(card => {
                return <Reorder.Item key={card.id} value={card}
                    style={{ padding: '2px' }}
                    className='d-flex align-items-center justify-content-center col-2 col-md-4 col-lg'
                    drag={false}
                    // dragListener={true}
                    // axis='x'
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
