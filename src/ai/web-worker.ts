import { SerializabledBoard } from '../engine/board/serializable-board'
import { Directions } from '../engine/directions'
import { GameConfiguration } from '../engine/game-configuration'

export enum MessageType {
    INITIALIZATION,
    MOVE_REQUEST,
    READY,
}

export type WebWorkerMessage = {
    id: string
    messageType: MessageType
}

export type InitializeMessage = {
    gameConfig: GameConfiguration
    runs: number
    playerId: string
    playerCards: Directions[]
} & WebWorkerMessage

export type MoveRequest = {
    board: SerializabledBoard
    currentScores: Record<string, number>
} & WebWorkerMessage

const readyMessage: WebWorkerMessage = {
    id: 'ready',
    messageType: MessageType.READY,
}
postMessage(readyMessage)

self.onmessage = (event: MessageEvent<WebWorkerMessage>) => {
    const request = event.data
    try {
        switch (event.data.messageType) {
            case MessageType.INITIALIZATION:
                console.log(event.data)
                break
            case MessageType.MOVE_REQUEST:
                console.log(event.data)
                break
        }
        // self.postMessage('response')
    } catch (exception) {
        console.log(`WW ${request} got exception`)
        console.error(exception)
        self.postMessage(exception)
    }
}
