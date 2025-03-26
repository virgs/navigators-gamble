import { MoveResponse } from '../MoveResponse'
import { MoveRequest } from '../MoveRequest'

export interface AiAlgorithm {
    makeMove(moveRequest: MoveRequest): Promise<MoveResponse>
}
