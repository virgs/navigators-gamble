import { Gauge, gaugeClasses, useGaugeState } from '@mui/x-charts/Gauge';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { colors } from '../constants/colors';
import { Card } from '../engine/card';
import { Directions, directionToAngle, getAbbreviation as getDirectionInitials } from '../engine/directions';
import './CardComponent.scss';
import { useWindowSize } from '@uidotdev/usehooks';


export type CardComponentProps = {
    card: Card
    selected: boolean
    ownerTurnOrder?: number
};

export const CardComponent = (props: CardComponentProps): ReactNode => {
    const [cardBoxClasses, setCardBoxClasses] = useState<string[]>(['card-box', 'show']);
    const [gaugeComponent, setGaugeComponent] = useState<ReactNode>(undefined);
    const [initialsStyle, setInitialsStyle] = useState<React.CSSProperties>({});
    const size = useWindowSize();
    const cardContentRef = useRef(null)

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


    useEffect(() => {
        setGaugeComponent(<Gauge
            width={gaugeSize}
            height={gaugeSize}
            innerRadius="50%"
            outerRadius="85%"
            value={25}
            startAngle={-45 + angle}
            endAngle={360 + angle}
            sx={() => ({
                [`& .${gaugeClasses.valueText}`]: {
                    fontSize: '0',
                },
            })}
        >
            <GaugePointer />
        </Gauge>)
    }, [size]);


    const angle = directionToAngle(props.card.direction);

    function GaugePointer() {
        const { valueAngle, outerRadius, cx, cy } = useGaugeState();
        if (valueAngle === null) {
            // No value to display
            return null;
        }
        const radians = angle * Math.PI / 180.0
        const target = {
            x: cx + (outerRadius + 2) * Math.sin(radians),
            y: cy - (outerRadius + 2) * Math.cos(radians),
        };
        return (
            <g className='needle-path' >
                <circle cx={cx} cy={cy} r={5} />
                <path d={`M ${cx} ${cy} L ${target.x} ${target.y}`} />
            </g>
        );
    }


    //@ts-expect-error
    const gaugeSize = cardContentRef.current?.clientWidth ?? 50

    return <div data-diretcion={Directions[props.card.direction]} data-card-id={props.card.id}
        className={cardBoxClasses.join(' ')}
        style={{ backgroundColor: props.ownerTurnOrder !== undefined ? colors[props.ownerTurnOrder] : undefined }}>
        <div ref={cardContentRef} className='card-content d-flex' style={initialsStyle}>
            <div className='gauge' >
                {gaugeComponent}
            </div>


            <div className='direction-initials'>{getDirectionInitials(props.card.direction)}</div>
        </div>
    </div >;
};
