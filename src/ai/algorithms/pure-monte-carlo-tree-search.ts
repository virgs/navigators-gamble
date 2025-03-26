import { GameConfiguration } from '../../engine/game-configuration'
import { AiAlgorithm } from './ai-algorithm'
import { MoveResponse } from '../MoveResponse'
import { MoveRequest } from '../MoveRequest'
import { InitializeMessage } from '../InitializeMessage'
import { MessageType } from '../MessageType'

export class PureMonteCarloTreeSearch implements AiAlgorithm {
    private readonly gameConfig: GameConfiguration
    private readonly runs: number
    private readonly playerId: string

    constructor(initMessage: InitializeMessage) {
        this.gameConfig = initMessage.gameConfig
        this.runs = initMessage.runs
        this.playerId = initMessage.playerId
        console.log('Initialized')
    }

    public async makeMove(moveRequest: MoveRequest): Promise<MoveResponse> {
        console.log('Making move')
        console.log(moveRequest.board)

        return {
            messageType: MessageType.MOVE_RESPONSE,
            id: moveRequest.id,
            move: {
                vertixId: moveRequest.board.vertices.find((vertix) => vertix.ownerId === undefined)!.id,
                cardIndex: 0,
                direction: moveRequest.cards[0],
                playerId: this.playerId,
            },
        }
    }
}
