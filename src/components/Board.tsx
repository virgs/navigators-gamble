import classnames from 'classnames';
import { ReactNode, useState } from 'react';
import { PositionedSerializabledBoard, PositionedSerializableVertix } from '../engine/board/serializable-board';
import { Vertix } from './Vertix';




type BoardProps = {
    serializabledBoard: PositionedSerializabledBoard;
};

export const Board = (props: BoardProps): ReactNode => {

    const classes = classnames({
        'p-2': true,
        'p-lg-4': true,
    });
    const cardSide = '10'

    return (
        <>
            <div className={classes} style={{ position: 'relative', height: 'var(--board-size)', width: 'var(--board-size)' }} >
                {props.serializabledBoard.vertices.map((vertix: PositionedSerializableVertix) => {
                    return <Vertix key={vertix.id} vertix={vertix}></Vertix>
                })}
            </div >
        </>
    )
}
