import { Directions } from '../directions'

export type Move = {
    vertixId: string
    direction: Directions
    playerId: string
    cardId?: string
    moveId?: string
}
