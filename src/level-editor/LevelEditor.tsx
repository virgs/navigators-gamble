import React, { ReactElement, use, useEffect, useRef, useState } from "react";
import { AiAlgorithmType } from "../ai/algorithms/ai-algorithm-type";
import { SerializableVertix } from "../engine/board/serializable-board";
import { GameConfiguration } from "../engine/game-configuration/game-configuration";
import { PlayerType } from "../engine/game-configuration/player-type";
import GraphEditor from "./GraphEditor";
import "./LevelEditor.scss"

const CANVAS_SIZE = 500;
const GRID_LINES = 7;

export default function LevelEditor(props: { onExit: (configuration: GameConfiguration) => void, configuration?: GameConfiguration }) {
    const inputFile = useRef(null)

    const [vertices, setVertices] = useState<SerializableVertix[]>([]);
    const [cardsPerPlayer, setCardsPerPlayer] = useState(4);
    const [cardsPerDirection, setCardsPerDirection] = useState(3);
    const [name, setName] = useState<string>("");
    const [iterations, setIterations] = useState(300);
    const [graphEditor, setGraphEditor] = useState<ReactElement>()

    const onButtonClick = () => {
        // `current` points to the mounted file input element
        //@ts-expect-error
        inputFile.current?.click();
    };

    useEffect(() => {
        if (props.configuration) {
            parseConfiguration(props.configuration);
        }
        setGraphEditor(<GraphEditor
            vertices={props.configuration?.board.vertices ?? vertices}
            onChange={(newVertices) => setVertices(newVertices)}
            gridLines={GRID_LINES}
            canvasSize={CANVAS_SIZE}
        ></GraphEditor>)
    }, []);

    const parseConfiguration = (config: GameConfiguration) => {
        setName(config.levelName ?? "Level name");
        setCardsPerPlayer(config.cardsPerPlayer);
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
            const fileContent = JSON.parse(reader.result as string) as GameConfiguration;
            const json = parseConfiguration(fileContent);

            setGraphEditor(<GraphEditor
                vertices={json.board.vertices}
                onChange={(newVertices) => setVertices(newVertices)}
                gridLines={GRID_LINES}
                canvasSize={CANVAS_SIZE}
            ></GraphEditor>)
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
                    minWaitTime: 1500,
                    iterationsPerAlternative: iterations,
                    aiAlgorithm: AiAlgorithmType.PURE_MONTE_CARLO_TREE_SEARCH,
                },
            ],
            visibleHandPlayerId: 'human-player',
            cardsPerPlayer,
            cardsPerDirection,
            board: {
                vertices: vertices,
            }
        };
    }

    const exportLevel = () => {

        const blob = new Blob([JSON.stringify(parseToConfiguration(), null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "level.json";
        a.click();
    };

    return (
        <div className="p-4 space-y-4" style={{
            backgroundColor: 'var(--compass-secondary)',
            border: '3px solid var(--compass-primary)', color: 'var(--compass-white)', marginTop: '10px'
        }}>
            <h1 className="title">Level Editor</h1>
            <div className="row justify-content-between">
                <div className="col-10 mb-2">
                    <button onClick={onButtonClick} type="button" className="btn btn-info px-4">
                        Load
                        <i className="bi bi-cloud-arrow-up ms-2"></i>
                        <input type='file' id='file' ref={inputFile} style={{ display: 'none' }} accept="application/json"
                            onChange={importLevel} />
                    </button>
                </div>
                <div className="col-2 align-self-start" style={{ textAlign: 'end' }}>
                    <button onClick={() => props.onExit(parseToConfiguration())} type="button" className="btn btn-danger px-4">
                        Exit
                        <i className="bi bi-house ms-2"></i>
                    </button>
                </div>
                <div className="col-4">
                    <label htmlFor="cardsPerPlayer" className="form-label">Cards per player: {cardsPerPlayer}</label>
                    <input type="range" className="form-range" min="2" max="7" step="1" id="cardsPerPlayer" value={cardsPerPlayer}
                        onChange={(e) => setCardsPerPlayer(Number(e.target.value))} />
                </div>
                <div className="col-4">
                    <label htmlFor="cardsPerDirection" className="form-label">Cards per direction: {cardsPerDirection}</label>
                    <input type="range" className="form-range" min="2" max="5" step="1" id="cardsPerDirection" value={cardsPerDirection}
                        onChange={(e) => setCardsPerDirection(Number(e.target.value))} />
                </div>
                <div className="col-4">
                    <label htmlFor="iterationsPerAlternative" className="form-label">AI level: {iterations}</label>
                    <input type="range" className="form-range" min="0" max="1000" step="100" id="iterationsPerAlternative"
                        value={iterations}
                        onChange={(e) => setIterations(Number(e.target.value))} />
                </div>
                <div className="offset-6 col-6">
                    <div className="input-group mb-3">
                        <input type="text" value={name} onChange={evt => setName(evt.target.value)} className="form-control" placeholder="Level name" aria-label="Level name"
                            aria-describedby="basic-addon2" />
                        <button id="basic-addon2" disabled={name.length === 0} onClick={exportLevel} type="button" className="btn btn-primary px-4">
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
