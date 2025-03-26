import { AiAlgorithm } from './algorithms/ai-algorithm'
import { AiAlgorithmType } from './algorithms/ai-algorithm-type'
import { PureMonteCarloTreeSearch } from './algorithms/pure-monte-carlo-tree-search'
import { ArtificialIntelligence } from './artificial-intelligence'
import { InitializeAiMessage } from './messages/initialize-message'
import { WebWorkerMessage } from './messages/message'
import { MessageType } from './messages/message-type'
import { MoveRequest } from './messages/move-request'

const readyMessage: WebWorkerMessage = {
    id: 'ready',
    messageType: MessageType.READY,
}
postMessage(readyMessage)

let artificialIntelligence: ArtificialIntelligence

self.onmessage = async (event: MessageEvent<WebWorkerMessage>) => {
    try {
        switch (event.data.messageType) {
            case MessageType.INITIALIZATION:
                const initializeMessage = event.data as unknown as InitializeAiMessage
                let aiAlgorithm: AiAlgorithm
                if (initializeMessage.algorithm === AiAlgorithmType.PURE_MONTE_CARLO_TREE_SEARCH) {
                    aiAlgorithm = new PureMonteCarloTreeSearch(event.data as unknown as InitializeAiMessage)
                }
                artificialIntelligence = new ArtificialIntelligence(aiAlgorithm!)
                break
            case MessageType.MOVE_REQUEST:
                self.postMessage(await artificialIntelligence!.makeMove(event.data as unknown as MoveRequest))
                break
        }
    } catch (exception) {
        console.log(`WW ${event.data} got exception`)
        console.error(exception)
        self.postMessage(exception)
    }
}
