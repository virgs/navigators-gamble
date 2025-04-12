import React, { ReactElement, useEffect, useRef, useState } from "react";
import { AiAlgorithmType } from "../ai/algorithms/ai-algorithm-type";
import { SerializableVertix } from "../engine/board/serializable-board";
import { directions } from "../engine/directions";
import { GameConfiguration } from "../engine/game-configuration/game-configuration";
import { PlayerType } from "../engine/game-configuration/player-type";
import { LevelEvaluator } from "../engine/level-evaluator/level-evaluator";
import { arrayShuffler } from "../math/array-shufller";
import GraphEditor from "./GraphEditor";
import "./LevelEditor.scss";

const CANVAS_SIZE = 400;
const GRID_LINES = 8;

const aiLimits = {
    min: 0,
    max: 100,
    step: 10
};
const cardsPerDirectionLimits = {
    min: 2,
    max: 5,
};
const initialCardsPerPlayerLimits = {
    min: 2,
    max: 7,
};


const exportLevel = (config: GameConfiguration) => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.json`;
    a.click();
};

function generateRandomVertices() {
    const space = 1 / GRID_LINES;
    const allVertices = [...Array(GRID_LINES)].map((_: any, x: number) => {
        return [...Array(GRID_LINES)].map((_: any, y: number) => {
            const vertix: SerializableVertix = {
                id: `${x}-${y}`,
                position: {
                    x: space * x,
                    y: space * y,
                },
                linkedVertices: [],
            };
            return vertix;
        });
    }).flat();
    const numOfVertices = Math.floor(Math.random() * 20) + 6;
    return arrayShuffler(allVertices).filter((_, i) => i < numOfVertices);
}


export default function LevelEditor(props: { onExit: (configuration: GameConfiguration) => void, configuration?: GameConfiguration }) {
    const inputFile = useRef(null)

    const [vertices, setVertices] = useState<SerializableVertix[]>([]);
    const [initialCardsPerPlayer, setInitialCardsPerPlayer] = useState(initialCardsPerPlayerLimits.min);
    const [cardsPerDirection, setCardsPerDirection] = useState(cardsPerDirectionLimits.min);
    const [name, setName] = useState<string>("");
    const [iterations, setIterations] = useState(aiLimits.min);
    const [graphEditor, setGraphEditor] = useState<ReactElement>()

    const onLoadLevel = () => {
        //@ts-expect-error
        inputFile.current?.click();
    };

    useEffect(() => {
        if (props.configuration) {
            parseConfiguration(props.configuration);
        }
        resetGraphEditor(props.configuration?.board.vertices ?? []);
    }, []);

    const parseConfiguration = (config: GameConfiguration) => {
        setName(config.levelName ?? "Level name");
        setInitialCardsPerPlayer(config.initialCardsPerPlayer);
        setCardsPerDirection(config.cardsPerDirection);
        setIterations(config.players.find(player => player.type === PlayerType.ARTIFICIAL_INTELLIGENCE)?.iterationsPerAlternative ?? 0);
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
            levelName: name,
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

        setCardsPerDirection(Math.floor(Math.random() * (cardsPerDirectionLimits.max - cardsPerDirectionLimits.min)) + cardsPerDirectionLimits.min);
        setInitialCardsPerPlayer(Math.floor(Math.random() * (initialCardsPerPlayerLimits.max - initialCardsPerPlayerLimits.min)) + initialCardsPerPlayerLimits.min);
        setIterations(Math.floor(Math.random() * (aiLimits.max - aiLimits.min)) + aiLimits.min);
        setVertices(vertices);
        resetGraphEditor(vertices);
    };

    const onClearButton = () => {
        setVertices([]);
        setName("");
        setInitialCardsPerPlayer(4);
        setCardsPerDirection(3);
        setIterations(300);
        resetGraphEditor([]);
    };

    const numberOfLinksOfAVertix = (vertex: SerializableVertix) => {
        const links = vertex.linkedVertices.length;
        const comingLinks = vertices.filter(v => v.linkedVertices.includes(vertex.id)).length;
        return links + comingLinks;
    }

    const isValid = () => {
        if (vertices.length >= cardsPerDirection * directions.length) {
            console.log("Too many vertices");
            return false
        }
        if (vertices.length < 6) {
            // console.log("Not enough vertices");
            return false
        }
        if (!name) {
            console.log("Name is required");
            return false
        }
        if (vertices.some(vertix => numberOfLinksOfAVertix(vertix) < 2)) {
            console.log("Some vertices have less than 2 links");
            return false
        }
        return true;
    }

    return (
        <div className="p-4 space-y-4" style={{
            backgroundColor: 'var(--compass-secondary)',
            border: '3px solid var(--compass-primary)', color: 'var(--compass-white)', marginTop: '10px'
        }}>
            <h1 className="title">Level Editor</h1>
            <div className="row justify-content-between">
                <div className="col-auto" style={{ textAlign: 'end' }}>
                    <button onClick={() => onAutoGenerateButton()} type="button" className="btn btn-secondary px-4">
                        Generate
                        <i className="bi bi-magic ms-2"></i>
                    </button>
                </div>

                <div className="col-auto mb-2">
                    <button onClick={onLoadLevel} type="button" className="btn btn-info px-4">
                        Load
                        <i className="bi bi-cloud-arrow-up ms-2"></i>
                        <input type='file' id='file' ref={inputFile} style={{ display: 'none' }} accept="application/json"
                            onChange={importLevel} />
                    </button>
                </div>
                <div className="col-auto" style={{ textAlign: 'end' }}>
                    <button disabled={!isValid()} onClick={async () => {
                        console.log("Evaluating level...");
                        const result = await new LevelEvaluator(parseToConfiguration(), (aiLimits.max - aiLimits.min / 2)).evalue(100)
                        console.log("Level evaluation result: ", result);
                    }} type="button" className="btn btn-danger px-4">
                        Evaluate
                        <i className="bi bi-lightning-fill ms-2"></i>
                    </button>
                </div>
                <div className="col-auto" style={{ textAlign: 'end' }}>
                    <button onClick={() => onClearButton()} type="button" className="btn btn-danger px-4">
                        Clear
                        <i className="bi bi-eraser ms-2"></i>
                    </button>
                </div>
                <div className="col-auto" style={{ textAlign: 'end' }}>
                    <button disabled={!isValid()} onClick={() => props.onExit(parseToConfiguration())} type="button" className="btn btn-warning px-4">
                        Test
                        <i className="bi bi-play ms-2"></i>
                    </button>
                </div>
                <div className="col-4">
                    <label htmlFor="initialCardsPerPlayer" className="form-label">Initial cards per player: {initialCardsPerPlayer}</label>
                    <input type="range" className="form-range" min={initialCardsPerPlayerLimits.min} max={initialCardsPerPlayerLimits.max} step="1" id="initialCardsPerPlayer" value={initialCardsPerPlayer}
                        onChange={(e) => setInitialCardsPerPlayer(Number(e.target.value))} />
                </div>
                <div className="col-4">
                    <label htmlFor="cardsPerDirection" className="form-label">Cards per direction: {cardsPerDirection}</label>
                    <input type="range" className="form-range" min={cardsPerDirectionLimits.min} max={cardsPerDirectionLimits.max} step="1" id="cardsPerDirection" value={cardsPerDirection}
                        onChange={(e) => setCardsPerDirection(Number(e.target.value))} />
                </div>
                <div className="col-4">
                    <label htmlFor="iterationsPerAlternative" className="form-label">AI level: {iterations}</label>
                    <input type="range" className="form-range" min={aiLimits.min} max={aiLimits.max} step={aiLimits.step} id="iterationsPerAlternative"
                        value={iterations}
                        onChange={(e) => setIterations(Number(e.target.value))} />
                </div>
                <div className="offset-6 col-6">
                    <div className="input-group mb-3">
                        <input type="text" value={name} onChange={evt => setName(evt.target.value)} className="form-control" placeholder="Level name" aria-label="Level name"
                            aria-describedby="basic-addon2" />
                        <button id="basic-addon2" disabled={!isValid()} onClick={() => exportLevel(parseToConfiguration())} type="button" className="btn btn-primary px-4">
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

