import { LinkedVertix, Vertix } from '../graph/vertix'
import { Board } from './board'
import { SerializabledBoard } from './serializable-board'

export class BoardSerializer {
    public static deserialize(serializableBoard: SerializabledBoard): Board {
        const verticesMap: Record<string, Vertix> = {}
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

    public static serialize(board: Board): SerializabledBoard {
        return {
            vertices: board.getVertices().map((vertix) => {
                return {
                    id: vertix.id,
                    direction: vertix.direction,
                    ownerId: vertix.ownerId,
                    linkedVertices: vertix
                        .getLinkedVertices()
                        .map((linkedVertice: LinkedVertix) => linkedVertice.vertix.id),
                }
            }),
        }
    }
}
