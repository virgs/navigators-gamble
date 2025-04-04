import { ReactNode, useState } from 'react';
import { SerializableVertix } from '../../engine/board/serializable-board';
import { Card } from '../../engine/card';
import { emitVisibleVertixSelectedEvent, usePlayerMadeMoveEventListener, useVisibleCardSelectedEventListener, VisibleCardSelectedEvent } from '../../events/events';
import { CardComponent } from '../CardComponent';
import './VertixComponent.scss';

type VertixProps = {
    vertix: SerializableVertix;
};

export const VertixComponent = (props: VertixProps): ReactNode => {
    const [clickable, setClickable] = useState<VisibleCardSelectedEvent | undefined>(undefined);
    const [hasCard, setHasCard] = useState<Card | undefined>(undefined);

    useVisibleCardSelectedEventListener((event) => {
        if (!hasCard) {
            setClickable(event);
        } else {
            setClickable(undefined);
        }
    });

    const classes = ['vertix'];
    const style: React.CSSProperties = {
        top: `${props.vertix.position.y * 100}%`,
        left: `${props.vertix.position.x * 100}%`,
    };
    if (clickable) {
        classes.push('clickable');
    }
    const onPointerDown = () => {
        if (clickable) {
            console.log('emitVisibleVertixSelectedEvent', clickable);
            emitVisibleVertixSelectedEvent({
                vertix: props.vertix,
                card: clickable.card,
                moveId: clickable.id,
                playerId: clickable.playerId
            });
        }
    }
    usePlayerMadeMoveEventListener((event) => {
        console.log('usePlayerMadeMoveEventListener', event);
        if (event.vertixId === props.vertix.id) {
            const card = new Card(event.vertixId, event.direction!);
            card.reveal()
            card.ownerId = '0'
            // cardComponent = <div style={{ position: 'absolute' }}>
            //     <CardComponent selected={false} card={card} />
            // </div>
            setHasCard(card);
        }
        setClickable(undefined);
    });
    let cardComponent = <>X</>
    if (hasCard) {
        const card = new Card(props.vertix.id, hasCard.direction);
        card.reveal()
        card.ownerId = '0'
        console.log('cardComponent', card);
        cardComponent = <div style={{ position: 'absolute' }}><CardComponent selected={false} card={card}></CardComponent></div>
    } else {
        classes.push('empty')
    }

    return (
        <div className={classes.join(' ')} data-id={props.vertix.id}
            style={style}
            onPointerDown={onPointerDown}>
            {cardComponent}
        </div>
    )
}

