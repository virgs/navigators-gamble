import { AiPlayerConfig } from '../../engine/players/ai-player'
import { WebWorkerMessage } from './message'

export type InitializeAiMessage = AiPlayerConfig & WebWorkerMessage
