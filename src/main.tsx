import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Board } from './engine/board.ts'
import { Colors } from './engine/colors.ts'
import { CardValues } from './engine/card-value.ts'

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

// console.log(
//   board.putCard({
//     vertixId: '1',
//     cardValue: CardValues.EAST,
//     color: Colors.WHITE,
//   })
// )
// console.log(
//   board.putCard({
//     vertixId: '2',
//     cardValue: CardValues.NORTH_EAST,
//     color: Colors.WHITE,
//   })
// )
// console.log(
//   board.putCard({
//     vertixId: '3',
//     cardValue: CardValues.NORTH,
//     color: Colors.WHITE,
//   })
// )
// console.log(
//   board.putCard({
//     vertixId: '5',
//     cardValue: CardValues.NORTH,
//     color: Colors.WHITE,
//   })
// )
// console.log(
//   board.putCard({
//     vertixId: '4',
//     cardValue: CardValues.SOUTH_EAST,
//     color: Colors.WHITE,
//   })
// )
console.log(
  board.putCard({
    vertixId: '7',
    cardValue: CardValues.SOUTH_WEST,
    color: Colors.WHITE,
  })
)
console.log(
  board.putCard({
    vertixId: '9',
    cardValue: CardValues.SOUTH_EAST,
    color: Colors.WHITE,
  })
)
console.log(
  board.putCard({
    vertixId: '8',
    cardValue: CardValues.SOUTH,
    color: Colors.WHITE,
  })
)
console.log(
  board.putCard({
    vertixId: '5',
    cardValue: CardValues.SOUTH_EAST,
    color: Colors.WHITE,
  })
)
console.log(
  board.putCard({
    vertixId: '2',
    cardValue: CardValues.EAST,
    color: Colors.WHITE,
  })
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
