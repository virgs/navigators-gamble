import { ReactNode } from 'react';
import { Card } from '../../engine/card';
import { Vertix } from '../../engine/graph/vertix';
import { CardComponent } from '../CardComponent';
import './VertixComponent.scss';

type VertixProps = {
    vertix: Vertix;
};

export const VertixComponent = (props: VertixProps): ReactNode => {
    const classes = ['vertix'];
    const style: React.CSSProperties = {
        top: `${props.vertix.position.y * 100}%`,
        left: `${props.vertix.position.x * 100}%`,
    };
    let cardComponent = <>X</>
    if (props.vertix.hasCardOn()) {
        const card = new Card(props.vertix.id, props.vertix.direction!);
        card.reveal()
        card.ownerId = '0'
        cardComponent = <div style={{ position: 'absolute' }}><CardComponent card={card}></CardComponent></div>
    } else {
        classes.push('empty')
    }

    return (
        <div className={classes.join(' ')} data-id={props.vertix.id} style={style}>
            {cardComponent}
        </div>
    )
}
