import { AiPlayerInitialization } from '../../engine/players/ai-player'
import { WebWorkerMessage } from './message'

export type InitializeAiMessage = AiPlayerInitialization & WebWorkerMessage
