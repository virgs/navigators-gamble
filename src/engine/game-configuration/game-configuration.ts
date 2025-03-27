import { SerializabledBoard } from '../board/serializable-board'
import { GameAiPureMonteCarloTreeSearchPlayerConfiguration } from './game-ai-pure-monte-carlo-tree-search-player-configuration'
import { GameHumanPlayerConfiguration } from './game-human-player-configuration'

export type GameAiPlayerConfiguration =
    GameAiPureMonteCarloTreeSearchPlayerConfiguration /* | GameAiMinimaxPlayerConfiguration //ant others... */

export type GamePlayerConfiguration = GameHumanPlayerConfiguration | GameAiPlayerConfiguration

export type GameConfiguration = {
    players: GamePlayerConfiguration[]
    cardsPerDirection: number
    cardsPerPlayer: number
    board: SerializabledBoard
}
