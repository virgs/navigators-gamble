import React, { ReactNode, useEffect, useState } from 'react';
import { colors } from '../../constants/colors';
import { Card } from '../../engine/card';
import { Directions, getAbbreviation as getDirectionInitials } from '../../engine/directions';
import './CardComponent.scss';
import { GaugeComponent } from './GaugeComponent';


export type CardComponentProps = {
    card: Card
    selected: boolean
    ownerTurnOrder?: number
};

export const CardComponent = (props: CardComponentProps): ReactNode => {
    const [cardBoxClasses, setCardBoxClasses] = useState<string[]>(['card-box', 'show']);
    const [initialsStyle, setInitialsStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        if (props.selected) {
            setCardBoxClasses(cardBoxClasses.concat('selected'));
        } else {
            setCardBoxClasses(cardBoxClasses.filter(className => className !== 'selected'));
        }
    }, [props.selected]);

    useEffect(() => {
        if ([Directions.NORTH, Directions.NORTH_EAST, Directions.NORTH_WEST].includes(props.card.direction)) {
            setInitialsStyle(style => ({ ...style, alignItems: 'start' }));
        } else if ([Directions.SOUTH, Directions.SOUTH_EAST, Directions.SOUTH_WEST].includes(props.card.direction)) {
            setInitialsStyle(style => ({ ...style, alignItems: 'end' }));
        }
        if ([Directions.EAST, Directions.NORTH_EAST, Directions.SOUTH_EAST].includes(props.card.direction)) {
            setInitialsStyle(style => ({ ...style, justifyContent: 'end' }));
        } else if ([Directions.WEST, Directions.NORTH_WEST, Directions.SOUTH_WEST].includes(props.card.direction)) {
            setInitialsStyle(style => ({ ...style, justifyContent: 'start' }));
        }
    }, [props.card]);

    if (props.card.covered) {
        return <div className='card-box show'>
            <div className='card-content covered' />
            <div className='background-cover-image'></div>
        </div>;
    }

    return <div data-diretcion={Directions[props.card.direction]} data-card-id={props.card.id}
        className={cardBoxClasses.join(' ')}
        style={{ backgroundColor: props.ownerTurnOrder !== undefined ? colors[props.ownerTurnOrder] : undefined }}>
        <div className='card-content d-flex' style={initialsStyle}>
            <GaugeComponent direction={props.card.direction} />
            <div className='direction-initials'>{getDirectionInitials(props.card.direction)}</div>
        </div>
    </div >;
};
