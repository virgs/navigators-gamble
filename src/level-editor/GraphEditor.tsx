import React, { useEffect, useState } from 'react'
import { Circle, Group, Layer, Line, Shape, Stage, Text } from 'react-konva'
import { SerializableVertix } from '../engine/board/serializable-board'
import { generateUID } from '../math/generate-id'
import { Point, add, multiplyByScalar, normalize, rotate90degreesCCW, subtract } from '../math/point'
import './GraphEditor.scss'
import { LevelEditorInstructionsModal } from './LevelEditorInstructionsModal'

interface LevelEditorVertix {
    id: string
    x: number
    y: number
    links: string[]
}

type GraphEditorProps = {
    vertices: SerializableVertix[]
    onChange: (vertices: SerializableVertix[]) => void
    gridLines: number
    canvasSize: number
}

const vertixRadius = 10
const edgeWidth = 5

export default function GraphEditor(props: GraphEditorProps) {
    const [showInstructions, setShowInstructions] = useState<boolean>(false)
    const [vertices, setVertices] = useState<LevelEditorVertix[]>([])
    const [stageDragInit, setStageDragInit] = useState<Point | undefined>(undefined)
    const [selectedVertix, setSelectedVertix] = useState<string | null>(null)
    const [selectedEdge, setSelectedEdge] = useState<string[] | null>(null)

    const snapAllVertices = (verts: LevelEditorVertix[]) => {
        return verts.map((v) => {
            const { x, y } = snapToGrid(v.x, v.y)
            return { ...v, x, y }
        })
    }

    useEffect(() => {
        setVertices(
            snapAllVertices(
                props.vertices.map((v) => ({
                    id: v.id,
                    x: v.position.x * props.canvasSize,
                    y: v.position.y * props.canvasSize,
                    links: v.linkedVertices,
                }))
            )
        )
    }, [props.vertices])

    useEffect(() => {
        props.onChange(
            snapAllVertices(vertices).map((v) => ({
                id: v.id,
                position: {
                    x: v.x / props.canvasSize,
                    y: v.y / props.canvasSize,
                },
                linkedVertices: v.links,
            }))
        )
    }, [vertices])

    const cellSize = props.canvasSize / (props.gridLines - 1)
    const snapToGrid = (x: number, y: number) => {
        return {
            x: (Math.floor(x / cellSize) + 0.5) * cellSize,
            y: (Math.floor(y / cellSize) + 0.5) * cellSize,
        }
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedVertix) {
                    // Deletes vertices
                    setVertices((prev) =>
                        prev
                            .filter((v) => v.id !== selectedVertix)
                            .map((v) => ({ ...v, links: v.links.filter((l) => l !== selectedVertix) }))
                    )
                    setSelectedVertix(null)
                } else if (selectedEdge) {
                    // Deletes edges
                    const [from, to] = selectedEdge
                    setVertices((prev) =>
                        prev.map((v) => (v.id === from ? { ...v, links: v.links.filter((id) => id !== to) } : v))
                    )
                    setSelectedEdge(null)
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedVertix, selectedEdge])

    const addVertix = (x: number, y: number) => {
        const id = `v${generateUID()}`
        const { x: sx, y: sy } = snapToGrid(x, y)
        const vertixAtPosition = vertices.find((v) => v.x === sx && v.y === sy)
        if (vertixAtPosition) {
            setSelectedVertix(vertixAtPosition.id)
            setSelectedEdge(null)
        } else {
            setVertices([...vertices, { id, x: sx, y: sy, links: [] }])
            setSelectedVertix(id)
        }
    }

    const handleClick = (e: MouseEvent) => {
        if (e.button === 0) {
            const pointer = {
                x: e.layerX,
                y: e.layerY,
            }
            if (pointer) {
                addVertix(pointer.x, pointer.y)
            }
        }
    }
    const deleteVertix = (id: string) => {
        setVertices((prev) =>
            prev.filter((v) => v.id !== id).map((v) => ({ ...v, links: v.links.filter((l) => l !== id) }))
        )
        setSelectedVertix(null)
    }

    const toggleLink = (id1: string, id2: string) => {
        if (id1 === id2) return
        setSelectedVertix(id2)
        if (
            vertices.find((v) => v.id === id1)?.links.includes(id2) ||
            vertices.find((v) => v.id === id2)?.links.includes(id1)
        ) {
            return
        }

        setVertices((vertices) =>
            vertices.map((vertix) => {
                if (vertix.id === id1) {
                    return {
                        ...vertix,
                        links: vertix.links.includes(id2)
                            ? vertix.links.filter((l) => l !== id2)
                            : [...vertix.links, id2],
                    }
                }
                return vertix
            })
        )
    }

    const handleEdgeContextMenu = (e: any, v: LevelEditorVertix, l: string) => {
        e.evt.preventDefault()
        e.cancelBubble = true // Prevent event propagation
        setVertices((prev) =>
            prev.map((vv) => {
                if (vv.id === v.id) {
                    return { ...vv, links: vv.links.filter((id) => id !== l) }
                }
                if (vv.id === l) {
                    return {
                        ...vv,
                        links: vv.links.includes(v.id) ? vv.links : [...vv.links, v.id],
                    }
                }
                return vv
            })
        )
    }

    const handleEdgeClick = (e: any, v: LevelEditorVertix, l: string) => {
        e.cancelBubble = true // Prevent event propagation
        if (selectedVertix) {
            // Create a new edge between the selected vertex and the clicked edge's vertices
            toggleLink(selectedVertix, v.id)
            toggleLink(selectedVertix, l)
            setSelectedVertix(null)
        } else {
            // Select the edge
            setSelectedEdge([v.id, l])
        }
    }

    return (
        <>
            <Stage
                width={props.canvasSize}
                height={props.canvasSize}
                onContextMenu={(e) => e.evt.preventDefault()}
                perfectDrawEnabled={false}
                onMouseDown={(e) => {
                    if (e.evt.button === 2) {
                        setSelectedEdge(null)
                        setSelectedVertix(null)
                        const stage = e.target.getStage()!
                        const pointer = stage.getPointerPosition()!
                        setStageDragInit({ x: pointer.x, y: pointer.y })
                    }
                }}
                onMouseMove={(e) => {
                    if (e.evt.buttons === 2 && stageDragInit) {
                        const stage = e.target.getStage()!
                        const pointer = stage.getPointerPosition()!
                        const dx = pointer.x - stageDragInit.x
                        const dy = pointer.y - stageDragInit.y
                        setStageDragInit(pointer)
                        setVertices((prev) => prev.map((v) => ({ ...v, x: v.x + dx, y: v.y + dy })))
                    }
                }}
                onMouseUp={() => {
                    setVertices((prev) => snapAllVertices(prev.map((v) => ({ ...v, x: v.x, y: v.y }))))
                    setStageDragInit(undefined)
                }}
                onClick={(e) => handleClick(e.evt)}
                className="grapheditor-container"
            >
                <Layer>
                    {/* Grid lines */}
                    {[...Array(props.gridLines)].map((_, i) => {
                        const pos = (props.canvasSize / (props.gridLines - 1)) * i
                        return (
                            <React.Fragment key={i}>
                                <Line
                                    key={`h-${i}`}
                                    points={[0, pos, props.canvasSize, pos]}
                                    stroke="var(--compass-primary)"
                                    opacity={0.5}
                                    strokeWidth={1}
                                />
                                <Line
                                    key={`v-${i}`}
                                    points={[pos, 0, pos, props.canvasSize]}
                                    stroke="var(--compass-primary)"
                                    opacity={0.5}
                                    strokeWidth={1}
                                />
                            </React.Fragment>
                        )
                    })}

                    {/* Edges */}
                    {vertices.map((v) =>
                        v.links.map((l) => {
                            const target = vertices.find((vv) => vv.id === l)
                            if (!target) return null

                            const isSelected = () => {
                                if (selectedEdge === null) return false
                                return (
                                    (selectedEdge[0] === v.id && selectedEdge[1] === l) ||
                                    (selectedEdge[0] === l && selectedEdge[1] === v.id)
                                )
                            }

                            const middle = multiplyByScalar(add(target, v), 0.5) // Calculate the midpoint of the edge

                            return (
                                <React.Fragment key={`${v.id}-${l}`}>
                                    <Shape
                                        perfectDrawEnabled={false}
                                        sceneFunc={(ctx, shape) => {
                                            ctx.beginPath()
                                            ctx.moveTo(v.x, v.y)
                                            const direction = rotate90degreesCCW(
                                                multiplyByScalar(normalize(subtract(target, v)), cellSize / 2)
                                            )
                                            const anchor = add(middle, direction)

                                            ctx.bezierCurveTo(
                                                anchor.x,
                                                anchor.y,
                                                anchor.x,
                                                anchor.y,
                                                target.x,
                                                target.y
                                            )
                                            ctx.fillStrokeShape(shape)
                                        }}
                                        strokeWidth={edgeWidth}
                                        closed
                                        stroke={isSelected() ? '#4444FF' : '#00004F'}
                                        onContextMenu={(e) => handleEdgeContextMenu(e, v, l)}
                                        onClick={(e) => handleEdgeClick(e, v, l)}
                                    />
                                </React.Fragment>
                            )
                        })
                    )}

                    {/* Vertices */}
                    {vertices.map((v) => (
                        <Group key={v.id}>
                            <Circle
                                x={v.x}
                                y={v.y}
                                radius={vertixRadius}
                                name={v.id}
                                fill={selectedVertix === v.id ? '#4444FF' : '#00004F'}
                                draggable
                                onClick={(e) => {
                                    e.cancelBubble = true
                                    setSelectedEdge(null)
                                    if (!selectedVertix) setSelectedVertix(v.id)
                                    else {
                                        setSelectedVertix(null)
                                        toggleLink(selectedVertix, v.id)
                                    }
                                }}
                                onDblClick={(e) => {
                                    e.cancelBubble = true
                                    deleteVertix(v.id)
                                }}
                                onDragEnd={(e) => {
                                    const snapped = snapToGrid(e.target.x(), e.target.y())
                                    e.target.position(snapped) // Force visual update
                                    setVertices((prev) =>
                                        prev.map((vv) => (vv.id === v.id ? { ...vv, ...snapped } : vv))
                                    )
                                }}
                            />
                            {/* Vertex ID */}
                            <Text x={v.x - 10} y={v.y - 25} text={v.id} fontSize={12} fill="black" />
                        </Group>
                    ))}
                </Layer>
            </Stage>
            <div style={{ textAlign: 'end' }}>
                <i
                    className="bi bi-info-circle-fill"
                    onClick={() => setShowInstructions(true)}
                    style={{
                        color: 'var(--bs-warning)',
                        cursor: 'pointer',
                        textShadow: '1px 1px 1px var(--compass-black)',
                    }}
                />
            </div>
            <LevelEditorInstructionsModal show={showInstructions} onHide={() => setShowInstructions(false)} />
        </>
    )
}
