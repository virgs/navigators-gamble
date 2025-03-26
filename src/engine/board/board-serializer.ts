import { Vertix } from '../graph/vertix'
import { Board } from './board'
import { SerializabledBoard } from './serializable-board'

export class BoardSerializer {
    public static deserialize(serialized: string): Board {
        const verticesMap: Record<string, Vertix> = {}
        const serializableBoard: SerializabledBoard = JSON.parse(serialized)
        serializableBoard.vertices.forEach((serializableVertix) => {
            verticesMap[serializableVertix.id] = new Vertix(
                serializableVertix.id,
                serializableVertix.ownerId,
                serializableVertix.direction
            )
        })

        serializableBoard.vertices.forEach((serializableVertix) => {
            serializableVertix.linkedVertices.forEach((linkedVertix) => {
                verticesMap[serializableVertix.id].linkTo(verticesMap[linkedVertix])
            })
        })
        return new Board(verticesMap)
    }

    public static serialize(board: Board): string {
        const serializable: SerializabledBoard = {
            vertices: board.getVertices().map((vertix) => {
                return {
                    id: vertix.id,
                    direction: vertix.direction,
                    ownerId: vertix.ownerId,
                    linkedVertices: vertix.getLinkedVertices().map((vertix: Vertix) => vertix.id),
                }
            }),
        }
        return JSON.stringify(serializable)
    }
}
