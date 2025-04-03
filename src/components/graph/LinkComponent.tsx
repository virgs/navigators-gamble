import { ReactNode } from 'react';
import { SerializableVertix } from '../../engine/board/serializable-board';
import { getAngle, getDistance } from '../../math/point';
import "./LinkComponent.scss";

export type LinkComponentProps = {
    first: SerializableVertix,
    second: SerializableVertix
};

export const LinkComponent = (props: LinkComponentProps): ReactNode => {
    const length = getDistance(props.first.position, props.second.position)
    const inclination = getAngle(props.first.position, props.second.position)
    const clipPathBeginPart = 'calc(var(--vertix-size) / 2)'
    const clipPathEndPart = 'calc(100% - (var(--vertix-size) / 2))'

    return <div
        data-link-id={`{${props.first.id}-${props.second.id}}`}
        className='link'
        style={{
            top: `${props.first.position.y * 100}%`,
            left: `${props.first.position.x * 100}%`,
            width: `calc(${length} * 100%)`,
            transform: `rotate(${inclination}rad) translateY(-50%)`,
            // clipPath: `polygon(${clipPathBeginPart} 0, ${clipPathBeginPart} 100%, ${clipPathEndPart} 100%, ${clipPathEndPart} 0)`
        }}></div>
}
