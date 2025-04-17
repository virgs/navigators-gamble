import { Board } from '../board/board'
import { Card } from '../card'
import { PlayerType } from '../game-configuration/player-type'
import { Move } from '../score-calculator/move'

export type ChooseMoveInput = {
    board: Board
    scores: Record<string, number>
}

export interface Player {
    get type(): PlayerType
    get id(): string
    get score(): number
    get cards(): Card[]
    createHooks(): void
    finish(): void
    drawCard(card: Card): void
    addScore(score: number): void
    makeMove(chooseMoveInput: ChooseMoveInput): Promise<Move>
}
