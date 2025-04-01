import { Point } from '../../math/point'
import { Directions } from '../directions'

export type SerializableVertix = {
    id: string
    position: Point
    direction?: Directions
    ownerId?: string
    linkedVertices: string[]
}

export type SerializabledBoard = {
    vertices: SerializableVertix[]
}
