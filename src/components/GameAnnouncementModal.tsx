import { ReactNode, useEffect, useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import { useAnnounceCommandListener } from '../events/events'
import './GameAnnouncementModal.scss'

export const GameAnnouncementModal = (): ReactNode => {
    const [content, setContent] = useState<string>('')
    const [timer, setTimer] = useState<NodeJS.Timeout | undefined>(undefined)

    useAnnounceCommandListener(async (payload) => {
        setContent(payload.announcement)
        if (timer) {
            clearTimeout(timer)
        }
        setTimer(
            setTimeout(() => {
                setContent('')
            }, payload.duration)
        )
    })

    useEffect(() => (() => clearTimeout(timer)), [])

    return (
        <Modal
            id="game-announcement-modal"
            backdrop="static"
            keyboard={false}
            contentClassName="game-announcement-modal-content"
            show={content !== ''}
        >
            <Modal.Body>
                <div className="game-announcement-body">{content}</div>
            </Modal.Body>
        </Modal>
    )
}
