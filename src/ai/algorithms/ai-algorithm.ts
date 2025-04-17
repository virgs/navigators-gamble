import { MoveRequest } from '../messages/move-request'
import { MoveResponse } from '../messages/move-response'

export interface AiAlgorithm {
    makeMove(moveRequest: MoveRequest): Promise<MoveResponse>
}
