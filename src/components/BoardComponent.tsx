import classnames from 'classnames';
import { ReactNode } from 'react';
import { Board } from '../engine/board/board';
import { Vertix } from '../engine/graph/vertix';
import { VertixComponent } from './VertixComponent';
import "./BoardComponent.scss"
import { Link } from '../engine/graph/link';
import { getAngle, getDistance } from '../math/point';

type BoardComponentProps = {
    board: Board;
};


const linkLength = (link: Link): number => {
    const [first, second] = link.getVertices()
    return getDistance(first.position, second.position)
}

const linkInclination = (link: Link): number => {
    const [first, second] = link.getVertices()
    return getAngle(first.position, second.position)
}

//https://stackoverflow.com/a/28985475
export const BoardComponent = (props: BoardComponentProps): ReactNode => {
    const getLinks = () => {
        const links: { [linkId: string]: Link } = {}
        props.board.getVertices()
            .forEach(vertix => vertix.getLinkedVertices()
                .forEach(linkedVertix => links[linkedVertix.link.id] ??= linkedVertix.link))
        return Object.values(links)
    }

    const classes = classnames({
        'board-box': true,
    });


    return (
        <div className={classes}>
            <div className='board-square'>
                <div className='board-content'>
                    {props.board.getVertices().map((vertix: Vertix) => {
                        return <VertixComponent key={vertix.id} vertix={vertix}></VertixComponent>
                    })}
                    {getLinks().map((link: Link) => {
                        const [linkOrigin, ..._] = link.getVertices()
                        const length = linkLength(link)
                        const inclination = linkInclination(link)
                        const clipPathBeginPart = 'calc(var(--vertix-size) / 2)'
                        const clipPathEndPart = 'calc(100% - (var(--vertix-size) / 2))'
                        return <div data-id={`{${link.getVertices().map(v => v.id)}}`}
                            key={link.id}
                            style={{
                                position: 'absolute',
                                top: `${linkOrigin.position.y * 100}%`,
                                left: `${linkOrigin.position.x * 100}%`,
                                borderBottom: '3px dashed var(--compass-highlight-red)',
                                height: '1px',
                                width: `calc(${length} * 100%)`,
                                transform: `rotate(${inclination}rad)`,
                                transformOrigin: 'center left',
                                clipPath: `polygon(${clipPathBeginPart} 0, ${clipPathBeginPart} 100%, ${clipPathEndPart} 100%, ${clipPathEndPart} 0)`
                            }}></div>
                    })}
                </div>
            </div>
        </div>
    )
}
