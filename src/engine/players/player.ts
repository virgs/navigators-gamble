import { Board } from '../board/board'
import { Card } from '../card'
import { Move } from '../score-calculator/Move'

export interface Player {
    get id(): string
    drawCard(card: Card): void
    makeMove(board: Board): Move
}
