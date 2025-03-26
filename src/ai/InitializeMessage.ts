import { GameConfiguration } from '../engine/game-configuration'
import { AiAlgorithmType } from './algorithms/ai-algorithm-type'
import { WebWorkerMessage } from './WebWorkerMessage'

export type InitializeMessage = {
    gameConfig: GameConfiguration
    runs: number
    playerId: string
    aiAlgorithm: AiAlgorithmType
} & WebWorkerMessage
