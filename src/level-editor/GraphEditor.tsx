import React, { useEffect, useState } from "react";
import { Circle, Group, Layer, Line, Stage, Text } from "react-konva";
import { SerializableVertix } from "../engine/board/serializable-board";
import { generateUID } from "../math/generate-id";
import { Point } from "../math/point";
import "./GraphEditor.scss";

interface LevelEditorVertix {
  id: string;
  x: number;
  y: number;
  links: string[];
}

type GraphEditorProps = {
  vertices: SerializableVertix[];
  onChange: (vertices: SerializableVertix[]) => void;
  gridLines: number;
  canvasSize: number;
}

export default function GraphEditor(props: GraphEditorProps) {

  const [vertices, setVertices] = useState<LevelEditorVertix[]>([]);
  const [stageDragInit, setStageDragInit] = useState<Point | undefined>(undefined);
  const [selectedVertix, setSelectedVertix] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string[] | null>(null);

  const snapAllVertices = (verts: LevelEditorVertix[]) => {
    return verts.map((v) => {
      const { x, y } = snapToGrid(v.x, v.y);
      return { ...v, x, y };
    });
  };

  useEffect(() => {
    setVertices(snapAllVertices(props.vertices
      .map((v) => ({
        id: v.id,
        x: v.position.x * props.canvasSize,
        y: v.position.y * props.canvasSize,
        links: v.linkedVertices,
      }))))
  }, [props.vertices]);

  useEffect(() => {
    props.onChange(snapAllVertices(vertices).map((v) => ({
      id: v.id,
      position: {
        x: v.x / props.canvasSize,
        y: v.y / props.canvasSize,
      },
      linkedVertices: v.links,
    })));
  }, [vertices]);

  const snapToGrid = (x: number, y: number) => {
    const cellSize = props.canvasSize / (props.gridLines - 1);
    return {
      x: Math.round(x / cellSize) * cellSize,
      y: Math.round(y / cellSize) * cellSize,
    };
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedVertix) {
          // Deletes vertices
          setVertices((prev) =>
            prev
              .filter((v) => v.id !== selectedVertix)
              .map((v) => ({ ...v, links: v.links.filter((l) => l !== selectedVertix) }))
          );
          setSelectedVertix(null);
        } else if (selectedEdge) {
          // Deletes edges
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

  const addVertex = (x: number, y: number) => {
    const id = `v${generateUID()}`;
    const { x: sx, y: sy } = snapToGrid(x, y);
    setVertices([...vertices, { id, x: sx, y: sy, links: [] }]);
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

  return (
    <><Stage
      width={props.canvasSize}
      height={props.canvasSize}
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
        {[...Array(props.gridLines)].map((_, i) => {
          const pos = (props.canvasSize / (props.gridLines - 1)) * i;
          return (
            <React.Fragment key={i}>
              <Line key={`h-${i}`} points={[0, pos, props.canvasSize, pos]} stroke="gray" opacity={0.5} strokeWidth={1} />
              <Line key={`v-${i}`} points={[pos, 0, pos, props.canvasSize]} stroke="gray" opacity={0.5} strokeWidth={1} />
            </React.Fragment>
          );
        })}

        {/* Edges */}
        {vertices.map((v) => v.links.map((l) => {
          const target = vertices.find((vv) => vv.id === l);
          if (!target) return null;

          const dx = target.x - v.x;
          const dy = target.y - v.y;
          const angle = Math.atan2(dy, dx);
          const arrowLength = 20;
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
            setVertices((prev) => prev.map((vv) => {
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
                onClick={handleEdgeClick} />
              <Line
                points={arrowPoints}
                closed
                fill="#aaa"
                stroke="#aaa"
                onContextMenu={handleEdgeContextMenu}
                onClick={handleEdgeClick} />
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
              radius={15}
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

                setVertices((prev) => prev.map((vv) => vv.id === v.id ? { ...vv, ...snapped } : vv
                )
                );
              }} />

          </Group>
        ))}
      </Layer>
    </Stage><p className="text-sm text-gray-500 my-2">
        Click to add vertix. Click two vertices to connect. Select and press 'delete' to remove. Drag vertix to move. Right-click and drag to move all. Right click on edge to invert it.
      </p></>

  );
}
