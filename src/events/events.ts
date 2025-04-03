import { createEvent } from 'react-event-hook'
import { Card } from '../engine/card'
import { Move } from '../engine/score-calculator/move'

export type PlayerTurnChangeEvent = {
    playerId: string
}

export type CardAddedToPlayerEvent = {
    playerId: string
    card: Card
}

export type MakeMoveCommand = {
    playerId: string
}

export type ScoreChangedEvent = {
    playerId: string
    score: number
}

export const { usePlayerTurnChangedListener, emitPlayerTurnChanged } =
    createEvent('player-turn-changed')<PlayerTurnChangeEvent>()

export const { useCardAddedToPlayerListener, emitCardAddedToPlayer } =
    createEvent('card-added-to-player')<CardAddedToPlayerEvent>()
export const { useMakeMoveCommandListener, emitMakeMoveCommand } = createEvent('make-move-command')<MakeMoveCommand>()

export const { usePlayerMadeMoveEventListener, emitPlayerMadeMoveEvent } = createEvent('player-made-move-event')<Move>()
export const { useScoreChangedEventListener, emitScoreChangedEvent } =
    createEvent('score-changed-event')<ScoreChangedEvent>()
