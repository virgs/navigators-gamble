import { cardValues, CardValues, cardValueToName, isNextInCardValues, isPreviousInCardValues } from './card-value'
import { Colors } from './colors'
import { ScoreType } from './score-type'
import { LinkedVertix, Vertix } from './vertix'

export type Move = {
    vertixId: string
    cardValue: CardValues
    color: Colors
}

export type SerializableBoard = {
    vertices: {
        id: string
        cardValue?: CardValues
        color?: Colors
        linkedVertices: {
            vertixId: string
        }[]
    }[]
}

export class Board {
    private readonly verticesMap: { [vertixId: string]: Vertix }

    constructor(serializableBoard: SerializableBoard) {
        this.verticesMap = {}

        serializableBoard.vertices.forEach((serializableVertix) => {
            this.verticesMap[serializableVertix.id] = new Vertix(
                serializableVertix.id,
                serializableVertix.cardValue,
                serializableVertix.color
            )
        })

        serializableBoard.vertices.forEach((serializableVertix) => {
            serializableVertix.linkedVertices.forEach((linkedVertix) => {
                this.verticesMap[serializableVertix.id].linkTo(this.verticesMap[linkedVertix.vertixId])
            })
        })
    }

    public getVertices(): Vertix[] {
        return Object.values(this.verticesMap)
    }

    public putCard(move: Move): number {
        const vertix = this.verticesMap[move.vertixId]
        if (vertix.getCardValue() !== undefined) {
            throw new Error(`Vertix ${move.vertixId} already has a card`)
        }
        vertix.putCard(move.cardValue)

        const linkedVerticesWithCard: LinkedVertix[] = vertix.getLinkedVerticesWithCardValue()

        console.log(move)
        // console.log(linkedVerticesWithCard)

        const pairs = linkedVerticesWithCard
            .filter((linkedVertice: LinkedVertix) => linkedVertice.vertix.getCardValue() === move.cardValue)
            .map((linkedVertix: LinkedVertix) => {
                vertix.setColor(move.color)
                // linkedVertix.link.setScoreType(ScoreType.PAIR)
                linkedVertix.vertix.setColor(move.color)
            })

        const cancels = linkedVerticesWithCard
            .filter(
                (linkedVertice: LinkedVertix) =>
                    Math.abs(linkedVertice.vertix.getCardValue()! - move.cardValue) === cardValues.length / 2
            )
            .map((linkedVertix: LinkedVertix) => {
                vertix.setColor(move.color)
                // linkedVertix.link.setScoreType(ScoreType.CANCEL)
                linkedVertix.vertix.setColor(move.color)
            })

        const increasingSequences = this.getSequences([vertix], isNextInCardValues) //8, 7
        const decreasingSequences = this.getSequences([vertix], isPreviousInCardValues) //8, 9

        let sequences: Vertix[][] = []
        if (increasingSequences.length > 0 && decreasingSequences.length > 0) {
            increasingSequences.forEach((increasingSequence: Vertix[]) => {
                decreasingSequences.forEach((decreasingSequence: Vertix[]) => {
                    const [, ...restIncreasingSequence] = increasingSequence
                    sequences.push(restIncreasingSequence.concat(decreasingSequence))
                })
            })
        } else {
            sequences = increasingSequences.concat(decreasingSequences)
        }

        sequences.forEach((sequence: Vertix[]) => {
            sequence.forEach((vertix: Vertix) => {
                vertix.setColor(move.color)
            })
            sequence.forEach((vertix: Vertix, index: number) => {
                if (index === 0) {
                    return
                }
                sequence[index - 1].getLinkedVertices().forEach((linkedVertix: LinkedVertix) => {
                    if (linkedVertix.vertix === vertix) {
                        // linkedVertix.link.setScoreType(ScoreType.INCREASING_SEQUENCE)
                    }
                })
            })
            console.log(
                sequence
                    .map((vertix: Vertix) => `${vertix.getId()}(${cardValueToName(vertix.getCardValue())})`)
                    .join(' -> ')
            )
        })

        return sequences.length
    }

    private getSequences(currentSequence: Vertix[], sequenceCheck: Function): Vertix[][] {
        const vertix: Vertix = currentSequence[currentSequence.length - 1]
        const result: Vertix[][] = []

        const linkedVertices = vertix.getLinkedVerticesWithCardValue()
        linkedVertices
            .filter((linkedVertix: LinkedVertix) =>
                sequenceCheck(vertix.getCardValue()!, linkedVertix.vertix.getCardValue()!)
            )
            .forEach((linkedVertix: LinkedVertix) => {
                const children = this.getSequences([...currentSequence, linkedVertix.vertix], sequenceCheck)
                if (children.length === 0) {
                    result.push([vertix, linkedVertix.vertix])
                } else {
                    children.forEach((children: Vertix[]) => {
                        result.push([vertix, ...children])
                    })
                }
            })
        return result
    }
}
