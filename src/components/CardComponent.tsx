import { ReactNode, useEffect, useState } from 'react';
import cardCoverImage from '../assets/card-cover-black.png';
import needleImage from '../assets/needle.png';
import revealedCardBackgroundImage from '../assets/transparent-compass.webp';
import { colors } from '../constants/colors';
import { Card } from '../engine/card';
import { Directions, directionToAngle, getAbbreviation } from '../engine/directions';
import './CardComponent.scss';

// https://remove-bg.io/upload

export type CardComponentProps = {
    card: Card
    selected: boolean
    ownerTurnOrder?: number
};

export const CardComponent = (props: CardComponentProps): ReactNode => {
    const cardColor: string | undefined = props.ownerTurnOrder !== undefined ? colors[props.ownerTurnOrder] : undefined
    const [cardBoxClasses, setCardBoxClasses] = useState<string[]>(['card-box', 'show'])
    const [contentStyle, setContentStyle] = useState<React.CSSProperties>({
    })

    useEffect(() => {
        if (props.selected) {
            setCardBoxClasses(cardBoxClasses.concat('selected'))
        } else {
            setCardBoxClasses(cardBoxClasses.filter(className => className !== 'selected'))
        }
    }, [props.selected])

    useEffect(() => {
        setContentStyle(style => ({
            ...style
        }))
    }, [props.ownerTurnOrder])

    useEffect(() => {
        if ([Directions.NORTH, Directions.NORTH_EAST, Directions.NORTH_WEST].includes(props.card.direction)) {
            setContentStyle(style => ({ ...style, alignItems: 'start' }))
        } else if ([Directions.SOUTH, Directions.SOUTH_EAST, Directions.SOUTH_WEST].includes(props.card.direction)) {
            setContentStyle(style => ({ ...style, alignItems: 'end' }))
        }
        if ([Directions.EAST, Directions.NORTH_EAST, Directions.SOUTH_EAST].includes(props.card.direction)) {
            setContentStyle(style => ({ ...style, justifyContent: 'end' }))
        } else if ([Directions.WEST, Directions.NORTH_WEST, Directions.SOUTH_WEST].includes(props.card.direction)) {
            setContentStyle(style => ({ ...style, justifyContent: 'start' }))
        }
    }, [props.card])


    if (props.card.covered) {
        return <div className='card-box show' >
            <div className='card-content covered' />
            <div className='background-image' style={{
                filter: 'opacity(1)',
                backgroundImage: `url(${cardCoverImage})`,
            }}></div>
        </div>
    }

    return <div data-card-id={props.card.id} className={cardBoxClasses.join(' ')}
        style={{ borderColor: props.ownerTurnOrder !== undefined ? colors[props.ownerTurnOrder] : undefined }}>
        <div className='needle-image' data-needle-direction={Directions[props.card.direction].toString().toLowerCase()} style={{
            backgroundImage: `url(${needleImage})`,
            transform: `translate(-50%, -50%) rotate(${directionToAngle(props.card.direction)}deg) `
        }}></div>
        <div className='background-image'>
            <canvas data-type="radial-gauge"
                data-min-value="0"
                data-max-value="360"
                data-major-ticks="N,NE,E,SE,S,SW,W,NW,N"
                data-minor-ticks="22"
                data-ticks-angle="360"
                data-start-angle="180"
                data-stroke-ticks="false"
                data-highlights="false"
                data-color-plate="#222"
                data-color-major-ticks="#f5f5f5"
                data-color-minor-ticks="#ddd"
                data-color-numbers="#ccc"
                data-color-needle="rgba(240, 128, 128, 1)"
                data-color-needle-end="rgba(255, 160, 122, .9)"
                data-value-box="false"
                data-value-text-shadow="false"
                data-color-circle-inner="#fff"
                data-color-needle-circle-outer="#ccc"
                data-needle-circle-size="15"
                data-needle-circle-outer="false"
                data-animation-rule="linear"
                data-needle-type="line"
                data-needle-start="75"
                data-needle-end="99"
                data-needle-width="3"
                data-borders="true"
                data-border-inner-width="0"
                data-border-middle-width="0"
                data-border-outer-width="10"
                data-color-border-outer="#ccc"
                data-color-border-outer-end="#ccc"
                data-color-needle-shadow-down="#222"
                data-border-shadow-width="0"
                data-animation-duration="1500"
            ></canvas>
        </div>
        <div className='card-content' style={contentStyle}>
            <span className='abbreviation' style={{ color: cardColor }}>{getAbbreviation(props.card.direction)}</span>
        </div>
    </div>

};
