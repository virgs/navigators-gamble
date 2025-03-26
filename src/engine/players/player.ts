import { Board } from '../board/board'
import { Card } from '../card'
import { Move } from '../score-calculator/move'

export type ChooseMoveInput = {
    board: Board
    scores: Record<string, number>
}

export interface Player {
    get id(): string
    get score(): number
    finish(): void
    drawCard(card: Card): void
    addScore(score: number): void
    makeMove(chooseMoveInput: ChooseMoveInput): Promise<Move>
}
