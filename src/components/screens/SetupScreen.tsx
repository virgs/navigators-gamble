import { ReactNode, useEffect, useState } from 'react'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Image from 'react-bootstrap/Image'
import ListGroup from 'react-bootstrap/ListGroup'
import Row from 'react-bootstrap/Row'
import title from '../../assets/title.png'
import { GameConfiguration } from '../../engine/game-configuration/game-configuration'
import { BrowserDb, MatchStats } from '../../repository/browser-db'
import './SetupScreen.scss'

type LevelConfigurationAndStats = {
    levelConfiguration: GameConfiguration
    stats: MatchStats[]
}

type SetupScreenProps = {
    setupUpdateCounter: number
    onStartButton: (config: GameConfiguration) => void
    onLevelEditorButton: () => void
}

export const SetupScreen = (props: SetupScreenProps): ReactNode => {
    const [selectedLevelIndex, setSelectedLevelIndex] = useState<number>(0)
    const [availableLevels, setAvailableLevels] = useState<LevelConfigurationAndStats[]>([])

    const importLevels = async () => {
        const filenames: Record<string, GameConfiguration> = import.meta.glob(`../../assets/levels/*.json`, {
            eager: true,
            import: 'default',
        })

        const totalLevels = Object.entries(filenames)
            .map(([, config]) => config)
            .sort((a, b) => {
                if (a.estimatedDifficulty < b.estimatedDifficulty) {
                    return -1
                }
                if (a.estimatedDifficulty > b.estimatedDifficulty) {
                    return 1
                }
                return 0
            })
        const result: LevelConfigurationAndStats[] = []
        while (totalLevels.length > 0) {
            const level = totalLevels.shift() as GameConfiguration
            const levelStats = BrowserDb.getLevelStats(level)
            const levelHasBeenBeaten = levelStats.some((stat) => stat.victory)
            result.push({
                levelConfiguration: level,
                stats: levelStats,
            })
            if (!levelHasBeenBeaten) {
                break
            }
        }
        setAvailableLevels(result.reverse())
        setSelectedLevelIndex(0)
    }

    useEffect(() => {
        importLevels()
    }, [])
    useEffect(() => {
        importLevels()
    }, [props.setupUpdateCounter])

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowUp') {
                setSelectedLevelIndex((prevIndex) => Math.max(prevIndex - 1, 0))
            } else if (event.key === 'ArrowDown') {
                setSelectedLevelIndex((prevIndex) => Math.min(prevIndex + 1, availableLevels.length - 1))
            }
            if (event.key === 'Enter') {
                props.onStartButton(availableLevels[selectedLevelIndex].levelConfiguration)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [availableLevels.length])

    return (
        <Row id="setup-screen-element" className="setup-screen-container g-0">
            <Col xs={12} sm={5} lg={12} className="setup-screen-header">
                <Image className="setup-screen-title" src={title} fluid />
            </Col>
            <Col xs={12} sm={7} lg={12} className="setup-screen-content">
                <div className="setup-screen-levels">
                    <h2 className="setup-screen-heading">Select level</h2>
                    <ListGroup variant="flush" as="ol" className="setup-screen-list">
                        {availableLevels.map((item, index) => {
                            return (
                                <ListGroup.Item
                                    key={index}
                                    action
                                    onDoubleClick={() => {
                                        props.onStartButton(item.levelConfiguration)
                                    }}
                                    onPointerDown={() => {
                                        setSelectedLevelIndex(index)
                                    }}
                                    active={selectedLevelIndex === index}
                                    as="li"
                                    className="d-flex justify-content-between align-items-start level-list-item"
                                >
                                    <div className="ms-2 me-auto w-100">
                                        <div className="level-title">
                                            {availableLevels.length - index} . {item.levelConfiguration.levelName}
                                        </div>
                                        <small className="level-stats">
                                            <i className="bi bi-trophy-fill me-2"></i>
                                            {item.stats.filter((stat) => stat.victory).length} / {item.stats.length}
                                        </small>
                                    </div>
                                    {process.env.NODE_ENV === 'development' && (
                                        <Badge
                                            bg="primary"
                                            pill
                                            style={{ position: 'absolute', right: '10px', bottom: '10px' }}
                                        >
                                            {item.levelConfiguration.estimatedDifficulty.toString().padEnd(4, '0')}
                                        </Badge>
                                    )}
                                </ListGroup.Item>
                            )
                        })}
                    </ListGroup>
                    <Row className="setup-screen-buttons g-0">
                        <Col xs={3}>
                            <Button id="setup-screen-info-button" className="setup-screen-button">
                                <span className="d-none d-lg-inline">Info</span>
                                <i className="bi bi-info-circle-fill ms-lg-2"></i>
                            </Button>
                        </Col>
                        <Col xs={3} className="ps-2">
                            <Button
                                className="setup-screen-button"
                                id="setup-screen-editor-button"
                                onClick={() => props.onLevelEditorButton()}
                            >
                                <span className="d-none d-lg-inline">Create</span>
                                <i className="bi bi-pencil-fill ms-lg-2"></i>
                            </Button>
                        </Col>
                        <Col xs={6} className="ps-2">
                            <Button
                                id="setup-screen-play-button"
                                className="setup-screen-button"
                                onClick={() =>
                                    props.onStartButton(availableLevels[selectedLevelIndex].levelConfiguration)
                                }
                            >
                                <span className="d-none d-lg-inline">Play</span>
                                <i className="bi bi-play-fill ms-lg-2"></i>
                            </Button>
                        </Col>
                    </Row>
                </div>
            </Col>
        </Row>
    )
}
