import { ReactNode, useEffect } from 'react';
import { Card } from '../engine/card';
import { Directions, directionToAngle, getAbbreviation } from '../engine/directions';
import revealedCardBackgroundImage from '../assets/transparent-compass.webp'
import needleImage from '../assets/needle.png'
import './CardComponent.scss';



type CardComponentProps = {
    card: Card;
};

export const CardComponent = (props: CardComponentProps): ReactNode => {
    useEffect(() => {
        // console.log(getAbbreviation(props.card.direction));
    }, [props]);

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


    return <div className='card-box' >
        <div className='background-image' style={{ backgroundImage: `url(${revealedCardBackgroundImage})` }}></div>
        <div className='needle-image' style={{
            backgroundImage: `url(${needleImage})`,
            transform: `translate(-50%, -50%) rotate(${directionToAngle(props.card.direction)}deg) `
        }}></div>
        <div className='card-content' style={style}>
            <span className='abbreviation'>{getAbbreviation(props.card.direction)}</span>
        </div>
    </div>

};
