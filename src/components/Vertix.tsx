import classnames from 'classnames';
import { ReactNode, useState } from 'react';
import { PositionedSerializabledBoard, PositionedSerializableVertix } from '../engine/board/serializable-board';
import compass from '../assets/transparent-compass.webp'
import needle from '../assets/needle.png'



type VertixProps = {
    vertix: PositionedSerializableVertix;
};

export const Vertix = (props: VertixProps): ReactNode => {

    const classes = classnames({
        'row': true
    });
    const cardSide = '10svw'

    return (
        <>
            <div className={classes} style={{
                position: 'absolute',
                padding: '3px',
                top: `${props.vertix.position.y * 100}%`,
                left: `${props.vertix.position.x * 100}%`,
                width: cardSide,
                height: cardSide,
                border: 'brown 3px solid',
                backgroundColor: '#b06e26',
                borderRadius: '5px',
                transform: 'translate(-50%,-50%)',
                color: 'black',
            }} >
                <div className='col-12 align-self-start' style={{ textAlign: 'right', height: '10%' }}>{props.vertix.id}</div>
                <div className='col-12' style={{
                    textAlign: 'center',
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundImage: `url(${compass})`
                }}>
                    <img className='img-fluid align-self-center' style={{
                        textAlign: 'center',
                        height: `calc(${cardSide} / 1.5)`,
                        rotate: '45deg'
                    }} src={needle}></img>
                    {/* <img className='img-fluid' style={{ textAlign: 'center', width: '80%' }} src={compass}></img> */}
                </div>
                <div className='col-12 align-self-end' style={{ textAlign: 'left', height: '10%' }}>{props.vertix.id}</div>

            </div>
        </>
    )
}
