import { ReactNode, useEffect, useState } from 'react';
import { SerializableVertix } from '../../engine/board/serializable-board';
import { Card } from '../../engine/card';
import { emitVisibleVertixSelectedEvent, usePlayerMadeMoveEventListener, usePlayerTurnChangedListener, useVisibleCardSelectedEventListener, VisibleCardSelectedEvent } from '../../events/events';
import { CardComponent } from '../CardComponent';
import './VertixComponent.scss';

type VertixProps = {
    vertix: SerializableVertix;
};

export const VertixComponent = (props: VertixProps): ReactNode => {
    const [clickable, setClickable] = useState<VisibleCardSelectedEvent | undefined>(undefined);
    const [cardComponent, setCardComponent] = useState<ReactNode | undefined>(undefined);
    const [classes, setClasses] = useState<string[]>(['vertix', 'empty']);
    const [currentlyPlayerOrder, setCurrentlyPlayerOrder] = useState<number>(0)
    usePlayerTurnChangedListener(event => {
        setCurrentlyPlayerOrder(event.turnOrder)
    })

    useVisibleCardSelectedEventListener((event) => {
        if (!cardComponent) {
            setClickable(event);
            setClasses(list => list.concat('clickable'));
        } else {
            setClickable(undefined);
            setClasses(list => list.filter(item => item !== 'clickable'));
        }
    });

    const style: React.CSSProperties = {
        top: `${props.vertix.position.y * 100}%`,
        left: `${props.vertix.position.x * 100}%`,
        cursor: clickable ? 'pointer' : 'unset'
    };

    const onPointerDown = () => {
        if (clickable) {
            emitVisibleVertixSelectedEvent({
                vertix: props.vertix,
                card: clickable.card,
                moveId: clickable.id,
                playerId: clickable.playerId,
            });
        }
    }

    usePlayerMadeMoveEventListener((event) => {
        if (event.vertixId === props.vertix.id) {
            const card = new Card(event.cardId!, event.direction!, false);
            setClasses(list => list.filter(item => item !== 'clickable').filter(item => item !== 'empty'));
            setCardComponent(<CardComponent selected={false} card={card} ownerTurnOrder={currentlyPlayerOrder}></CardComponent>);
        }
        setClickable(undefined);
    });

    return (
        <div className={classes.join(' ')} data-id={props.vertix.id}
            style={style}
            onPointerDown={onPointerDown}>
            {cardComponent ?? <>X</>}
        </div>
    )
}

