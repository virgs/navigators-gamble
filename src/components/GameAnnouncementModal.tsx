import * as bootstrap from 'bootstrap'
import { ReactNode, useEffect, useState } from 'react'
import { useAnnounceCommandListener } from '../events/events'

export const GameAnnouncementModal = (): ReactNode => {
    const [show, setShow] = useState<boolean>(false)
    const [content, setContent] = useState<string>('')

    useAnnounceCommandListener(async payload => {
        setContent(payload.announcement)
        setShow(true)
        setTimeout(() => {
            const modalElement = document.getElementById('scoreModal')
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement)
                if (modal) {
                    modal.hide()
                }
                document.removeChild(modalElement)
            }
        }, payload.duration)
    })

    useEffect(() => {
        if (show) {
            // const modalElement = document.getElementById('scoreModal')
            // if (modalElement) {
            //     const modal = bootstrap.Modal.getInstance(modalElement)
            //     if (modal) {
            //         modal.show()
            //     }
            // } else {
            //     console.error('Modal element not found')
            // }
            new bootstrap.Modal('#scoreModal', { focus: true }).show()
            const modalElement = document.getElementById('scoreModal')
            modalElement?.addEventListener('hidden.bs.modal', () => {
                setShow(false)
            })
        }
    }, [show])

    if (!show) {
        return <></>
    }

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
