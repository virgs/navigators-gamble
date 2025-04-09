import { createEvent } from 'react-event-hook'
import { SerializableVertix } from '../engine/board/serializable-board'
import { Card } from '../engine/card'
import { Vertix } from '../engine/graph/vertix'
import { Move } from '../engine/score-calculator/move'
import { MoveScore } from '../engine/score-calculator/move-score'

export type PlayerTurnChangeEvent = {
    turnOrder: number
    playerId: string
}

export type CardAddedToPlayerEvent = {
    playerId: string
    card: Card
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

export type PlayerMadeMoveEvent = Move & {
    scores: MoveScore[]
    playerTurn: number
}

export type VerticesAnimationCommand = {
    playerId: string
    score: MoveScore
}

export const { useNewGameListener, emitNewGame } = createEvent('new-game')()
export const { usePlayerTurnChangedListener, emitPlayerTurnChanged } =
    createEvent('player-turn-changed')<PlayerTurnChangeEvent>()

export const { useCardAddedToPlayerListener, emitCardAddedToPlayer } =
    createEvent('card-added-to-player')<CardAddedToPlayerEvent>()

export const { usePlayerMadeMoveEventListener, emitPlayerMadeMoveEvent } =
    createEvent('player-made-move-event')<PlayerMadeMoveEvent>()

export const { useVisibleHandMakeMoveCommandListener, emitVisibleHandMakeMoveCommand } = createEvent(
    'visible-hand-make-move-command'
)<MakeMoveCommand>()
export const { useVisibleCardSelectedEventListener, emitVisibleCardSelectedEvent } =
    createEvent('visible-card-selected-event')<VisibleCardSelectedEvent>()
export const { useVisibleVertixSelectedEventListener, emitVisibleVertixSelectedEvent } = createEvent(
    'visible-vertix-selected-event'
)<VisibleVertixSelectedEvent>()

// score animations
export const { useBeginVerticesAnimationsCommandListener, emitBeginVerticesAnimationsCommand } = createEvent(
    'begin-vertices-animations-command'
)<VerticesAnimationCommand>()

export const { useLinkAnimationCommandListener, emitLinkAnimationCommand } = createEvent('link-animation-command')<{
    playerTurnOrder: number
    playerId: string
    first: Vertix
    second: Vertix
    score: MoveScore
}>()

export const { useEndOfScoreAnimationsEventListener, emitEndOfScoreAnimationsEvent } = createEvent(
    'end-of-score-animations-event'
)()

export const { useFinishVerticesAnimationsCommandListener, emitFinishVerticesAnimationsCommand } = createEvent(
    'finish-vertices-animations-command'
)<{ points: number; playerId: string }>()
