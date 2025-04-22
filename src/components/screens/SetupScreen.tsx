import { ReactNode, use, useState } from 'react';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import title from "../../assets/title.png";
import { GameConfiguration } from '../../engine/game-configuration/game-configuration';
import './SetupScreen.scss';

const filenames: Record<string, GameConfiguration> = import.meta.glob(`../../assets/levels/*.json`, {
    eager: true,
    import: 'default'
});

const levels = Object.entries(filenames).map(([, config]) => config)


export const SetupScreen = (props: { onStartButton: (config: GameConfiguration) => void, onLevelEditorButton: () => void }): ReactNode => {
    const [selectedLevelIndex, setSelectedLevelIndex] = useState<number>(0)

    return (
        <Row className='setup-screen-container g-0'>
            <Col xs={12} sm={5} lg={12} className="setup-screen-header">
                <Image className="setup-screen-title" src={title} fluid />
            </Col>
            <Col xs={12} sm={7} lg={12} className="setup-screen-content">
                <div className="setup-screen-levels">
                    <h2 className="setup-screen-heading">Select level</h2>
                    <ListGroup variant="flush" as="ol" className="setup-screen-list">
                        {levels
                            .sort((a, b) => a.estimatedDifficulty - b.estimatedDifficulty)
                            .reverse()
                            .map((level, index) => {
                                return <ListGroup.Item
                                    key={index}
                                    action
                                    onPointerDown={() => {
                                        setSelectedLevelIndex(index)
                                    }}
                                    active={selectedLevelIndex === index}
                                    as="li"
                                    className={"d-flex justify-content-between align-items-start ".concat(selectedLevelIndex === index ? "selected" : "")}>
                                    <div className="ms-2 me-auto">
                                        <h5 className="level-title">{levels.length - index} . {level.levelName}</h5>
                                        Cras justo odio
                                    </div>
                                    <Badge bg="primary" pill>
                                        {level.estimatedDifficulty}
                                    </Badge>
                                </ListGroup.Item>
                            })}
                    </ListGroup>
                    <Row className="setup-screen-buttons g-0">
                        <Col xs={3}>
                            <Button variant="info" className="setup-screen-button"
                                onClick={() => props.onLevelEditorButton()}>Create
                                <i className="bi bi-pencil-fill ms-2"></i>
                            </Button>
                        </Col>
                        <Col xs={3} className="ps-2">
                            <Button variant="info" className="setup-screen-button">Info
                                <i className="bi bi-info-circle-fill ms-2"></i>
                            </Button>
                        </Col>
                        <Col xs={6} className="ps-2">
                            <Button variant="primary"
                                className="setup-screen-button"
                                onClick={() => props.onStartButton(levels[selectedLevelIndex])}>Play
                                <i className="bi bi-play-fill ms-2"></i>
                            </Button>
                        </Col>
                    </Row>
                </div>
            </Col>
        </Row>
    )
}
