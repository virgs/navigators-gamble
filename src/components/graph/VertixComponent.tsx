import { ReactNode, useState } from 'react';
import { SerializableVertix } from '../../engine/board/serializable-board';
import { Card } from '../../engine/card';
import { CardComponent } from '../CardComponent';
import './VertixComponent.scss';
import { useVisibleCardSelectedEventListener } from '../../events/events';

type VertixProps = {
    vertix: SerializableVertix;
};

export const VertixComponent = (props: VertixProps): ReactNode => {
    const [hasCard, setHasCard] = useState<boolean>(false);

    useVisibleCardSelectedEventListener((event) => {
        console.log('event', event);
    });

    const classes = ['vertix'];
    const style: React.CSSProperties = {
        top: `${props.vertix.position.y * 100}%`,
        left: `${props.vertix.position.x * 100}%`,
    };
    let cardComponent = <>X</>
    if (hasCard) {
        const card = new Card(props.vertix.id, props.vertix.direction!);
        card.reveal()
        card.ownerId = '0'
        cardComponent = <div style={{ position: 'absolute' }}><CardComponent selected={false} card={card}></CardComponent></div>
    } else {
        classes.push('empty')
    }

    return (
        <div className={classes.join(' ')} data-id={props.vertix.id} style={style}>
            {cardComponent}
        </div>
    )
}

