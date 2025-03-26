import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { arrayShuffler } from './contants/array-shufller.ts'
import { Board } from './engine/board/board.ts'
import { Card } from './engine/card.ts'
import { directions } from './engine/directions.ts'
import { GameConfiguration } from './engine/game-configuration.ts'
import './index.css'
import { SerializabledBoard } from './engine/board/serializable-board.ts'
import { BoardSerializer } from './engine/board/board-serializer.ts'
import { GameEngine } from './engine/game-engine.ts'

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
      linkedVertices: ['5', '7']
    },
    {
      id: '5',
      linkedVertices: ['6', '8'],
    },
    {
      id: '6',
      linkedVertices: ['9']
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

const board = BoardSerializer.deserialize(JSON.stringify(serializabledBoard))

const gameConfig: GameConfiguration = {
  players: [],
  cardsPerDirection: 4,
  cardsPerPlayer: 5
}

const cards = arrayShuffler(
  directions
    .map((direction) => Array(gameConfig.cardsPerDirection).fill(direction))
    .flat()
    .map((direction, index) => new Card(`id${index}`, direction))
)



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
