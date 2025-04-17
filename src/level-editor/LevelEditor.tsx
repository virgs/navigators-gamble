import React, { ReactElement, useEffect, useRef, useState } from "react";
import { AiAlgorithmType } from "../ai/algorithms/ai-algorithm-type";
import { SerializableVertix } from "../engine/board/serializable-board";
import { GameConfiguration } from "../engine/game-configuration/game-configuration";
import { gameConfigurationLimits, GameConfigurationValidator, ValidationResult } from "../engine/game-configuration/game-configuration-validator";
import { PlayerType } from "../engine/game-configuration/player-type";
import { LevelEvaluator } from "../engine/level-evaluator/level-evaluator";
import { arrayShuffler } from "../math/array-shufller";
import { generateUID } from "../math/generate-id";
import GraphEditor from "./GraphEditor";
import "./LevelEditor.scss";
import { clamp } from "../math/clamp";

const CANVAS_SIZE = 400;
const GRID_LINES = 8;

const createRandomValueFromLimits = (limits: { min: number, max: number, step: number }) => {
    const diff = limits.max - limits.min;
    const randomValue = Math.floor(Math.random() * (diff / limits.step)) * limits.step + limits.min;
    return randomValue;
}


const exportLevel = (config: GameConfiguration, levelName: string) => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${levelName}.json`;
    a.click();
};

const generateRandomVertices = (): SerializableVertix[] => {
    const spacing = 1 / GRID_LINES;
    const allVertices = [...Array(GRID_LINES)].map((_: any, x: number) => {
        return [...Array(GRID_LINES)].map((_: any, y: number) => {
            const vertix: SerializableVertix = {
                id: `v-${generateUID()}`,
                position: {
                    x: spacing * x,
                    y: spacing * y,
                },
                linkedVertices: [],
            };
            return vertix;
        });
    }).flat();
    const numOfVertices = Math.floor(Math.random() * gameConfigurationLimits.board.vertices.max / 3) + gameConfigurationLimits.board.vertices.min;
    return arrayShuffler(allVertices).filter((_, i) => i < numOfVertices);
}

export default function LevelEditor(props: { onExit: (configuration: GameConfiguration) => void, configuration?: GameConfiguration }) {
    const inputFile = useRef(null)

    const [validation, setValidation] = useState<ValidationResult | undefined>(undefined);
    const [vertices, setVertices] = useState<SerializableVertix[]>([]);
    const [initialCardsPerPlayer, setInitialCardsPerPlayer] = useState(gameConfigurationLimits.initialCardsPerPlayer.min);
    const [cardsPerDirection, setCardsPerDirection] = useState(gameConfigurationLimits.cardsPerDirection.min);
    const [levelName, setLevelName] = useState<string>("");
    const [iterations, setIterations] = useState(gameConfigurationLimits.intelligence.ai.min);
    const [graphEditor, setGraphEditor] = useState<ReactElement>()

    useEffect(() => {
        if (props.configuration) {
            parseConfiguration(props.configuration);
        }
        resetGraphEditor(props.configuration?.board.vertices ?? []);
    }, []);

    useEffect(() => {
        const newLocal = new GameConfigurationValidator(parseToConfiguration()).validate();
        console.log("Validating configuration...", newLocal.errors);
        setValidation(newLocal);
    }, [initialCardsPerPlayer, cardsPerDirection, iterations, vertices]);

    const parseConfiguration = (config: GameConfiguration) => {
        setLevelName(config.levelName ?? "Level name");
        setInitialCardsPerPlayer(clamp(config.initialCardsPerPlayer, gameConfigurationLimits.initialCardsPerPlayer));
        setCardsPerDirection(clamp(config.cardsPerDirection, gameConfigurationLimits.cardsPerDirection));
        setIterations(clamp(config.players.find(player => player.type === PlayerType.ARTIFICIAL_INTELLIGENCE)?.iterationsPerAlternative ?? 0, gameConfigurationLimits.intelligence.ai));
        setVertices(config.board.vertices);

        return config;
    }

    const importLevel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const json = parseConfiguration(JSON.parse(reader.result as string) as GameConfiguration);
            resetGraphEditor(json.board.vertices);
        };
        reader.readAsText(file);
    };

    const parseToConfiguration = (): GameConfiguration => {
        return {
            levelName: levelName,
            players: [
                {
                    id: 'human-player',
                    type: PlayerType.HUMAN,
                },
                {
                    id: 'ai-player',
                    type: PlayerType.ARTIFICIAL_INTELLIGENCE,
                    iterationsPerAlternative: iterations,
                    aiAlgorithm: AiAlgorithmType.PURE_MONTE_CARLO_TREE_SEARCH,
                },
            ],
            visibleHandPlayerId: 'human-player',
            initialCardsPerPlayer: initialCardsPerPlayer,
            cardsPerDirection,
            board: {
                vertices: vertices,
            }
        };
    }

    const resetGraphEditor = (vertices: SerializableVertix[]) => {
        setGraphEditor(<GraphEditor
            vertices={vertices}
            onChange={(newVertices) => setVertices(newVertices)}
            gridLines={GRID_LINES}
            canvasSize={CANVAS_SIZE}
        ></GraphEditor>)
    }

    const onAutoGenerateButton = () => {
        const vertices = generateRandomVertices();

        setCardsPerDirection(createRandomValueFromLimits(gameConfigurationLimits.cardsPerDirection));
        setInitialCardsPerPlayer(createRandomValueFromLimits(gameConfigurationLimits.initialCardsPerPlayer));
        setIterations(createRandomValueFromLimits(gameConfigurationLimits.intelligence.ai));
        setLevelName(`Level ${Math.floor(Math.random() * 1000).toFixed(0).padStart(4, '0')}`);
        setVertices(vertices);
        resetGraphEditor(vertices);
    };

    const onClearButton = () => {
        setVertices([]);
        setLevelName("");
        setCardsPerDirection(createRandomValueFromLimits(gameConfigurationLimits.cardsPerDirection));
        setInitialCardsPerPlayer(createRandomValueFromLimits(gameConfigurationLimits.initialCardsPerPlayer));
        setIterations(createRandomValueFromLimits(gameConfigurationLimits.intelligence.ai));
        setLevelName(`Level ${Math.floor(Math.random() * 1000).toFixed(0).padStart(4, '0')}`);
        resetGraphEditor([]);
    };

    return (
        <div className="level-editor p-4 space-y-4" style={{
            backgroundColor: 'var(--compass-secondary)',
            border: '3px solid var(--compass-primary)', color: 'var(--compass-white)',
            marginTop: '10px'
        }}>
            <h1 className="title">Level Editor</h1>
            <div className="invalid-message my-2" style={{ color: validation?.valid ? 'transparent' : 'var(--compass-highlight-red)' }}>
                {(validation?.errors.length ?? 0) > 0 ? validation?.errors[0] : 'Invalid configuration'}
            </div>
            <div className="row justify-content-between">
                <div className="col-auto" style={{ textAlign: 'end' }}>
                    <button onClick={() => onAutoGenerateButton()} type="button" className="btn btn-secondary btn-sm px-4">
                        Generate
                        <i className="bi bi-magic ms-2"></i>
                    </button>
                </div>

                <div className="col-auto mb-2">
                    <button onClick={() => {
                        //@ts-expect-error
                        inputFile.current?.click();
                    }} type="button" className="btn btn-info btn-sm px-4">
                        Load
                        {/* <i className="bi bi-cloud-arrow-up ms-2"></i> */}
                        <i className="bi bi-folder2-open ms-2"></i>
                        <input type='file' id='file' ref={inputFile} style={{ display: 'none' }} accept="application/json"
                            onChange={importLevel} />
                    </button>
                </div>
                <div className="col-auto" style={{ textAlign: 'end' }}>
                    <button disabled={!validation?.valid} onClick={async () => {
                        await new LevelEvaluator(parseToConfiguration(), gameConfigurationLimits.intelligence.human).evaluate(100)
                    }} type="button" className="btn btn-danger btn-sm px-4">
                        Evaluate
                        <i className="bi bi-lightning-fill ms-2"></i>
                        {/* <i class="bi bi-speedometer"></i> */}
                    </button>
                </div>
                <div className="col-auto" style={{ textAlign: 'end' }}>
                    <button onClick={() => onClearButton()} type="button" className="btn btn-danger btn-sm px-4">
                        Clear
                        <i className="bi bi-eraser ms-2"></i>
                    </button>
                </div>
                <div className="col-auto" style={{ textAlign: 'end' }}>
                    <button disabled={!validation?.valid} onClick={() => props.onExit(parseToConfiguration())}
                        type="button" className="btn btn-warning btn-sm px-4">
                        Play
                        <i className="bi bi-play ms-2"></i>
                    </button>
                </div>
                <div className="col-4">
                    <label htmlFor="initialCardsPerPlayer" className="form-label">Initial cards per player: {initialCardsPerPlayer}</label>
                    <input type="range" className="form-range"
                        min={gameConfigurationLimits.initialCardsPerPlayer.min}
                        max={gameConfigurationLimits.initialCardsPerPlayer.max}
                        step={gameConfigurationLimits.initialCardsPerPlayer.step}
                        id="initialCardsPerPlayer" value={initialCardsPerPlayer}
                        onChange={(e) => setInitialCardsPerPlayer(Number(e.target.value))} />
                </div>
                <div className="col-4">
                    <label htmlFor="cardsPerDirection" className="form-label">Cards per direction: {cardsPerDirection}</label>
                    <input type="range" className="form-range"
                        min={gameConfigurationLimits.cardsPerDirection.min}
                        max={gameConfigurationLimits.cardsPerDirection.max}
                        step={gameConfigurationLimits.cardsPerDirection.step}
                        id="cardsPerDirection" value={cardsPerDirection}
                        onChange={(e) => setCardsPerDirection(Number(e.target.value))} />
                </div>
                <div className="col-4">
                    <label htmlFor="iterationsPerAlternative" className="form-label">AI level: {iterations}</label>
                    <input type="range" className="form-range"
                        min={gameConfigurationLimits.intelligence.ai.min}
                        max={gameConfigurationLimits.intelligence.ai.max}
                        step={gameConfigurationLimits.intelligence.ai.step}
                        id="iterationsPerAlternative"
                        value={iterations}
                        onChange={(e) => setIterations(Number(e.target.value))} />
                </div>
                <div className="offset-6 col-6">
                    <div className="input-group mb-3">
                        <input type="text" value={levelName} onChange={evt => setLevelName(evt.target.value)} className="form-control" placeholder="Level name" aria-label="Level name"
                            aria-describedby="basic-addon2" />
                        <button id="basic-addon2" disabled={!validation?.valid} onClick={() => exportLevel(parseToConfiguration(), levelName)}
                            type="button" className="btn btn-primary btn-sm px-4">
                            Save
                            <i className="bi bi-floppy ms-2"></i>
                        </button>
                    </div>
                </div>
            </div>
            {graphEditor}
        </div>
    );

}

