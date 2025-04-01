import classnames from 'classnames';
import { ReactNode } from 'react';
import { AiAlgorithmType } from '../ai/algorithms/ai-algorithm-type';
import { SerializabledBoard } from '../engine/board/serializable-board';
import { GameConfiguration } from '../engine/game-configuration/game-configuration';
import { PlayerType } from '../engine/game-configuration/player-type';
import './GameContainer.scss';



const serializabledBoard: SerializabledBoard = {
    vertices: [
        {
            id: '1',
            position: { x: 0, y: 0 },
            linkedVertices: ['2', '4'],
        },
        {
            id: '2',
            position: { x: .5, y: 0 },
            linkedVertices: ['3', '5'],
        },
        {
            id: '3',
            position: { x: 1, y: 0 },
            linkedVertices: ['6'],
        },
        {
            id: '4',
            position: { x: 0, y: .5 },
            linkedVertices: ['5', '7'],
        },
        {
            id: '5', position: { x: .5, y: .5 },
            linkedVertices: ['6', '8'],
        },
        {
            id: '6',
            position: { x: 1, y: .5 },
            linkedVertices: ['9'],
        },
        {
            id: '7',
            position: { x: 0, y: 1 },
            linkedVertices: ['8'],
        },
        {
            id: '8',
            position: { x: .5, y: 1 },
            linkedVertices: ['9'],
        },
        {
            id: '9',
            position: { x: 1, y: 1 },
            linkedVertices: [],
        },
    ],
}

const gameConfig: GameConfiguration = {
    players: [
        // { type: PlayerType.HUMAN },
        // { type: PlayerType.HUMAN },
        // {
        //     type: PlayerType.ARTIFICIAL_INTELLIGENCE,
        //     iterations: 50000,
        //     aiAlgorithm: AiAlgorithmType.PURE_MONTE_CARLO_TREE_SEARCH,
        // },
        {
            type: PlayerType.ARTIFICIAL_INTELLIGENCE,
            iterations: 50000,
            aiAlgorithm: AiAlgorithmType.PURE_MONTE_CARLO_TREE_SEARCH,
        },
        {
            type: PlayerType.HUMAN
        },
    ],
    cardsPerDirection: 3,
    cardsPerPlayer: 7,
    board: serializabledBoard,
}

export const SetupScreen = (props: { onStartButton: (config: GameConfiguration) => void }): ReactNode => {

    const classes = classnames({
        "w-100": true
    });

    return (
        <>
            <div className={classes} style={{ textAlign: 'center', height: '100%' }} onClick={() => props.onStartButton(gameConfig)} >
            </div>
        </>
    )
}
