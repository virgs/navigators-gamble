import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { SerializabledBoard } from './engine/board/serializable-board.ts'
import { GameConfiguration } from './engine/game-configuration/game-configuration.ts'
import { GameEngine } from './engine/game-engine.ts'
import { PlayerType } from './engine/game-configuration/player-type.ts'
import './index.css'
import { AiAlgorithmType } from './ai/algorithms/ai-algorithm-type.ts'

const serializabledBoard: SerializabledBoard = {
    vertices: [
        {
            id: '1',
            linkedVertices: ['2', '4'],
        },
        {
            id: '2',
            linkedVertices: ['3', '5'],
        },
        {
            id: '3',
            linkedVertices: ['6'],
        },
        {
            id: '4',
            linkedVertices: ['5', '7'],
        },
        {
            id: '5',
            linkedVertices: ['6', '8'],
        },
        {
            id: '6',
            linkedVertices: ['9'],
        },
        {
            id: '7',
            linkedVertices: ['8'],
        },
        {
            id: '8',
            linkedVertices: ['9'],
        },
        {
            id: '9',
            linkedVertices: [],
        },
    ],
}

const gameConfig: GameConfiguration = {
    players: [
        // { type: PlayerType.HUMAN },
        // { type: PlayerType.HUMAN },
        {
            type: PlayerType.ARTIFICIAL_INTELLIGENCE,
            iterations: 50000,
            aiAlgorithm: AiAlgorithmType.PURE_MONTE_CARLO_TREE_SEARCH,
        },
        {
            type: PlayerType.ARTIFICIAL_INTELLIGENCE,
            iterations: 1,
            aiAlgorithm: AiAlgorithmType.PURE_MONTE_CARLO_TREE_SEARCH,
        },
    ],
    cardsPerDirection: 3,
    cardsPerPlayer: 3,
    board: serializabledBoard,
}

const gameEngine = new GameEngine(gameConfig)

const iterate = async () => {
    if (!gameEngine.isGameOver()) {
        await gameEngine.playNextRound()
        setTimeout(iterate, 100)
    } else {
        console.log(`Game over`)
        gameEngine.finishGame()
        console.log(gameEngine.getScores())
    }
}

iterate()

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
)
