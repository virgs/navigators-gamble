import { createEvent } from 'react-event-hook'
import { SerializableVertix } from '../engine/board/serializable-board'
import { Card } from '../engine/card'
import { Move } from '../engine/score-calculator/move'

export type PlayerTurnChangeEvent = {
    turnOrder: number
    playerId: string
}

export type CardAddedToPlayerEvent = {
    playerId: string
    card: Card
}

export type ScoreChangedEvent = {
    playerId: string
    score: number
}

export type MakeMoveCommand = {
    commandId: string
    playerId: string
}

export type VisibleCardSelectedEvent = {
    card: Card
    id: string
    playerId: string
}

export type VisibleVertixSelectedEvent = {
    moveId: string
    playerId: string
    card: Card
    vertix: SerializableVertix
}

export const { useNewGameListener, emitNewGame } = createEvent('new-game')()
export const { usePlayerTurnChangedListener, emitPlayerTurnChanged } =
    createEvent('player-turn-changed')<PlayerTurnChangeEvent>()

export const { useCardAddedToPlayerListener, emitCardAddedToPlayer } =
    createEvent('card-added-to-player')<CardAddedToPlayerEvent>()

export const { usePlayerMadeMoveEventListener, emitPlayerMadeMoveEvent } = createEvent('player-made-move-event')<Move>()
export const { useScoreChangedEventListener, emitScoreChangedEvent } =
    createEvent('score-changed-event')<ScoreChangedEvent>()

export const { useVisibleHandMakeMoveCommandListener, emitVisibleHandMakeMoveCommand } = createEvent(
    'visible-hand-make-move-command'
)<MakeMoveCommand>()
export const { useVisibleCardSelectedEventListener, emitVisibleCardSelectedEvent } =
    createEvent('visible-card-selected-event')<VisibleCardSelectedEvent>()
export const { useVisibleVertixSelectedEventListener, emitVisibleVertixSelectedEvent } = createEvent(
    'visible-vertix-selected-event'
)<VisibleVertixSelectedEvent>()
