import { Directions } from '../directions'

export type SerializabledBoard = {
    vertices: {
        id: string
        direction?: Directions
        ownerId?: string
        linkedVertices: string[]
    }[]
}
