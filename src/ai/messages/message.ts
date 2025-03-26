import { MessageType } from './message-type'

export type WebWorkerMessage = {
    id: string
    messageType: MessageType
}
