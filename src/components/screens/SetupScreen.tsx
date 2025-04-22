import { ReactNode } from 'react';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';

import combined from "../../assets/combined.png";
import level from '../../assets/levels/custom.json?raw';
import title from "../../assets/title.png";
import { GameConfiguration } from '../../engine/game-configuration/game-configuration';

export const SetupScreen = (props: { onStartButton: (config: GameConfiguration) => void, onLevelEditorButton: () => void }): ReactNode => {
    const levelConfig = JSON.parse(level) as GameConfiguration;

    return (
        <Row className='h-100 g-0 justify-content-center align-items-start'>
            <Col xs={12} sm={5} lg={12} style={{
                height: 'min(85%, 400px)',
                maxHeight: 'min(85%, 400px)',
                textAlign: 'center',
                marginTop: '40px',
                background: `url(${combined})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',

            }} >
                <Image style={{ marginTop: '-30px', width: 'max(30%, 250px)' }} src={title} fluid />
            </Col>
            <Col xs={12} sm={7} lg={12} className='d-flex flex-column justify-content-start align-items-center p-1'
                style={{ height: '40%', maxHeight: '40%' }}>
                <div style={{ width: '80%' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Select a level</h2>
                    <ListGroup variant="flush" as="ol" numbered
                        style={{ width: '100%', height: '150px', maxHeight: '150px', overflowY: 'auto' }}>
                        <ListGroup.Item
                            action
                            as="li"
                            className="d-flex justify-content-between align-items-start">
                            <div className="ms-2 me-auto">
                                <div className="fw-bold">Subheading</div>
                                Cras justo odio
                            </div>
                            <Badge bg="primary" pill>
                                14
                            </Badge>
                        </ListGroup.Item>
                    </ListGroup>
                    <Row className='g-0 justify-content-between' style={{ width: '100%' }}>
                        {/* <div className={classes} style={{ textAlign: 'center', height: '20%', backgroundColor: 'blue' }} onClick={() => props.onStartButton(levelConfig)} />
            <div className={classes} style={{ textAlign: 'center', height: '20%', backgroundColor: 'red' }} onClick={() => props.onLevelEditorButton()} /> */}

                        <Col xs={'auto'}>
                            <Button variant="info" style={{ width: '100%' }}>Edit</Button>
                        </Col>
                        <Col xs={'auto'} className='ms-2'>
                            <Button variant="info" style={{ width: '100%' }}>Info</Button>
                        </Col>
                        <Col xs className='ms-2'>
                            <Button variant="primary" style={{ width: '100%' }}>Primary</Button>
                        </Col>
                    </Row>
                </div>
            </Col>
        </Row>
    )
}
