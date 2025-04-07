import { ReactNode, useEffect, useState } from 'react';
import cardCoverImage from '../assets/card-cover-black.png';
import needleImage from '../assets/needle.png';
import revealedCardBackgroundImage from '../assets/transparent-compass.webp';
import { colors } from '../constants/colors';
import { Card } from '../engine/card';
import { Directions, directionToAngle, getAbbreviation } from '../engine/directions';
import './CardComponent.scss';

// https://remove-bg.io/upload

type CardComponentProps = {
    card: Card
    selected: boolean
    ownerTurnOrder?: number
};

export const CardComponent = (props: CardComponentProps): ReactNode => {
    const cardColor: string = props.ownerTurnOrder !== undefined ? colors[props.ownerTurnOrder] : 'var(--compass-highlight-red)'
    const [cardBoxClasses, setCardBoxClasses] = useState<string[]>(['card-box', 'show'])
    const [contentStyle, setStyle] = useState<React.CSSProperties>({
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        borderColor: cardColor
    })

    useEffect(() => {
        if (props.selected) {
            setCardBoxClasses(cardBoxClasses.concat('selected'))
        } else {
            setCardBoxClasses(cardBoxClasses.filter(className => className !== 'selected'))
        }
    }, [props.selected])

    useEffect(() => {
        if ([Directions.NORTH, Directions.NORTH_EAST, Directions.NORTH_WEST].includes(props.card.direction)) {
            setStyle(style => ({ ...style, alignItems: 'start' }))
        } else if ([Directions.SOUTH, Directions.SOUTH_EAST, Directions.SOUTH_WEST].includes(props.card.direction)) {
            setStyle(style => ({ ...style, alignItems: 'end' }))
        }
        if ([Directions.EAST, Directions.NORTH_EAST, Directions.SOUTH_EAST].includes(props.card.direction)) {
            setStyle(style => ({ ...style, justifyContent: 'end' }))
        } else if ([Directions.WEST, Directions.NORTH_WEST, Directions.SOUTH_WEST].includes(props.card.direction)) {
            setStyle(style => ({ ...style, justifyContent: 'start' }))
        }
    }, [props.card])


    if (props.card.covered) {
        return <div className='card-box show' >
            <div className='card-content' style={{ backgroundColor: 'var(--compass-highlight-blue)' }} />
            <div className='background-image' style={{
                filter: 'opacity(1)',
                backgroundImage: `url(${cardCoverImage})`,
            }}></div>
        </div>
    }

    return <div data-card-id={props.card.id} className={cardBoxClasses.join(' ')} >
        <div className='card-corner' style={{ top: 0, left: 0, backgroundColor: cardColor }} />
        <div className='card-corner' style={{ top: 0, right: 0, backgroundColor: cardColor }} />
        <div className='card-corner' style={{ bottom: 0, left: 0, backgroundColor: cardColor }} />
        <div className='card-corner' style={{ bottom: 0, right: 0, backgroundColor: cardColor }} />
        <div className='needle-image' data-needle-direction={Directions[props.card.direction].toString().toLowerCase()} style={{
            backgroundImage: `url(${needleImage})`,
            transform: `translate(-50%, -50%) rotate(${directionToAngle(props.card.direction)}deg) `
        }}></div>
        <div className='background-image' style={{ backgroundImage: `url(${revealedCardBackgroundImage})` }}></div>
        <div className='card-content' style={contentStyle}>
            <span className='abbreviation' style={{ color: cardColor }}>{getAbbreviation(props.card.direction)}</span>
        </div>
    </div>

};
