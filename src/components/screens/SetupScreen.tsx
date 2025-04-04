import classnames from 'classnames';
import { ReactNode } from 'react';
import { AiAlgorithmType } from '../../ai/algorithms/ai-algorithm-type';
import { SerializabledBoard } from '../../engine/board/serializable-board';
import { GameConfiguration } from '../../engine/game-configuration/game-configuration';
import { PlayerType } from '../../engine/game-configuration/player-type';



const serializabledBoard: SerializabledBoard = {
    vertices: [
        {
            id: 'v1',
            position: { x: .15, y: .15 },
            linkedVertices: ['v2', 'v4'],
        },
        {
            id: 'v2',
            position: { x: .5, y: 0 },
            linkedVertices: ['v3', 'v9'],
        },
        {
            id: 'v3',
            position: { x: .85, y: .15 },
            linkedVertices: [],
        },
        {
            id: 'v4',
            position: { x: 0, y: .5 },
            linkedVertices: ['v3', 'v7'],
        },
        {
            id: 'v5',
            position: { x: .5, y: .5 },
            linkedVertices: ['v2', 'v4', 'v6', 'v8'],
        },
        {
            id: 'v6',
            position: { x: 1, y: .5 },
            linkedVertices: ['v3', 'v7'],
        },
        {
            id: 'v7',
            position: { x: .15, y: .85 },
            linkedVertices: [],
        },
        {
            id: 'v8',
            position: { x: .5, y: 1 },
            linkedVertices: ['v7', 'v1'],
        },
        {
            id: 'v9',
            position: { x: .85, y: .85 },
            linkedVertices: ['v8', 'v6'],
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
            id: 'human-player',
            type: PlayerType.HUMAN
        },
        {
            id: 'ai-player',
            type: PlayerType.ARTIFICIAL_INTELLIGENCE,
            iterations: 50000,
            aiAlgorithm: AiAlgorithmType.PURE_MONTE_CARLO_TREE_SEARCH,
        },
    ],
    visibleHandPlayerId: 'human-player',
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
