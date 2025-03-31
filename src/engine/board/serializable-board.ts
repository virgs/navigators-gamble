import { Point } from '../../math/point'
import { Directions } from '../directions'

export type PositionedSerializableVertix = SerializableVertix & {
    position: Point
}

export type SerializableVertix = {
    id: string
    direction?: Directions
    ownerId?: string
    linkedVertices: string[]
}

export type SerializabledBoard = {
    vertices: SerializableVertix[]
}

export type PositionedSerializabledBoard = {
    vertices: PositionedSerializableVertix[]
} & SerializabledBoard
