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

self.onmessage = async (event: MessageEvent<WebWorkerMessage>) => {
    try {
        switch (event.data.messageType) {
            case MessageType.INITIALIZATION:
                const initializeMessage = event.data as unknown as InitializeAiMessage
                if (initializeMessage.aiConfiguration.aiAlgorithm === AiAlgorithmType.PURE_MONTE_CARLO_TREE_SEARCH) {
                    aiAlgorithm = new PureMonteCarloTreeSearch(initializeMessage)
                }
                break
            case MessageType.MOVE_REQUEST:
                self.postMessage(await aiAlgorithm!.makeMove(event.data as unknown as MoveRequest))
                break
        }
    } catch (exception) {
        console.log(`WW got exception`, event.data)
        console.error(exception)
        self.postMessage(exception)
    }
}
