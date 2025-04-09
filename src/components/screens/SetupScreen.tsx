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
            position: { x: .3, y: .3 },
            linkedVertices: ['v2', 'v3', 'v4'],
        },
        {
            id: 'v2',
            position: { x: .5, y: .1 },
            linkedVertices: ['v3', 'v5'],
        },
        {
            id: 'v3',
            position: { x: .7, y: .3 },
            linkedVertices: ['v9'],
        },
        {
            id: 'v4',
            position: { x: .1, y: .5 },
            linkedVertices: ['v7'],
        },
        {
            id: 'v5',
            position: { x: .5, y: .5 },
            linkedVertices: ['v8'],
        },
        {
            id: 'v6',
            position: { x: .9, y: .5 },
            linkedVertices: ['v3'],
        },
        {
            id: 'v7',
            position: { x: .3, y: .7 },
            linkedVertices: ['v1'],
        },
        {
            id: 'v8',
            position: { x: .5, y: .9 },
            linkedVertices: ['v7'],
        },
        {
            id: 'v9',
            position: { x: .7, y: .7 },
            linkedVertices: ['v8', 'v6', 'v7'],
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
            minWaitTime: 1500,
            iterationsPerAlternative: 0, //1000 - hard
            aiAlgorithm: AiAlgorithmType.PURE_MONTE_CARLO_TREE_SEARCH,
        },
    ],
    visibleHandPlayerId: 'human-player',
    cardsPerDirection: 3,
    cardsPerPlayer: 4,
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
