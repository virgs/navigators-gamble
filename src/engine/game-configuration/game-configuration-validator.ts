import { SerializableVertix } from '../board/serializable-board'
import { directions } from '../directions'
import { GameConfiguration } from './game-configuration'

const isVertixOutOfBound = (vertix: SerializableVertix) => {
    return vertix.position.x < 0 || vertix.position.x > 1 || vertix.position.y < 0 || vertix.position.y > 1
}

export const gameConfigurationLimits = {
    cardsPerDirection: {
        min: 2,
        max: 5,
        step: 1,
    },
    initialCardsPerPlayer: {
        min: 2,
        max: 7,
        step: 1,
    },
    intelligence: {
        ai: {
            min: 0,
            max: 200,
            step: 10,
        },
        human: 30,
    },
    board: {
        vertices: {
            min: 6,
            max: 20,
        },
    },
}

export type ValidationResult = {
    valid: boolean
    errors: string[]
}

export class GameConfigurationValidator {
    private readonly gameConfiguration: GameConfiguration

    constructor(gameConfiguration: GameConfiguration) {
        this.gameConfiguration = gameConfiguration
    }

    public validate(): ValidationResult {
        const errors: string[] = []
        if (
            this.gameConfiguration.board.vertices.length >=
            this.gameConfiguration.cardsPerDirection * directions.length
        ) {
            errors.push(
                `Board has too many vertix to game configuration '${this.gameConfiguration.board.vertices.length}'. Max allowed '${
                    this.gameConfiguration.cardsPerDirection * directions.length
                }.'`
            )
        }
        if (this.gameConfiguration.board.vertices.length < gameConfigurationLimits.board.vertices.min) {
            errors.push('Not enough vertices. Minimum 6 vertices required.')
        }
        if (!this.gameConfiguration.levelName) {
            errors.push('Level name is required.')
        }
        if (this.gameConfiguration.board.vertices.some((vertix) => this.numberOfLinksOfAVertix(vertix) < 2)) {
            errors.push('Some vertices have less than 2 links.')
        }
        if (this.gameConfiguration.board.vertices.some((vertix) => isVertixOutOfBound(vertix))) {
            errors.push('Some vertices are out of bounds.')
        }
        return {
            valid: errors.length === 0,
            errors: errors,
        }
    }

    private numberOfLinksOfAVertix(vertex: SerializableVertix): number {
        const links = vertex.linkedVertices.length
        const comingLinks = this.gameConfiguration.board.vertices.filter((v) =>
            v.linkedVertices.includes(vertex.id)
        ).length
        return links + comingLinks
    }
}
