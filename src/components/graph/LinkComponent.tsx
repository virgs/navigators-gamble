import { ReactNode } from 'react';
import { Link } from '../../engine/graph/link';
import { getAngle, getDistance } from '../../math/point';
import "./LinkComponent.scss";

type LinkComponentProps = {
    link: Link;
};


const linkLength = (link: Link): number => {
    const [first, second] = link.getVertices()
    return getDistance(first.position, second.position)
}

const linkInclination = (link: Link): number => {
    const [first, second] = link.getVertices()
    return getAngle(first.position, second.position)
}

export const LinkComponent = (props: LinkComponentProps): ReactNode => {
    const [linkOrigin, ..._] = props.link.getVertices()
    const length = linkLength(props.link)
    const inclination = linkInclination(props.link)
    const clipPathBeginPart = 'calc(var(--vertix-size) / 2)'
    const clipPathEndPart = 'calc(100% - (var(--vertix-size) / 2))'

    return <div data-id={`{${props.link.getVertices().map(v => v.id)}}`}
        className='link'
        style={{
            top: `${linkOrigin.position.y * 100}%`,
            left: `${linkOrigin.position.x * 100}%`,
            width: `calc(${length} * 100%)`,
            transform: `rotate(${inclination}rad) translateY(-50%)`,
            // clipPath: `polygon(${clipPathBeginPart} 0, ${clipPathBeginPart} 100%, ${clipPathEndPart} 100%, ${clipPathEndPart} 0)`
        }}></div>
}
