import { AiAlgorithm } from './algorithms/ai-algorithm'
import { MoveResponse } from './MoveResponse'
import { MoveRequest } from './MoveRequest'

export class ArtificialIntelligence {
    private readonly aiAlgorithm: AiAlgorithm
    public constructor(aiAlgorithm: AiAlgorithm) {
        this.aiAlgorithm = aiAlgorithm
    }
    public async makeMove(moveRequest: MoveRequest): Promise<MoveResponse> {
        return this.aiAlgorithm.makeMove(moveRequest)
    }
}
