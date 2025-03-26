import { PlayerType } from './players/player-type'

export type GameConfiguration = {
    players: PlayerType[]
    cardsPerDirection: number
    cardsPerPlayer: number
}
