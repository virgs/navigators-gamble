import { ReactNode, useEffect, useState } from 'react'
import { AudioController } from '../../audio/audio-controller'
import { directions } from '../../engine/directions'
import { GameConfiguration } from '../../engine/game-configuration/game-configuration'
import { PlayerType } from '../../engine/game-configuration/player-type'
import { usePlayerMadeMoveEventListener } from '../../events/events'
import './HeaderComponent.scss'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { HomeButtonConfirmationModal } from './HomeButtonConfirmationModal'

type HeaderProps = {
    gameConfiguration?: GameConfiguration
    onHomeButton?: () => void
}

export const HeaderComponent = (props: HeaderProps): ReactNode => {
    const totalCards = (): number | undefined => {
        if (props.gameConfiguration === undefined) {
            return undefined
        }
        return (
            directions.length * props.gameConfiguration.cardsPerDirection -
            props.gameConfiguration.initialCardsPerPlayer * props.gameConfiguration.players.length
        )
    }

    const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false)
    const [muted, setMuted] = useState<boolean>(AudioController.isMuted())
    const [remainingCards, setRemainingCards] = useState<number | undefined>(totalCards())

    useEffect(() => {
        if (props.gameConfiguration !== undefined) {
            setRemainingCards(totalCards())
        }
    }, [props.gameConfiguration])

    usePlayerMadeMoveEventListener(() => {
        setRemainingCards((cards) => (cards === undefined ? undefined : cards - 1))
    })

    const toggleSound = () => {
        setMuted(!muted)
        AudioController.toggleMute()
    }

    return (
        <div className="header">
            <Row className="g-0 gx-2 justify-content-between align-items-center py-1">
                {props.onHomeButton && (
                    <Col xs="auto">
                        <span
                            id="home-button"
                            className="ms-2 button show"
                            onClick={() => setShowConfirmationModal(true)}
                        >
                            <i className="bi bi-house-fill"></i>
                        </span>
                    </Col>
                )}
                <Col xs className="ms-auto">
                    <Row className="g-0 gx-2 justify-content-end align-items-center py-1">
                        {props.gameConfiguration !== undefined && (
                            <>
                                <Col xs className='me-end text-truncate'>
                                    <span className="level-name">{props.gameConfiguration.levelName}</span>
                                </Col>
                                {process.env.NODE_ENV === 'development' && (
                                    <>
                                        <Col xs="auto" className="d-none d-lg-flex ms-lg-2">
                                            <i className="bi bi-robot mx-2" />
                                            <span className="position-relative">
                                                <span className="position-absolute top-100 start-100 translate-middle">
                                                    {props.gameConfiguration.players.find(
                                                        (player) => player.type === PlayerType.ARTIFICIAL_INTELLIGENCE
                                                    )?.iterationsPerAlternative ?? '-'}
                                                </span>
                                            </span>
                                        </Col>
                                        <Col xs="auto" className="d-none d-lg-flex ms-lg-2">
                                            <i className="bi bi-speedometer mx-2" />
                                            <span className="position-relative">
                                                <span className="position-absolute top-100 start-100 translate-middle">
                                                    {props.gameConfiguration.estimatedDifficulty}
                                                </span>
                                            </span>
                                        </Col>
                                    </>
                                )}
                                <Col xs="auto" className="ms-lg-2">
                                    <i className="bi bi-files mx-2" />
                                    <span className="position-relative">
                                        <span className="position-absolute top-100 start-100 translate-middle">
                                            {Math.max(remainingCards ?? 0, 0)}
                                        </span>
                                    </span>
                                </Col>
                                <Col xs="auto" className="ms-lg-2">
                                    <i className="bi bi-compass" />
                                    <span className="position-relative">
                                        <span className="position-absolute top-100 start-100 translate-middle">
                                            {props.gameConfiguration.cardsPerDirection}
                                        </span>
                                    </span>
                                </Col>
                            </>
                        )}
                        <Col xs="auto" className="ms-lg-2">
                            <span className="mx-2 button" onClick={() => toggleSound()}>
                                {muted ? (
                                    <i className="bi bi-volume-up-fill"></i>
                                ) : (
                                    <i className="bi bi-volume-mute-fill"></i>
                                )}
                            </span>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <HomeButtonConfirmationModal
                show={showConfirmationModal}
                onHide={() => setShowConfirmationModal(false)}
                onConfirm={() => { props.onHomeButton && props.onHomeButton() }} />
        </div>
    )
}
