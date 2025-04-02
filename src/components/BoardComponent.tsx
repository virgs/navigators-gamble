import classnames from 'classnames';
import { ReactNode } from 'react';
import { Board } from '../engine/board/board';
import { Vertix } from '../engine/graph/vertix';
import { VertixComponent } from './VertixComponent';
import { LinkComponent } from './LinkComponent';
import { Link } from '../engine/graph/link';
import "./BoardComponent.scss"

type BoardComponentProps = {
    board: Board;
};


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
                    {getLinks().map((link: Link) => <LinkComponent key={link.id} link={link} />)}
                    {props.board.getVertices().map((vertix: Vertix) => {
                        return <VertixComponent key={vertix.id} vertix={vertix}></VertixComponent>
                    })}
                </div>
            </div>
        </div>
    )
}
