import { ReactNode } from 'react';
import { Card } from '../engine/card';
import { Directions, directionToAngle, getAbbreviation } from '../engine/directions';
import needleImage from '../assets/needle.png';
import revealedCardBackgroundImage from '../assets/transparent-compass.webp';
import cardCoverImage from '../assets/card-cover-black.png'
import './CardComponent.scss';

// https://remove-bg.io/upload

type CardComponentProps = {
    card: Card;
};

export const CardComponent = (props: CardComponentProps): ReactNode => {
    const style = {
        alignItems: 'center',
        justifyContent: 'center'
    }

    if ([Directions.NORTH, Directions.NORTH_EAST, Directions.NORTH_WEST].includes(props.card.direction)) {
        style.alignItems = 'start'
    } else if ([Directions.SOUTH, Directions.SOUTH_EAST, Directions.SOUTH_WEST].includes(props.card.direction)) {
        style.alignItems = 'end'
    }
    if ([Directions.EAST, Directions.NORTH_EAST, Directions.SOUTH_EAST].includes(props.card.direction)) {
        style.justifyContent = 'end'
    } else if ([Directions.WEST, Directions.NORTH_WEST, Directions.SOUTH_WEST].includes(props.card.direction)) {
        style.justifyContent = 'start'
    }

    if (props.card.covered) {
        return <div className='card-box' >
            <div className='card-content' style={{ ...style, backgroundColor: 'var(--compass-highlight-blue)' }} />
            <div className='background-image' style={{
                filter: 'opacity(1)',
                backgroundImage: `url(${cardCoverImage})`,
            }}></div>
        </div>
    }


    return <div className='card-box' >
        <div className='card-corner' style={{ top: 0, left: 0 }} />
        <div className='card-corner' style={{ top: 0, right: 0 }} />
        <div className='card-corner' style={{ bottom: 0, left: 0 }} />
        <div className='card-corner' style={{ bottom: 0, right: 0 }} />
        <div className='needle-image' style={{
            backgroundImage: `url(${needleImage})`,
            transform: `translate(-50%, -50%) rotate(${directionToAngle(props.card.direction)}deg) `
        }}></div>
        <div className='background-image' style={{ backgroundImage: `url(${revealedCardBackgroundImage})` }}></div>
        <div className='card-content' style={style}>
            <span className='abbreviation'>{getAbbreviation(props.card.direction)}</span>
        </div>
    </div>

};
