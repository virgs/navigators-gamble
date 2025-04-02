import classnames from 'classnames';
import { ReactNode } from 'react';
import needle from '../assets/needle.png';
import compass from '../assets/transparent-compass.webp';
import { Vertix } from '../engine/graph/vertix';
import { CardComponent } from './CardComponent';
import { Card } from '../engine/card';



type VertixProps = {
    vertix: Vertix;
};

export const VertixComponent = (props: VertixProps): ReactNode => {
    if (props.vertix.hasCardOn()) {
        return <CardComponent card={new Card(props.vertix.id, props.vertix.direction!)}></CardComponent>
    }

    return (
        <>
            <div style={{
                top: `${props.vertix.position.y * 100}%`,
                left: `${props.vertix.position.x * 100}%`,
                position: 'absolute',
                width: 'var(--card-size)',
                height: 'var(--card-size)',
                border: 'var(--compass-highlight-red) 3px dashed',
                borderRadius: '5px',
                transform: 'translate(-50%,-50%)',
            }}></div>
        </>
    )
}
