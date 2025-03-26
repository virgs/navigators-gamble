import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { Board } from './engine/board.ts'
import { Colors } from './engine/colors.ts'
import { directions, Directions } from './engine/directions.ts'
import './index.css'
import { arrayShuffler } from './contants/array-shufller.ts'
import { Card } from './engine/card.ts'
import { GameConfiguration } from './engine/game-engine.ts'

const board = new Board({
  vertices: [
    {
      id: '1',
      linkedVertices: [
        {
          vertixId: '2',
        },
        {
          vertixId: '4',
        },
      ],
    },
    {
      id: '2',
      linkedVertices: [
        {
          vertixId: '3',
        },
        {
          vertixId: '5',
        },
      ],
    },
    {
      id: '3',
      linkedVertices: [
        {
          vertixId: '6',
        },
      ],
    },
    {
      id: '4',
      linkedVertices: [
        {
          vertixId: '5',
        },
        {
          vertixId: '7',
        },
      ],
    },
    {
      id: '5',
      linkedVertices: [
        {
          vertixId: '6',
        },
        {
          vertixId: '8',
        },
      ],
    },
    {
      id: '6',
      linkedVertices: [
        {
          vertixId: '9',
        },
      ],
    },
    {
      id: '7',
      linkedVertices: [
        {
          vertixId: '8',
        },
      ],
    },
    {
      id: '8',
      linkedVertices: [
        {
          vertixId: '9',
        },
      ],
    },
    {
      id: '9',
      linkedVertices: [],
    },
  ],
})

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


Object.defineProperty(window, 'play', {
  get: function () {
    function move(direction: string, vertixId: string) {
      board.putCard({
        vertixId: vertixId,
        direction: parseInt(direction),
        playerId: Colors[Colors.WHITE],
      })

    }
    return move
    //your code logic
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
