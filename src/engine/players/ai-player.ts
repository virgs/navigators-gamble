import { AiAlgorithmType } from '../../ai/algorithms/ai-algorithm-type'
import { InitializeAiMessage } from '../../ai/messages/initialize-message'
import { WebWorkerMessage } from '../../ai/messages/message'
import { MessageType } from '../../ai/messages/message-type'
import { MoveRequest } from '../../ai/messages/move-request'
import { MoveResponse } from '../../ai/messages/move-response'
import Worker from '../../ai/web-worker?worker'
import { generateUID } from '../../math/generate-id'
import { BoardSerializer } from '../board/board-serializer'
import { Card } from '../card'
import { GameConfiguration } from '../game-configuration'
import { Move } from '../score-calculator/move'
import { ChooseMoveInput, Player } from './player'

type PromiseResult = (value: Move | PromiseLike<Move>) => void

export type AiPlayerConfig = {
    playerId: string
    iterations: number
    turnOrder: number
    playersIds: string[]
    gameConfig: GameConfiguration
    cards: Card[]
    algorithm: AiAlgorithmType
}

export class AiPlayer implements Player {
    private readonly _id: string
    private readonly cards: Card[]
    private _score: number = 0

    private readonly worker: Worker
    private readonly promisesMap: Record<string, PromiseResult>
    private readonly readyPromise: Promise<void>

    public constructor(aiPlayerConfig: AiPlayerConfig) {
        this._id = aiPlayerConfig.playerId
        this.cards = aiPlayerConfig.cards
        this._score = 0

        this.worker = new Worker()
        this.promisesMap = {}

        this.readyPromise = new Promise<void>((resolve) => {
            this.worker.onmessage = () => {
                const message: InitializeAiMessage = {
                    messageType: MessageType.INITIALIZATION,
                    id: generateUID(),
                    ...aiPlayerConfig,
                }

                this.worker.postMessage(message)
                this.createWorkerHooks()
                resolve()
            }
        })
    }

    public get id(): string {
        return this._id
    }

    public get score(): number {
        return this._score
    }

    public finish(): void {
        this.worker.terminate()
    }

    public addScore(score: number): void {
        this._score += score
    }

    public drawCard(card: Card): void {
        this.cards.push(card)
    }

    public async makeMove(chooseMoveInput: ChooseMoveInput): Promise<Move> {
        await this.readyPromise
        return new Promise((resolve) => {
            const message: MoveRequest = {
                messageType: MessageType.MOVE_REQUEST,
                id: generateUID(),
                board: BoardSerializer.serialize(chooseMoveInput.board),
                playerCards: this.cards.map((card) => card.direction),
                currentScores: chooseMoveInput.scores,
            }
            this.promisesMap[message.id] = resolve
            this.worker.postMessage(message)
        })
    }

    private createWorkerHooks() {
        this.worker.onerror = async (event) => console.error(event)
        this.worker.onmessage = async (event: MessageEvent<WebWorkerMessage>) => {
            const resolveMap = this.promisesMap[event.data.id]
            if (resolveMap) {
                const moveResponse = event.data as unknown as MoveResponse
                console.log(
                    `Player ${this.id} played card index ${moveResponse.move.cardIndex} whose value is: ${moveResponse.move.direction} on vertix in ${moveResponse.move.vertixId}`
                )
                this.cards.splice(moveResponse.move.cardIndex, 1)
                resolveMap(moveResponse.move)
                delete this.promisesMap[event.data.id]
            }
        }
    }
}
