import { Directions } from '../directions'

export type Move = {
    vertixId: string
    direction: Directions
    cardId?: string
    playerId: string
}
