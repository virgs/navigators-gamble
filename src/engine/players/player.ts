import { Board } from '../board/board'
import { Card } from '../card'
import { Move } from '../score-calculator/move'

export interface Player {
    get id(): string
    get score(): number
    drawCard(card: Card): void
    addScore(score: number): void
    chooseMove(board: Board, scores: Record<string, number>): Promise<Move>
}
