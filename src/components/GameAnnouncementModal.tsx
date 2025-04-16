import * as bootstrap from 'bootstrap'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { useAnnounceCommandListener } from '../events/events'

export const GameAnnouncementModal = (): ReactNode => {
    const modal = useRef<bootstrap.Modal>(undefined)
    const [show, setShow] = useState<boolean>(false)
    const [content, setContent] = useState<string>('')
    const [timer, setTimer] = useState<NodeJS.Timeout | undefined>(undefined)

    useAnnounceCommandListener(async payload => {
        if (modal.current === undefined) {
            modal.current = new bootstrap.Modal('#scoreModal', { focus: true })
        }

        setContent(payload.announcement)
        setShow(true)
        if (timer) {
            clearTimeout(timer)
        }
        setTimer(setTimeout(() => {
            setShow(false)
            setContent('')
        }, payload.duration))
    })

    useEffect(() => {

        if (show) {
            modal.current?.show()
        } else {
            modal.current?.hide()
        }
    }, [show])

    return (
        <div
            className="modal fade"
            data-bs-backdrop="static"
            id="scoreModal"
            tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content h-25 d-flex align-items-center justify-content-center"
                    style={{
                        backgroundColor: 'var(--compass-light-gray)',
                        border: '2px solid var(--bs-dark)',
                        borderRadius: '1rem',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
                        padding: '2rem',
                        color: 'var(--bs-dark)',
                        fontFamily: 'Pirata One, system-ui',
                        fontSize: '2rem',
                        fontWeight: 'lighter',
                        fontStyle: 'normal',
                    }} id='scoreModalContent'>
                    <span className='my-5'>{content}</span>
                </div>
            </div>
        </div>
    )
}
