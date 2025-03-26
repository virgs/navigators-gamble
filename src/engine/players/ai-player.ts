import { Board } from '../board/board'
import { Card } from '../card'
import { Directions } from '../directions'
import { Move } from '../score-calculator/move'
import { Player } from './player'
import Worker from '../../ai/web-worker?worker'
import { GameConfiguration } from '../game-configuration'
import { BoardSerializer } from '../board/board-serializer'
import { WebWorkerMessage, InitializeMessage, MessageType, MoveRequest } from '../../ai/web-worker'
import { generateUID } from '../../math/generate-id'

type PromiseResult = (value: Move | PromiseLike<Move>) => void

export type AiPlayerConfig = {
    id: string
    runs: number
    gameConfig: GameConfiguration
    cards: Card[]
}

export class AiPlayer implements Player {
    private readonly _id: string
    private readonly cards: Card[]
    private _score: number = 0

    private readonly worker: Worker
    private readonly promisesMap: Record<string, PromiseResult>

    public constructor(aiPlayerConfig: AiPlayerConfig) {
        this._id = aiPlayerConfig.id
        this.cards = aiPlayerConfig.cards
        this._score = 0

        this.worker = new Worker()
        this.promisesMap = {}

        this.worker.onmessage = () => {
            const message: InitializeMessage = {
                gameConfig: aiPlayerConfig.gameConfig,
                runs: aiPlayerConfig.runs,
                playerId: aiPlayerConfig.id,
                playerCards: aiPlayerConfig.cards.map((card) => card.direction),
                id: generateUID(),
                messageType: MessageType.INITIALIZATION,
            }

            this.worker.postMessage(message)
            this.createWorkerHooks()
        }
    }

    public get id(): string {
        return this._id
    }

    public get score(): number {
        return this._score
    }

    public addScore(score: number): void {
        this._score += score
    }

    public terminate(): void {
        this.worker.terminate()
    }

    public drawCard(card: Card): void {
        console.log(`Player ${this.id} got card: ${Directions[card.direction]}`)
        this.cards.push(card)
    }

    public async chooseMove(board: Board, scores: Record<string, number>): Promise<Move> {
        return new Promise((resolve) => {
            const message: MoveRequest = {
                board: BoardSerializer.serialize(board),
                currentScores: scores,
                id: generateUID(),
                messageType: MessageType.MOVE_REQUEST,
            }
            console.log(`player cards: ${this.cards.map((card) => Directions[card.direction])}`)
            this.promisesMap[message.id] = resolve
            this.worker.postMessage(message)
        })
    }

    private createWorkerHooks() {
        this.worker.onerror = async (event) => console.error(event)
        this.worker.onmessage = async (event: MessageEvent<WebWorkerMessage>) => {
            const resolveMap = this.promisesMap[event.data.id]
            if (resolveMap) {
                resolveMap(event.data as unknown as Move)
                delete this.promisesMap[event.data.id]
            }
        }
    }
}
