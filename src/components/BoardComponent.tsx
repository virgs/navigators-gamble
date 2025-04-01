import classnames from 'classnames';
import { ReactNode } from 'react';
import { Board } from '../engine/board/board';




type BoardComponentProps = {
    board: Board;
};

export const BoardComponent = (props: BoardComponentProps): ReactNode => {

    const classes = classnames({
        'p-2': true,
        'p-lg-4': true,
    });

    return (
        <>
            <div className={classes} style={{ position: 'relative', height: 'var(--board-size)', width: 'var(--board-size)' }} >
                {/* {props.board.getVertices().map((vertix: Vertix) => {
                    return <VertixComponent key={vertix.id} vertix={vertix}></VertixComponent>
                })} */}
            </div >
        </>
    )
}
