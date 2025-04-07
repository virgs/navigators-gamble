import { AiAlgorithmType } from '../../ai/algorithms/ai-algorithm-type'
import { GameAiPlayerCommonAttributes } from './game-configuration'
import { PlayerType } from './player-type'

export type GameAiPureMonteCarloTreeSearchPlayerConfiguration = {
    type: PlayerType.ARTIFICIAL_INTELLIGENCE
    aiAlgorithm: AiAlgorithmType.PURE_MONTE_CARLO_TREE_SEARCH
    iterations: number
} & GameAiPlayerCommonAttributes
