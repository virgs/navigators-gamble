import { ReactNode } from 'react'
import Modal from 'react-bootstrap/Modal'
import './LevelEditorInstructionsModal.scss'

export const LevelEditorInstructionsModal = (props: { show: boolean; onHide: Function }): ReactNode => {
    return (
        <Modal
            dialogClassName="level-editor-instructions-dialog"
            contentClassName="level-editor-instructions-content"
            id="level-editor-instructions-modal"
            show={props.show}
            onHide={() => props.onHide()}
        >
            <Modal.Header>
                <Modal.Title>Intructions</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="level-editor-instructions-body">
                    <h4>How to use the level editor</h4>
                    <p>
                        The level editor allows you to create and edit levels for the game. You can add, remove, and
                        move vertices and edges around the grid.
                    </p>
                    <h4>Controls</h4>
                    <ul>
                        <ol>Left click on empty grid to add vertix</ol>
                        <ol>Left click on two vertices to connect them</ol>
                        <ol>Right click on edge to invert it</ol>
                        <ol>Select and press 'delete' to remove</ol>
                        <ol>Drag vertix to move</ol>
                        <ol>Right click and drag to move all vertices</ol>
                    </ul>
                </div>
            </Modal.Body>
        </Modal>
    )
}
