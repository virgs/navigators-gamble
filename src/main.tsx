import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { SerializabledBoard } from './engine/board/serializable-board.ts'
import { GameConfiguration } from './engine/game-configuration.ts'
import { GameEngine } from './engine/game-engine.ts'
import { PlayerType } from './engine/players/player-type.ts'
import './index.css'

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
  players: [{ type: PlayerType.ARTIFICIAL_INTELLIGENCE, runs: 10 }, { type: PlayerType.ARTIFICIAL_INTELLIGENCE, runs: 10 }],
  cardsPerDirection: 4,
  cardsPerPlayer: 5,
  board: serializabledBoard,
}

const gameEngine = new GameEngine(gameConfig)

const iterate = async () => {
  if (!gameEngine.isGameOver()) {
    await gameEngine.playNextRound()
    setTimeout(iterate, 2000)
  } else {
    console.log(`End`)
    console.log(gameEngine.getScores())
  }
}

iterate()


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
