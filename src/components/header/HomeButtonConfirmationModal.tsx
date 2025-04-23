import { ReactNode } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import './HomeButtonConfirmationModal.scss'

type HomeButtonConfirmationProps = {
    show: boolean;
    onHide: Function;
    onConfirm: Function;
};

export const HomeButtonConfirmationModal = (props: HomeButtonConfirmationProps): ReactNode => {
    return (
        <Modal
            dialogClassName="home-button-confirmation-dialog"
            contentClassName="home-button-confirmation-content"
            id="home-button-confirmation-modal"
            show={props.show}
            onHide={() => props.onHide()}
        >
            <Modal.Header closeButton>
                <Modal.Title>Are you sure?</Modal.Title>
            </Modal.Header>
            <Modal.Footer>
                <Button className='confirm-button' onPointerDown={() => {
                    props.onHide();
                    props.onConfirm();
                }}>Confirm</Button>
            </Modal.Footer>
        </Modal>
    )
}
