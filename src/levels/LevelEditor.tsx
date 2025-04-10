import React, { useState } from "react";
import { Stage, Layer, Circle, Line, Text, Group } from "react-konva";
import { AiAlgorithmType } from "../ai/algorithms/ai-algorithm-type";
import { PlayerType } from "../engine/game-configuration/player-type";

interface Vertex {
    id: string;
    x: number;
    y: number;
    links: string[];
}

const MAX_VERTICES = 40;

export default function LevelEditor() {
    const [vertices, setVertices] = useState<Vertex[]>([]);
    const [selected, setSelected] = useState<string | null>(null);
    const [cardsPerPlayer, setCardsPerPlayer] = useState(4);
    const [cardsPerDirection, setCardsPerDirection] = useState(3);
    const [iterations, setIterations] = useState(300);

    const addVertex = (x: number, y: number) => {
        if (vertices.length >= MAX_VERTICES) return;
        const id = `v${vertices.length + 1}`;
        setVertices([...vertices, { id, x, y, links: [] }]);
    };

    const deleteVertex = (id: string) => {
        setVertices((prev) =>
            prev
                .filter((v) => v.id !== id)
                .map((v) => ({ ...v, links: v.links.filter((l) => l !== id) }))
        );
        setSelected(null);
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
                // if (vertix.id === id2) {
                //     return {
                //         ...vertix,
                //         links: vertix.links.includes(id1)
                //             ? vertix.links.filter((l) => l !== id1)
                //             : [...vertix.links, id1],
                //     };
                // }
                return vertix;
            })
        );
    };

    const handleClick = (e: any) => {
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        if (pointer) addVertex(pointer.x, pointer.y);
    };

    const importLevel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const json = JSON.parse(reader.result as string);
            setCardsPerPlayer(json.cardsPerPlayer);
            setCardsPerDirection(json.cardsPerDirection);
            setIterations(json.iterationsPerAlternative);
            setVertices(
                json.vertices.map((v: any) => ({
                    id: v.id,
                    x: v.position.x * 600,
                    y: v.position.y * 600,
                    links: v.linkedVertices,
                }))
            );
        };
        reader.readAsText(file);
    };

    const exportLevel = () => {
        const simplified = vertices.map(({ id, x, y, links }) => ({
            id,
            position: { x: parseFloat((x / 600).toFixed(3)), y: parseFloat((y / 600).toFixed(3)) },
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
        <div className="p-4 space-y-4">
            <div className="flex gap-4 items-center flex-wrap">
                <div>
                    <label>cardsPerPlayer:</label>
                    <input
                        type="number"
                        value={cardsPerPlayer}
                        onChange={(e) => setCardsPerPlayer(Number(e.target.value))}
                        className="border px-2 py-1 w-16"
                    />
                </div>
                <label>cardsPerDirection:</label>
                <input
                    type="number"
                    value={cardsPerDirection}
                    onChange={(e) => setCardsPerDirection(Number(e.target.value))}
                    className="border px-2 py-1 w-16"
                />
                <div>
                    <label>iterationsPerAlternative:</label>
                    <input
                        type="number"
                        value={iterations}
                        onChange={(e) => setIterations(Number(e.target.value))}
                        className="border px-2 py-1 w-20"
                    />
                </div>
                <div>
                    <button onClick={exportLevel} className="bg-blue-600 text-white px-4 py-2 rounded">
                        Export JSON
                    </button>
                    <label className="ml-4">
                        Import JSON:
                        <input type="file" accept="application/json" onChange={importLevel} className="ml-2" />
                    </label>
                </div>
            </div>

            <Stage width={600} height={600} onClick={handleClick} className="border border-gray-300"
                style={{ backgroundColor: 'var(--compass-tertiary)', justifyItems: 'center', alignItems: 'center' }}>
                <Layer>
                    {vertices.map((v) =>
                        v.links.map((l) => {
                            const target = vertices.find((vv) => vv.id === l);
                            if (!target) return null;
                            return (
                                <Line
                                    key={`${v.id}-${l}`}
                                    points={[v.x, v.y, target.x, target.y]}
                                    stroke="#aaa"
                                    strokeWidth={2}
                                />
                            );
                        })
                    )}
                    {vertices.map((v) => (
                        <Group key={v.id}>
                            <Circle
                                // key={v.id}
                                x={v.x}
                                y={v.y}
                                radius={10}
                                fill={selected === v.id ? "#0cf" : "#09f"}
                                draggable
                                onClick={(e) => {
                                    e.cancelBubble = true;
                                    if (!selected) setSelected(v.id);
                                    else {
                                        toggleLink(selected, v.id);
                                        setSelected(null);
                                    }
                                }}
                                onDblClick={(e) => {
                                    e.cancelBubble = true;
                                    deleteVertex(v.id);
                                }}
                                onDragEnd={(e) => {
                                    const { x, y } = e.target.position();
                                    setVertices((prev) =>
                                        prev.map((vv) =>
                                            vv.id === v.id ? { ...vv, x, y } : vv
                                        )
                                    );
                                }}
                            />
                            <Text x={v.x + 10} y={v.y - 10} text={v.id} fontSize={12} fill="#333" />
                        </Group>
                    ))}
                </Layer>
            </Stage>
            <p className="text-sm text-gray-500">Tip: Click to add, click two vertices to connect, double-click to remove. Drag to move. Maximum {MAX_VERTICES} vertices.</p>
        </div>
    );
}
