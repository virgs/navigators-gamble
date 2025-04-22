import { useWindowSize } from '@uidotdev/usehooks'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { SerializabledBoard, SerializableVertix } from '../engine/board/serializable-board'
import './BoardComponent.scss'
import { LinkComponent, LinkComponentProps } from './graph/LinkComponent'
import { VertixComponent } from './graph/VertixComponent'
import { Point } from 'framer-motion'
import { multiplyByScalar } from '../math/point'

type BoardComponentProps = {
    board: SerializabledBoard
}

//https://stackoverflow.com/a/28985475
export const BoardComponent = (props: BoardComponentProps): ReactNode => {
    const size = useWindowSize()

    const svgRef = useRef(null)
    //@ts-expect-error
    const [boardWidth, setBoardWidth] = useState<number>(svgRef.current?.clientWidth)

    useEffect(() => {
        if (svgRef.current) {
            //@ts-expect-error
            setBoardWidth(svgRef.current.clientWidth)
        }
    }, [])

    useEffect(() => {
        setTimeout(() => {
            if (svgRef.current) {
                //@ts-expect-error
                setBoardWidth(svgRef.current.clientWidth)
            }
        }, 5)
    }, [size])

    const getLinks = () => {
        const verticesMap = props.board.vertices.reduce(
            (acc, vertix) => {
                acc[vertix.id] = vertix
                return acc
            },
            {} as { [key: string]: SerializableVertix }
        )

        const links: { [linkId: string]: LinkComponentProps } = {}
        props.board.vertices.forEach((vertix) =>
            vertix.linkedVertices.forEach((linkedVertix) => {
                const linkId = `${vertix.id}-${linkedVertix}`
                return (links[linkId] ??= {
                    first: vertix,
                    second: verticesMap[linkedVertix],
                    convertToBoardDimensions: convertToBoardDimensions,
                })
            })
        )
        return Object.values(links)
    }

    const convertToBoardDimensions = (point: Point): Point => {
        if (boardWidth === undefined) {
            return point
        }
        return multiplyByScalar(point, boardWidth)
    }

    return (
        <div className="board-box show">
            <div className="board-square">
                <div className="board-content" style={{ overflow: 'hidden' }}>
                    <svg ref={svgRef} className="board-svg" style={{ width: '100%', height: '100%' }}>
                        {getLinks().map((link: LinkComponentProps, index: number) => (
                            <LinkComponent
                                key={index}
                                first={link.first}
                                second={link.second}
                                convertToBoardDimensions={link.convertToBoardDimensions}
                            />
                        ))}
                    </svg>
                    {props.board.vertices.map((vertix: SerializableVertix) => (
                        <VertixComponent
                            key={vertix.id}
                            convertToBoardDimensions={convertToBoardDimensions}
                            vertix={vertix}
                        ></VertixComponent>
                    ))}
                </div>
            </div>
        </div>
    )
}
