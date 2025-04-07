import { SerializabledBoard } from '../board/serializable-board'
import { GameAiPureMonteCarloTreeSearchPlayerConfiguration } from './game-ai-pure-monte-carlo-tree-search-player-configuration'
import { GameHumanPlayerConfiguration } from './game-human-player-configuration'
import { PlayerType } from './player-type'

export type GameAiPlayerCommonAttributes = {
    minWaitTime: number
}

export type GameAiPlayerConfiguration =
    GameAiPureMonteCarloTreeSearchPlayerConfiguration /* | GameAiMinimaxPlayerConfiguration //and others... */

export type GamePlayerCommonAttributes = {
    id: string
    type: PlayerType
}

export type GamePlayerConfiguration = (GameHumanPlayerConfiguration | GameAiPlayerConfiguration) &
    GamePlayerCommonAttributes

export type GameConfiguration = {
    players: GamePlayerConfiguration[]
    visibleHandPlayerId?: string
    cardsPerDirection: number
    cardsPerPlayer: number
    board: SerializabledBoard
}
