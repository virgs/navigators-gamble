import { ReactNode, useEffect, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { Card } from '../../engine/card';
import { Directions } from '../../engine/directions';
import { ScoreType } from '../../engine/score-calculator/score-type';
import { generateUID } from '../../math/generate-id';
import { Point } from '../../math/point';
import { CardComponent } from '../card/CardComponent';
import { LinkComponent } from '../graph/LinkComponent';
import './GameInstructionsModal.scss';

export const CardWrapper = (props: { direction: Directions, doubled?: boolean, owner?: number }): ReactNode => {
    const card = new Card(generateUID(), props.direction, false);
    return <div className={`d-flex justify-content-center align-items-center ${props.doubled ? 'w-50' : 'w-25'}`}>
        <CardComponent card={card} selected={false} animations={false} ownerTurnOrder={props.owner} />
    </div>
}

export const GameInstructionsModal = (props: { show: boolean; onHide: Function }): ReactNode => {
    const [exampleScoreDimensions, setExampleScoreDimensions] = useState<{ width: number, height: number }>({ width: 0, height: 0 });
    const [exampleScoreDoubleDimensions, setExampleScoreDoubleDimensions] = useState<{ width: number, height: number }>({ width: 0, height: 0 });
    const resizeObserver = useRef<ResizeObserver | undefined>(undefined);
    const exampleScoreAreaRef = useRef<HTMLDivElement>(null)
    const exampleScoreDoubleAreaRef = useRef<HTMLDivElement>(null)

    const initializeResizeObserver = () => {
        if (!resizeObserver.current) {
            const observer = new ResizeObserver(entries => {
                setExampleScoreDimensions(entries[0].contentRect);
                setExampleScoreDoubleDimensions(entries[1].contentRect);
            });

            if (exampleScoreAreaRef.current) {
                observer.observe(exampleScoreAreaRef.current);
            }
            if (exampleScoreDoubleAreaRef.current) {
                observer.observe(exampleScoreDoubleAreaRef.current);
            }
        }
    }

    useEffect(() => {
        initializeResizeObserver();
    }, [props.show]);

    useEffect(() => {
        initializeResizeObserver();

        return () => {
            if (exampleScoreAreaRef.current) {
                //@ts-expect-error
                resizeObserver?.unobserve(exampleScoreAreaRef.current);
            }
            if (exampleScoreDoubleAreaRef.current) {
                //@ts-expect-error
                resizeObserver?.unobserve(exampleScoreDoubleAreaRef.current);
            }
        };
    }, []);

    const convertToBoardDimensions = (point: Point): Point => ({
        x: point.x * exampleScoreDimensions.width,
        y: point.y * exampleScoreDimensions.height
    })

    const convertToBoardDoubleDimensions = (point: Point): Point => ({
        x: point.x * exampleScoreDoubleDimensions.width,
        y: point.y * exampleScoreDoubleDimensions.height
    })

    return (
        <Modal
            dialogClassName="game-instructions-dialog"
            contentClassName="game-instructions-content"
            id="game-instructions-modal"
            show={props.show}
            onHide={() => props.onHide()}
        >
            <Modal.Header closeButton>
                <Modal.Title className='w-100 text-center'>
                    <h1 className='text-center'>Rules</h1>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="game-instructions-body">
                    <p className='text-center'>
                        On your turn, put the cards on the map symbols to create combinations of cardinal directions to score points.
                    </p>
                    <p className='text-center'>
                        The game will be ovver when the board is full. The player with the most points wins.
                    </p>
                    <h4 className='text-center'>Combinations</h4>
                    <Row className='combinations-example'>
                        <Col className='pair' xs={12} md={6}>
                            <div ref={exampleScoreAreaRef} className='d-flex justify-content-between' style={{ position: 'relative' }}>
                                <svg style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                                    <LinkComponent
                                        scoreType={ScoreType.PAIR}
                                        first={{
                                            id: '',
                                            position: {
                                                x: 0,
                                                y: .5
                                            }
                                        }} second={{
                                            id: '',
                                            position: {
                                                x: 1,
                                                y: .5
                                            }
                                        }} convertToBoardDimensions={convertToBoardDimensions} />
                                </svg>
                                <CardWrapper direction={Directions.NORTH} />
                                <CardWrapper direction={Directions.NORTH} />
                            </div>
                            <p className='text-center'>
                                Directions pair<br></br>
                                1 point
                            </p>
                        </Col>
                        <Col className='cancel' xs={12} md={6}>
                            <div className='d-flex justify-content-between' style={{ position: 'relative' }}>
                                <svg style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                                    <LinkComponent
                                        scoreType={ScoreType.CANCEL}
                                        first={{
                                            id: '',
                                            position: {
                                                x: 0,
                                                y: .5
                                            }
                                        }} second={{
                                            id: '',
                                            position: {
                                                x: 1,
                                                y: .5
                                            }
                                        }} convertToBoardDimensions={convertToBoardDimensions} />
                                </svg>
                                <CardWrapper direction={Directions.WEST} />
                                <CardWrapper direction={Directions.EAST} />
                            </div>
                            <p className='text-center'>
                                Directions cancel<br></br>
                                2 points
                            </p>
                        </Col>
                        <Col className='sequence' xs={12}>
                            <div ref={exampleScoreDoubleAreaRef} className='d-flex justify-content-between' style={{ position: 'relative' }}>
                                <svg style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                                    {[...Array(3)].map((_, i) => <LinkComponent key={i}
                                        scoreType={ScoreType.SEQUENCE}
                                        first={{
                                            id: '',
                                            position: {
                                                x: (i + .5) * .25,
                                                y: .25
                                            }
                                        }} second={{
                                            id: '',
                                            position: {
                                                x: (i + 1.5) * .25,
                                                y: .25
                                            }
                                        }} convertToBoardDimensions={convertToBoardDoubleDimensions} />)}
                                    {[...Array(3)].map((_, i) => <LinkComponent key={i}
                                        scoreType={ScoreType.SEQUENCE}
                                        first={{
                                            id: '',
                                            position: {
                                                x: (i + 1.5) * .25,
                                                y: .75
                                            }
                                        }} second={{
                                            id: '',
                                            position: {
                                                x: (i + .5) * .25,
                                                y: .75
                                            }
                                        }} convertToBoardDimensions={convertToBoardDoubleDimensions} />)}
                                    <LinkComponent
                                        scoreType={ScoreType.SEQUENCE}
                                        first={{
                                            id: '',
                                            position: {
                                                x: .125,
                                                y: .75
                                            }
                                        }} second={{
                                            id: '',
                                            position: {
                                                x: .125,
                                                y: .25
                                            }
                                        }} convertToBoardDimensions={convertToBoardDoubleDimensions} />
                                    <LinkComponent
                                        scoreType={ScoreType.SEQUENCE}
                                        first={{
                                            id: '',
                                            position: {
                                                x: 1 - .125,
                                                y: .25
                                            }
                                        }} second={{
                                            id: '',
                                            position: {
                                                x: 1 - .125,
                                                y: .75
                                            }
                                        }} convertToBoardDimensions={convertToBoardDoubleDimensions} />
                                </svg>
                                <Row className='d-flex justify-content-between w-100 g-0 gy-3'>
                                    <Col xs={3} className='d-flex justify-content-center align-items-center'>
                                        <CardWrapper direction={Directions.NORTH} doubled />
                                    </Col>
                                    <Col xs={3} className='d-flex justify-content-center align-items-center'>
                                        <CardWrapper direction={Directions.NORTH_EAST} doubled />
                                    </Col>
                                    <Col xs={3} className='d-flex justify-content-center align-items-center'>
                                        <CardWrapper direction={Directions.EAST} doubled />
                                    </Col>
                                    <Col xs={3} className='d-flex justify-content-center align-items-center'>
                                        <CardWrapper direction={Directions.SOUTH_EAST} doubled />
                                    </Col>
                                    <Col xs={3} className='d-flex justify-content-center align-items-center'>
                                        <CardWrapper direction={Directions.SOUTH} doubled />
                                    </Col>
                                    <Col xs={3} className='d-flex justify-content-center align-items-center'>
                                        <CardWrapper direction={Directions.SOUTH_WEST} doubled />
                                    </Col>
                                    <Col xs={3} className='d-flex justify-content-center align-items-center'>
                                        <CardWrapper direction={Directions.WEST} doubled />
                                    </Col>
                                    <Col xs={3} className='d-flex justify-content-center align-items-center'>
                                        <CardWrapper direction={Directions.NORTH_WEST} doubled />
                                    </Col>
                                </Row>
                            </div>
                            <p className='text-center'>
                                Directions sequence<br></br>
                                Three cards or more - 1 point for each card<br></br>
                            </p>
                        </Col>
                    </Row>
                    <h4 className='mt-2 text-center'>Bonus</h4>
                    <Row>
                        <Col xs={6} className='d-flex justify-content-center align-items-center'>
                            <CardWrapper direction={Directions.NORTH_WEST} owner={0} doubled />
                        </Col>
                        <Col xs={6} className='d-flex justify-content-center align-items-center'>
                            <CardWrapper direction={Directions.NORTH_EAST} owner={1} doubled />
                        </Col>
                    </Row>
                    <p className='mt-2 text-center'>
                        One point is given for each owned card on the board in the end of the game.
                    </p>
                </div>
            </Modal.Body>
        </Modal>
    )
}
