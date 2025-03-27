import { DirectionsComparer } from '../directions'
import { Vertix, LinkedVertix } from '../graph/vertix'

export class UniqueSequenceFinder {
    private readonly seenSequences = new Set<string>()

    public findUniqueSequences(startSequence: Vertix[], sequenceCheck: DirectionsComparer): Vertix[][] {
        return this.explore(startSequence, sequenceCheck)
    }

    private explore(currentSequence: Vertix[], sequenceCheck: DirectionsComparer): Vertix[][] {
        const current: Vertix = currentSequence[currentSequence.length - 1]
        const result: Vertix[][] = []

        const key = currentSequence.map((v) => v.id).join('-')
        if (this.seenSequences.has(key)) return []
        this.seenSequences.add(key)

        const linkedVertices = current.getLinkedVerticesWithDirection()

        const validChildren = linkedVertices
            .filter((linked: LinkedVertix) => sequenceCheck(current.direction!, linked.vertix.direction!))
            .filter((linked: LinkedVertix) => !currentSequence.some((v) => v.id === linked.vertix.id))

        if (validChildren.length === 0) {
            return [currentSequence]
        }

        for (const linked of validChildren) {
            const extended = [...currentSequence, linked.vertix]
            result.push(...this.explore(extended, sequenceCheck))
        }

        return result
    }
}
