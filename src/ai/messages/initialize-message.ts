import { AiPureMonteCarloTreeSearchPlayerConfig } from '../../engine/players/ai-player'
import { WebWorkerMessage } from './message'

export type InitializePureMonteCarloTreeSearchMessage = AiPureMonteCarloTreeSearchPlayerConfig & WebWorkerMessage
