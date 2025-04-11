import React, { useEffect, useState } from "react";
import { Stage, Layer, Circle, Line, Text, Group } from "react-konva";
import { AiAlgorithmType } from "../ai/algorithms/ai-algorithm-type";
import { PlayerType } from "../engine/game-configuration/player-type";
import { generateUID } from "../math/generate-id";
import { GameConfiguration } from "../engine/game-configuration/game-configuration";
import { Point } from "../math/point";

interface Vertex {
    id: string;
    x: number;
    y: number;
    links: string[];
}

const MAX_VERTICES = 40;
const CANVAS_SIZE = 500;

const gridLines = 7;

export default function LevelEditor(props: { onExit: () => void }) {
    const [stageDragInit, setStageDragInit] = useState<Point | undefined>(undefined);
    const [vertices, setVertices] = useState<Vertex[]>([]);
    const [selectedVertix, setSelectedVertix] = useState<string | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<string[] | null>(null);
    const [cardsPerPlayer, setCardsPerPlayer] = useState(4);
    const [cardsPerDirection, setCardsPerDirection] = useState(3);
    const [iterations, setIterations] = useState(300);

    const snapToGrid = (x: number, y: number) => {
        const cellSize = CANVAS_SIZE / (gridLines - 1);
        return {
            x: Math.round(x / cellSize) * cellSize,
            y: Math.round(y / cellSize) * cellSize,
        };
    };

    const snapAllVertices = (verts: Vertex[]) =>
        verts.map((v) => {
            const { x, y } = snapToGrid(v.x, v.y);
            return { ...v, x, y };
        });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Delete" || e.key === "Backspace") {
                if (selectedVertix) {
                    // Deleta vértice
                    setVertices((prev) =>
                        prev
                            .filter((v) => v.id !== selectedVertix)
                            .map((v) => ({ ...v, links: v.links.filter((l) => l !== selectedVertix) }))
                    );
                    setSelectedVertix(null);
                } else if (selectedEdge) {
                    // Deleta aresta
                    const [from, to] = selectedEdge;
                    setVertices((prev) =>
                        prev.map((v) =>
                            v.id === from ? { ...v, links: v.links.filter((id) => id !== to) } : v
                        )
                    );
                    setSelectedEdge(null);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedVertix, selectedEdge]);

    useEffect(() => {
        setVertices((prev) => snapAllVertices(prev));
    }, [gridLines]);

    const addVertex = (x: number, y: number) => {
        if (vertices.length >= MAX_VERTICES) return;
        const id = `v${generateUID()}`;
        const { x: sx, y: sy } = snapToGrid(x, y);
        setVertices([...vertices, { id, x: sx, y: sy, links: [] }]);
    };

    const deleteVertex = (id: string) => {
        setVertices((prev) =>
            prev
                .filter((v) => v.id !== id)
                .map((v) => ({ ...v, links: v.links.filter((l) => l !== id) }))
        );
        setSelectedVertix(null);
    };

    const toggleLink = (id1: string, id2: string) => {
        if (id1 === id2) return;
        setVertices((vertices) =>
            vertices.map((vertix) => {
                if (vertix.id === id1) {
                    return {
                        ...vertix,
                        links: vertix.links.includes(id2)
                            ? vertix.links.filter((l) => l !== id2)
                            : [...vertix.links, id2],
                    };
                }
                return vertix;
            })
        );
    };

    const handleClick = (e: MouseEvent) => {
        if (e.button === 0) {
            const pointer = {
                x: e.layerX,
                y: e.layerY,
            };
            if (pointer) addVertex(pointer.x, pointer.y);
        }
    };

    const importLevel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const json = JSON.parse(reader.result as string) as GameConfiguration;
            setCardsPerPlayer(json.cardsPerPlayer);
            setCardsPerDirection(json.cardsPerDirection);
            setIterations(json.players.find(player => player.type === PlayerType.ARTIFICIAL_INTELLIGENCE)?.iterationsPerAlternative ?? 0);
            const imported = json.board.vertices.map((v: any) => ({
                id: v.id,
                x: v.position.x * CANVAS_SIZE,
                y: v.position.y * CANVAS_SIZE,
                links: v.linkedVertices,
            }));
            setVertices(snapAllVertices(imported));
        };
        reader.readAsText(file);
    };

    const exportLevel = () => {
        const simplified = vertices.map(({ id, x, y, links }) => ({
            id,
            position: { x: parseFloat((x / CANVAS_SIZE).toFixed(3)), y: parseFloat((y / CANVAS_SIZE).toFixed(3)) },
            linkedVertices: links,
        }));
        const json = JSON.stringify({
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
                vertices: simplified,
            }
        }, null, 2);
        const blob = new Blob([json], { type: "application/json" });
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
            <h2>Level Editor</h2>
            <div className="row justify-content-between">
                <div className="col-10 mb-2">
                    <label htmlFor="formFile" className="form-label">Load</label>
                    <input className="form-control form-control" type="file" id="formFile" accept="application/json"
                        onChange={importLevel} />
                </div>
                <div className="col-2 align-self-start" style={{ textAlign: 'end' }}>
                    <button onClick={() => props.onExit()} type="button" className="btn btn-danger">
                        EXIT
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
                <div className="offset-10 col-2" style={{ textAlign: 'end' }}>
                    <button onClick={exportLevel} type="button" className="btn btn-primary">
                        Save
                    </button>
                </div>

            </div>

            <Stage
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                onContextMenu={(e) => e.evt.preventDefault()}
                onMouseDown={(e) => {
                    if (e.evt.button === 2) {
                        const stage = e.target.getStage()!;
                        const pointer = stage.getPointerPosition()!;
                        setStageDragInit({ x: pointer.x, y: pointer.y });
                    }
                }}
                onMouseMove={(e) => {
                    if (e.evt.buttons === 2 && stageDragInit) {
                        const stage = e.target.getStage()!;
                        const pointer = stage.getPointerPosition()!;
                        const dx = pointer.x - stageDragInit.x;
                        const dy = pointer.y - stageDragInit.y;
                        setStageDragInit(pointer);
                        setVertices((prev) => prev.map((v) => ({ ...v, x: v.x + dx, y: v.y + dy })));
                    }
                }}
                onMouseUp={() => {
                    setVertices((prev) => snapAllVertices(prev.map((v) => ({ ...v, x: v.x, y: v.y }))));
                    setStageDragInit(undefined);
                }}
                onClick={(e) => handleClick(e.evt)}
                className="border border-gray-300 my-2"
                style={{ backgroundColor: 'var(--compass-tertiary)', justifyItems: 'center', alignItems: 'center' }}
            >
                <Layer style={{ backgroundColor: 'red' }}>
                    {/* Grid lines */}
                    {[...Array(gridLines)].map((_, i) => {
                        const pos = (CANVAS_SIZE / (gridLines - 1)) * i;
                        return (
                            <React.Fragment key={i}>
                                <Line key={`h-${i}`} points={[0, pos, CANVAS_SIZE, pos]} stroke="gray" opacity={0.5} strokeWidth={1} />
                                <Line key={`v-${i}`} points={[pos, 0, pos, CANVAS_SIZE]} stroke="gray" opacity={0.5} strokeWidth={1} />
                            </React.Fragment>
                        );
                    })}

                    {/* Edges */}
                    {vertices.map((v) =>
                        v.links.map((l) => {
                            const target = vertices.find((vv) => vv.id === l);
                            if (!target) return null;

                            const dx = target.x - v.x;
                            const dy = target.y - v.y;
                            const angle = Math.atan2(dy, dx);
                            const arrowLength = 10;
                            const arrowAngle = Math.PI / 7;

                            const arrowX = target.x - Math.cos(angle) * 10;
                            const arrowY = target.y - Math.sin(angle) * 10;

                            const arrowPoints = [
                                arrowX,
                                arrowY,
                                arrowX - arrowLength * Math.cos(angle - arrowAngle),
                                arrowY - arrowLength * Math.sin(angle - arrowAngle),
                                arrowX - arrowLength * Math.cos(angle + arrowAngle),
                                arrowY - arrowLength * Math.sin(angle + arrowAngle),
                            ];

                            const handleEdgeContextMenu = (e: any) => {
                                e.evt.preventDefault();
                                setVertices((prev) =>
                                    prev.map((vv) => {
                                        if (vv.id === v.id) {
                                            return { ...vv, links: vv.links.filter((id) => id !== l) };
                                        }
                                        if (vv.id === l) {
                                            return {
                                                ...vv,
                                                links: vv.links.includes(v.id) ? vv.links : [...vv.links, v.id],
                                            };
                                        }
                                        return vv;
                                    })
                                );
                            };

                            const handleEdgeClick = (e: any) => {
                                e.cancelBubble = true;
                                setSelectedEdge([v.id, l]);
                            };

                            return (
                                <React.Fragment key={`${v.id}-${l}`}>
                                    <Line
                                        points={[v.x, v.y, target.x, target.y]}
                                        stroke="#aaa"
                                        strokeWidth={5}
                                        onContextMenu={handleEdgeContextMenu}
                                        onClick={handleEdgeClick}
                                    />
                                    <Line
                                        points={arrowPoints}
                                        closed
                                        fill="#aaa"
                                        stroke="#aaa"
                                        onContextMenu={handleEdgeContextMenu}
                                        onClick={handleEdgeClick}
                                    />
                                </React.Fragment>
                            );
                        })
                    )}




                    {/* Vertices */}
                    {vertices.map((v) => (
                        <Group key={v.id}>
                            <Circle
                                x={v.x}
                                y={v.y}
                                radius={10}
                                fill={selectedVertix === v.id ? "#4444FF" : "#00004F"}
                                draggable
                                onClick={(e) => {
                                    e.cancelBubble = true;
                                    if (!selectedVertix) setSelectedVertix(v.id);
                                    else {
                                        toggleLink(selectedVertix, v.id);
                                        setSelectedVertix(null);
                                    }
                                }}
                                onDblClick={(e) => {
                                    e.cancelBubble = true;
                                    deleteVertex(v.id);
                                }}
                                onDragEnd={(e) => {
                                    const snapped = snapToGrid(e.target.x(), e.target.y());
                                    e.target.position(snapped); // Force visual update

                                    setVertices((prev) =>
                                        prev.map((vv) =>
                                            vv.id === v.id ? { ...vv, ...snapped } : vv
                                        )
                                    );
                                }}
                            />
                            <Text x={v.x + 10} y={v.y - 10} text={v.id} fontSize={12} fill="#333" />
                        </Group>
                    ))}
                </Layer>
            </Stage>
            <p className="text-sm text-gray-500 my-2">
                Click to add. Click two vertices to connect. Double-click vertix to remove. Drag vertix to move. Right-click and drag to move all.
            </p>
        </div>
    );
}
