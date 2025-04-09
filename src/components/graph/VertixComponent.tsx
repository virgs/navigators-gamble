import { ReactNode, useState } from 'react';
import { SerializableVertix } from '../../engine/board/serializable-board';
import { Card } from '../../engine/card';
import { emitVisibleVertixSelectedEvent, useBeginVerticesAnimationsCommandListener, useFinishVerticesAnimationsCommandListener, usePlayerMadeMoveEventListener, usePlayerTurnChangedListener, useVisibleCardSelectedEventListener, VisibleCardSelectedEvent } from '../../events/events';
import { CardComponent, CardComponentProps } from '../CardComponent';
import './VertixComponent.scss';

type VertixProps = {
    vertix: SerializableVertix;
};

export const VertixComponent = (props: VertixProps): ReactNode => {
    const [classes, setClasses] = useState<string[]>(['vertix', 'empty']);
    const [cardConfiguration, setCardConfiguration] = useState<CardComponentProps | undefined>(undefined);
    const [currentlyPlayerTurnOrder, setCurrentlyPlayerOrder] = useState<number>(0)
    const [selectedCard, setSelectedCard] = useState<VisibleCardSelectedEvent | undefined>(undefined);


    usePlayerTurnChangedListener(event => {
        setCurrentlyPlayerOrder(event.turnOrder)
    })

    useVisibleCardSelectedEventListener((event) => {
        if (!cardConfiguration) {
            setSelectedCard(event);
            setClasses(list => list.concat('clickable'));
        } else {
            setSelectedCard(undefined);
        }
    });

    usePlayerMadeMoveEventListener((event) => {
        setClasses(list => list.filter(item => item !== 'clickable'));
        setSelectedCard(undefined);
        if (event.vertixId === props.vertix.id) { //card is placed
            setClasses(list => list
                .filter(item => item !== 'clickable')
                .filter(item => item !== 'empty'));
            const card = new Card(event.cardId!, event.direction!, false);
            setCardConfiguration({
                card: card,
                selected: false,
                ownerTurnOrder: undefined
            })
        }
    });

    useBeginVerticesAnimationsCommandListener(event => { //vertix scored
        if (cardConfiguration && event.score.vertices.find(item => item.id === props.vertix.id)) {
            setClasses(list => list
                .filter(item => item !== 'clickable')
                .filter(item => item !== 'empty')
                .concat('scoring'));
            setCardConfiguration({
                card: cardConfiguration.card,
                selected: false,
                ownerTurnOrder: currentlyPlayerTurnOrder
            })
        }
    });

    useFinishVerticesAnimationsCommandListener(() => setClasses(list => list
        .filter(item => item !== 'scoring')))

    const onPointerDown = () => {
        if (selectedCard) {
            emitVisibleVertixSelectedEvent({
                vertix: props.vertix,
                card: selectedCard.card,
                moveId: selectedCard.id,
                playerId: selectedCard.playerId,
            });
        }
    }

    const style: React.CSSProperties = {
        top: `${props.vertix.position.y * 100}%`,
        left: `${props.vertix.position.x * 100}%`,
        cursor: selectedCard ? 'pointer' : 'unset'
    };
    return (
        <div className={classes.join(' ')} data-id={props.vertix.id}
            style={style}
            onPointerDown={onPointerDown}>
            {cardConfiguration ? <CardComponent selected={cardConfiguration.selected}
                card={cardConfiguration.card}
                ownerTurnOrder={cardConfiguration.ownerTurnOrder}></CardComponent> : <>X</>}
        </div>
    )
}

