import { Directions } from '../directions'

export type Move = {
    vertixId: string
    direction: Directions
    playerId: string
    cardIndex: number
    cardId?: string
    moveId?: string
}
