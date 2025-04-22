import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { AiAlgorithmType } from '../ai/algorithms/ai-algorithm-type'
import { SerializableVertix } from '../engine/board/serializable-board'
import { GameConfiguration, GamePlayerConfiguration } from '../engine/game-configuration/game-configuration'
import {
    gameConfigurationLimits,
    GameConfigurationValidator,
    ValidationResult,
} from '../engine/game-configuration/game-configuration-validator'
import { PlayerType } from '../engine/game-configuration/player-type'
import { LevelEvaluator } from '../engine/level-evaluator/level-evaluator'
import { arrayShuffler } from '../math/array-shufller'
import { clamp } from '../math/clamp'
import { generateUID } from '../math/generate-id'
import { DifficultyGauge } from './DifficultyGauge'
import GraphEditor from './GraphEditor'
import './LevelEditor.scss'

const CANVAS_SIZE = 400
const GRID_LINES = 10

const createRandomValueFromLimits = (limits: { min: number; max: number; step: number }) => {
    const diff = limits.max - limits.min
    const randomValue = Math.floor(Math.random() * (diff / limits.step)) * limits.step + limits.min
    return randomValue
}

const exportLevel = (config: GameConfiguration, levelName: string) => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${levelName}.json`
    a.click()
}

const generateRandomVertices = (): SerializableVertix[] => {
    const spacing = 1 / GRID_LINES
    const allVertices = [...Array(GRID_LINES)]
        .map((_: any, x: number) => {
            return [...Array(GRID_LINES)].map((_: any, y: number) => {
                const vertix: SerializableVertix = {
                    id: `v-${generateUID()}`,
                    position: {
                        x: spacing * x,
                        y: spacing * y,
                    },
                    linkedVertices: [],
                }
                return vertix
            })
        })
        .flat()
    const numOfVertices =
        Math.floor((Math.random() * gameConfigurationLimits.board.vertices.max) / 3) +
        gameConfigurationLimits.board.vertices.min
    return arrayShuffler(allVertices).filter((_, i) => i < numOfVertices)
}

export default function LevelEditor(props: {
    onPlay: (configuration: GameConfiguration) => void
    configuration?: GameConfiguration
}) {
    const inputFile = useRef(null)
    const levelEvaluator = useRef<LevelEvaluator | null>(null)
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

    const [humanPlayerStarts, setHumanPlayerStarts] = useState<boolean>(true)

    const [estimatedDifficulty, setEstimatedDifficulty] = useState<number>(0.75)
    const [vertices, setVertices] = useState<SerializableVertix[]>([])
    const [initialCardsPerPlayer, setInitialCardsPerPlayer] = useState(
        gameConfigurationLimits.initialCardsPerPlayer.min
    )
    const [cardsPerDirection, setCardsPerDirection] = useState(gameConfigurationLimits.cardsPerDirection.min)
    const [levelName, setLevelName] = useState<string>(
        `Level ${Math.floor(Math.random() * 1000)
            .toFixed(0)
            .padStart(4, '0')}`
    )
    const [iterations, setIterations] = useState(gameConfigurationLimits.intelligence.ai.min)
    const [graphEditor, setGraphEditor] = useState<ReactElement>()

    useEffect(() => {
        if (props.configuration) {
            parseConfiguration(props.configuration)
        }
        resetGraphEditor(props.configuration?.board.vertices ?? [])
    }, [])

    useEffect(() => {
        setValidationResult(new GameConfigurationValidator(parseToConfiguration()).validate())
    }, [initialCardsPerPlayer, cardsPerDirection, iterations, vertices])

    const parseConfiguration = (config: GameConfiguration) => {
        setLevelName(config.levelName ?? 'Level name')
        setInitialCardsPerPlayer(clamp(config.initialCardsPerPlayer, gameConfigurationLimits.initialCardsPerPlayer))
        setCardsPerDirection(clamp(config.cardsPerDirection, gameConfigurationLimits.cardsPerDirection))
        setIterations(
            clamp(
                config.players.find((player) => player.type === PlayerType.ARTIFICIAL_INTELLIGENCE)
                    ?.iterationsPerAlternative ?? 0,
                gameConfigurationLimits.intelligence.ai
            )
        )
        setVertices(config.board.vertices)
        setHumanPlayerStarts(config.players[0].type === PlayerType.HUMAN)
        setEstimatedDifficulty(config.estimatedDifficulty)

        return config
    }

    const importLevel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = '' // Clear the input value to allow re-uploading the same file
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            const json = parseConfiguration(JSON.parse(reader.result as string) as GameConfiguration)
            resetGraphEditor(json.board.vertices)
        }
        reader.readAsText(file)
    }

    const parseToConfiguration = (): GameConfiguration => {
        const players: GamePlayerConfiguration[] = [
            {
                id: 'ai-player',
                type: PlayerType.ARTIFICIAL_INTELLIGENCE,
                iterationsPerAlternative: iterations,
                aiAlgorithm: AiAlgorithmType.PURE_MONTE_CARLO_TREE_SEARCH,
            },
        ]
        const humanPlayer: GamePlayerConfiguration = {
            id: 'human-player',
            type: PlayerType.HUMAN,
        }
        if (humanPlayerStarts) {
            players.unshift(humanPlayer)
        } else {
            players.push(humanPlayer)
        }
        return {
            levelId: generateUID(),
            levelName: levelName,
            players: players,
            estimatedDifficulty: estimatedDifficulty,
            visibleHandPlayerId: 'human-player',
            initialCardsPerPlayer: initialCardsPerPlayer,
            cardsPerDirection,
            board: {
                vertices: vertices,
            },
        }
    }

    const resetGraphEditor = (vertices: SerializableVertix[]) => {
        setGraphEditor(
            <GraphEditor
                vertices={vertices}
                onChange={(newVertices) => setVertices(newVertices)}
                gridLines={GRID_LINES}
                canvasSize={CANVAS_SIZE}
            ></GraphEditor>
        )
    }

    const onAutoGenerateButton = () => {
        const vertices = generateRandomVertices()

        setCardsPerDirection(createRandomValueFromLimits(gameConfigurationLimits.cardsPerDirection))
        setInitialCardsPerPlayer(createRandomValueFromLimits(gameConfigurationLimits.initialCardsPerPlayer))
        setIterations(createRandomValueFromLimits(gameConfigurationLimits.intelligence.ai))
        setLevelName(
            `Level ${Math.floor(Math.random() * 1000)
                .toFixed(0)
                .padStart(4, '0')}`
        )
        setHumanPlayerStarts(Math.random() > 0.5)
        setEstimatedDifficulty(0)
        setVertices(vertices)
        resetGraphEditor(vertices)
    }

    const onClearButton = () => {
        setVertices([])
        setLevelName('')
        setCardsPerDirection(createRandomValueFromLimits(gameConfigurationLimits.cardsPerDirection))
        setInitialCardsPerPlayer(createRandomValueFromLimits(gameConfigurationLimits.initialCardsPerPlayer))
        setIterations(createRandomValueFromLimits(gameConfigurationLimits.intelligence.ai))
        setLevelName(
            `Level ${Math.floor(Math.random() * 1000)
                .toFixed(0)
                .padStart(4, '0')}`
        )
        resetGraphEditor([])
    }

    const onEvaluateButton = async () => {
        await levelEvaluator.current?.terminate()
        setEstimatedDifficulty(0)
        levelEvaluator.current = new LevelEvaluator(
            parseToConfiguration(),
            gameConfigurationLimits.intelligence.human,
            3,
            (value) => {
                setEstimatedDifficulty(value)
            }
        )
        if (!levelEvaluator.current.terminated()) {
            const result = await levelEvaluator.current.evaluate(100)
            setEstimatedDifficulty(result)
        }
        levelEvaluator.current = null
    }

    const isValid = () => {
        if (levelEvaluator.current) {
            return false
        }
        return validationResult?.valid ?? false
    }

    return (
        <div className="level-editor-container">
            <div className="level-editor p-4 space-y-2">
                <h1 className="title mx-auto">Level Editor</h1>
                <div className="row justify-content-between">
                    <div className="col-auto">
                        <button
                            onClick={() => {
                                //@ts-expect-error
                                inputFile.current?.click()
                            }}
                            type="button"
                            className="btn btn-sm px-2"
                            id="load-level-button"
                        >
                            Load
                            <i className="bi bi-folder2-open ms-2"></i>
                            <input
                                type="file"
                                id="file"
                                ref={inputFile}
                                style={{ display: 'none' }}
                                accept="application/json"
                                onChange={(e) => {
                                    importLevel(e as React.ChangeEvent<HTMLInputElement>)
                                }}
                            />
                        </button>
                    </div>
                    <div className="col-auto" style={{ textAlign: 'end' }}>
                        <button
                            onClick={() => onClearButton()}
                            type="button"
                            className="btn btn-sm px-2"
                            id="clear-level-button"
                        >
                            Clear
                            <i className="bi bi-eraser ms-2"></i>
                        </button>
                    </div>
                    <div className="col-auto">
                        <button
                            id="random-level-button"
                            onClick={() => onAutoGenerateButton()}
                            type="button"
                            className="btn btn-sm px-2"
                        >
                            Generate
                            <i className="bi bi-magic ms-2"></i>
                        </button>
                    </div>
                    <div className="col-auto" style={{ textAlign: 'end' }}>
                        <button
                            id="evaluate-level-button"
                            disabled={!isValid()}
                            onClick={() => onEvaluateButton()}
                            type="button"
                            className="btn btn-sm px-2"
                        >
                            Evaluate
                            {levelEvaluator.current ? (
                                <div className="spinner-border spinner-border-sm ms-2" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            ) : (
                                <i className="bi bi-speedometer ms-2"></i>
                            )}
                        </button>
                    </div>
                    <div className="col-auto" style={{ textAlign: 'end' }}>
                        <button
                            id="play-level-button"
                            disabled={!isValid()}
                            onClick={() => props.onPlay(parseToConfiguration())}
                            type="button"
                            className="btn btn-sm px-2"
                        >
                            Play
                            <i className="bi bi-play ms-2"></i>
                        </button>
                    </div>

                    <div className="w-100 my-2"></div>

                    <div className="col-2">
                        <label htmlFor="initialCardsPerPlayer" className="form-label">
                            Hand size: {initialCardsPerPlayer}
                        </label>
                        <input
                            type="range"
                            className="form-range"
                            min={gameConfigurationLimits.initialCardsPerPlayer.min}
                            max={gameConfigurationLimits.initialCardsPerPlayer.max}
                            step={gameConfigurationLimits.initialCardsPerPlayer.step}
                            id="initialCardsPerPlayer"
                            value={initialCardsPerPlayer}
                            onChange={(e) => setInitialCardsPerPlayer(Number(e.target.value))}
                        />
                    </div>
                    <div className="col-2">
                        <label htmlFor="cardsPerDirection" className="form-label">
                            Direction: {cardsPerDirection}
                        </label>
                        <input
                            type="range"
                            className="form-range"
                            min={gameConfigurationLimits.cardsPerDirection.min}
                            max={gameConfigurationLimits.cardsPerDirection.max}
                            step={gameConfigurationLimits.cardsPerDirection.step}
                            id="cardsPerDirection"
                            value={cardsPerDirection}
                            onChange={(e) => setCardsPerDirection(Number(e.target.value))}
                        />
                    </div>
                    <div className="col-2">
                        <label htmlFor="iterationsPerAlternative" className="form-label">
                            AI level: {iterations}
                        </label>
                        <input
                            type="range"
                            className="form-range"
                            min={gameConfigurationLimits.intelligence.ai.min}
                            max={gameConfigurationLimits.intelligence.ai.max}
                            step={gameConfigurationLimits.intelligence.ai.step}
                            id="iterationsPerAlternative"
                            value={iterations}
                            onChange={(e) => setIterations(Number(e.target.value))}
                        />
                    </div>
                    <div className="col-2">
                        <label htmlFor="iterationsPerAlternative" className="form-label">
                            Difficulty
                        </label>
                        <DifficultyGauge value={estimatedDifficulty} minValue={0} maxValue={1}></DifficultyGauge>
                    </div>
                    <div className="col-4">
                        <label htmlFor="iterationsPerAlternative" className="form-label d-block">
                            Starting Player
                        </label>
                        <input
                            onChange={() => setHumanPlayerStarts(true)}
                            checked={humanPlayerStarts}
                            type="radio"
                            className="btn-check"
                            name="options-base"
                            id="human-player"
                            autoComplete="off"
                        />
                        <label className="btn w-50" htmlFor="human-player">
                            Human
                            <i className="bi bi-person-raised-hand ms-2"></i>
                        </label>

                        <input
                            onChange={() => setHumanPlayerStarts(false)}
                            checked={!humanPlayerStarts}
                            type="radio"
                            className="btn-check"
                            name="options-base"
                            id="ai-player"
                            autoComplete="off"
                        />
                        <label className="btn w-50" htmlFor="ai-player">
                            AI
                            <i className="bi bi-robot ms-2"></i>
                        </label>
                    </div>

                    <div className="w-100 my-2"></div>

                    <div className="col-6">
                        <div className="invalid-message my-2" style={{ color: isValid() ? 'transparent' : '' }}>
                            {!isValid() && validationResult?.errors[0]}
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="input-group">
                            <input
                                type="text"
                                value={levelName}
                                onChange={(evt) => setLevelName(evt.target.value)}
                                className="form-control"
                                placeholder="Level name"
                                aria-label="Level name"
                                aria-describedby="export-level-button"
                            />
                            <button
                                id="export-level-button"
                                disabled={!isValid()}
                                onClick={() => exportLevel(parseToConfiguration(), levelName)}
                                type="button"
                                className="btn btn-sm px-2"
                            >
                                Export
                                <i className="bi bi-floppy ms-2"></i>
                            </button>
                        </div>
                    </div>
                    <div className="w-100 my-2"></div>
                </div>
                {graphEditor}
            </div>
        </div>
    )
}
