import { doLinesIntersect } from '../../math/line'
import { SerializableVertix } from '../board/serializable-board'
import { directions } from '../directions'
import { GameConfiguration } from './game-configuration'
import { PlayerType } from './player-type'

const isVertixOutOfBound = (vertix: SerializableVertix) => {
    return vertix.position.x < 0 || vertix.position.x > 1 || vertix.position.y < 0 || vertix.position.y > 1
}

export const gameConfigurationLimits = {
    cardsPerDirection: {
        min: 2,
        max: 3,
        step: 1,
    },
    initialCardsPerPlayer: {
        min: 3,
        max: 5,
        step: 1,
    },
    intelligence: {
        ai: {
            min: 0,
            max: 1000,
            step: 50,
        },
        human: 300,
    },
    board: {
        vertices: {
            min: 6,
            max: 20,
        },
    },
}

type Limits = {
    min: number
    max: number
    step: number
}

const respectLimits = (value: number, limit: Limits): boolean => {
    if (value < limit.min) {
        return false
    }
    if (value > limit.max) {
        return false
    }
    if ((value - limit.min) % limit.step !== 0) {
        return false
    }
    return true
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

        if (!this.gameConfiguration.levelName) {
            errors.push('Level name is required.')
        }

        errors.push(...this.validatePlayers())
        errors.push(...this.validateCards())
        errors.push(...this.validateVertices())
        errors.push(...this.validateEdges())

        return {
            valid: errors.length === 0,
            errors: errors,
        }
    }

    private validatePlayers(): string[] {
        const errors: string[] = []
        const aiPlayers = this.gameConfiguration.players.filter(
            (player) => player.type === PlayerType.ARTIFICIAL_INTELLIGENCE
        ).length

        if (aiPlayers > 2) {
            errors.push('Maximum 2 AI players allowed.')
        }
        if (this.gameConfiguration.players.length !== 2) {
            errors.push('The game must have 2 players.')
        }

        return errors
    }

    private validateCards(): string[] {
        const errors: string[] = []

        if (!respectLimits(this.gameConfiguration.cardsPerDirection, gameConfigurationLimits.cardsPerDirection)) {
            errors.push(
                `Cards per direction must be between ${gameConfigurationLimits.cardsPerDirection.min} and ${gameConfigurationLimits.cardsPerDirection.max} and a multiple of ${gameConfigurationLimits.cardsPerDirection.step}.`
            )
        }
        if (
            !respectLimits(this.gameConfiguration.initialCardsPerPlayer, gameConfigurationLimits.initialCardsPerPlayer)
        ) {
            errors.push(
                `Initial cards per player must be between ${gameConfigurationLimits.initialCardsPerPlayer.min} and ${gameConfigurationLimits.initialCardsPerPlayer.max} and a multiple of ${gameConfigurationLimits.initialCardsPerPlayer.step}.`
            )
        }

        return errors
    }

    private validateVertices(): string[] {
        const errors: string[] = []
        const vertices: Readonly<SerializableVertix[]> = this.gameConfiguration.board.vertices

        if (vertices.length >= this.gameConfiguration.cardsPerDirection * directions.length) {
            errors.push(
                `Board has too many vertix to game configuration '${vertices.length}'. Max allowed '${
                    this.gameConfiguration.cardsPerDirection * directions.length
                }.'`
            )
        }
        if (vertices.length < gameConfigurationLimits.board.vertices.min) {
            errors.push('Minimum 6 vertices required.')
        }
        const fewEdgesVertix = vertices.find((vertix) => this.numberOfEdgesOfAVertix(vertix) < 2)
        if (fewEdgesVertix) {
            errors.push(`Vertix '${fewEdgesVertix.id}' have less than 2 edges.`)
        }
        const outOfBoundVertix = vertices.find((vertix) => isVertixOutOfBound(vertix))
        if (outOfBoundVertix) {
            errors.push(`Vertix '${outOfBoundVertix?.id}' is out of bounds.`)
        }

        return errors
    }

    private validateEdges(): string[] {
        const errors: string[] = []
        const vertices: Readonly<SerializableVertix[]> = this.gameConfiguration.board.vertices

        const edges = vertices
            .flatMap((vertix) =>
                vertix.linkedVertices.map((linkedVertixId) => ({
                    start: vertix.position,
                    end: vertices.find((v) => v.id === linkedVertixId)?.position,
                    linkedVertixId,
                }))
            )
            .filter((edge) => edge.end !== undefined)

        if (
            edges.find((edge1, index) =>
                edges.slice(index + 1).some((edge2) => {
                    const newLocal = doLinesIntersect(
                        { start: edge1.start, end: edge1.end! },
                        { start: edge2.start, end: edge2.end! },
                        0.5
                    )
                    if (newLocal) {
                        console.log('Intersecting edges:', edge1, edge2)
                    }
                    return newLocal
                })
            )
        ) {
            errors.push('Some edges intersect.')
        }

        return errors
    }

    private numberOfEdgesOfAVertix(vertex: SerializableVertix): number {
        const links = vertex.linkedVertices.length
        const comingLinks = this.gameConfiguration.board.vertices.filter((v: SerializableVertix) =>
            v.linkedVertices.includes(vertex.id)
        ).length
        return links + comingLinks
    }
}
