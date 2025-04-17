import { sleep } from '../math/sleep'
import { AiAlgorithm } from './algorithms/ai-algorithm'
import { AiAlgorithmType } from './algorithms/ai-algorithm-type'
import { PureMonteCarloTreeSearch } from './algorithms/pure-monte-carlo-tree-search'
import { InitializeAiMessage } from './messages/initialize-ai-message'
import { WebWorkerMessage } from './messages/message'
import { MessageType } from './messages/message-type'
import { MoveRequest } from './messages/move-request'

const readyMessage: WebWorkerMessage = {
    id: 'ready',
    messageType: MessageType.READY,
}
postMessage(readyMessage)

let aiAlgorithm: AiAlgorithm
const minWaitTime: number = process.env.NODE_ENV === 'development' ? 0 : 1000 // 1000ms

self.onmessage = async (event: MessageEvent<WebWorkerMessage>) => {
    try {
        switch (event.data.messageType) {
            case MessageType.CONFIGURATION:
                const initializeMessage = event.data as unknown as InitializeAiMessage
                if (initializeMessage.configuration.aiAlgorithm === AiAlgorithmType.PURE_MONTE_CARLO_TREE_SEARCH) {
                    aiAlgorithm = new PureMonteCarloTreeSearch(initializeMessage)
                }
                break
            case MessageType.MOVE_REQUEST:
                const [, response] = await Promise.all([
                    sleep(minWaitTime),
                    aiAlgorithm!.makeMove(event.data as unknown as MoveRequest),
                ])
                self.postMessage(response)
                break
        }
    } catch (exception) {
        console.log(`WW got exception`, event.data)
        console.error(exception)
        self.postMessage(exception)
    }
}
