import { Gauge, gaugeClasses, useGaugeState } from '@mui/x-charts'
import { useWindowSize } from '@uidotdev/usehooks'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { Directions, directionToAngle, directions } from '../../engine/directions'
import './GaugeComponent.scss'
import { degreeToRadians } from '../../math/trigonometry'

export type GaugeComponentProps = {
    direction: Directions
}

const GaugePointer = (props: { angle: number }): ReactNode => {
    const { valueAngle, outerRadius, innerRadius, cx, cy } = useGaugeState()
    if (valueAngle === null) {
        // No value to display
        return null
    }
    const radians = degreeToRadians(props.angle)
    const target = {
        x: cx + (outerRadius + 2) * Math.sin(radians),
        y: cy - (outerRadius + 2) * Math.cos(radians),
    }
    return (
        <g className="needle-path">
            <circle cx={cx} cy={cy} r={Math.floor(innerRadius / 3)} />
            <path d={`M ${cx} ${cy} L ${target.x} ${target.y}`} />
        </g>
    )
}

const GaugeTicks = (): ReactNode => {
    const { outerRadius, innerRadius, cx, cy } = useGaugeState()
    const radiusDiff = outerRadius - innerRadius
    return directions.map((direction, index) => {
        const radians = degreeToRadians(directionToAngle(direction))
        const isMajorTick = index % 2 === 0
        const target = {
            x: cx + (outerRadius + radiusDiff / 4) * Math.sin(radians),
            y: cy - (outerRadius + radiusDiff / 4) * Math.cos(radians),
        }
        if (isMajorTick) {
        }
        const length = outerRadius - radiusDiff / (isMajorTick ? 1 : 3)
        const initial = {
            x: cx + length * Math.sin(radians),
            y: cy - length * Math.cos(radians),
        }
        return (
            <g key={Directions[direction]} className="tick-path">
                <path d={`M ${initial.x} ${initial.y} L ${target.x} ${target.y}`} />
            </g>
        )
    })
}

export const GaugeComponent = ({ direction }: GaugeComponentProps): ReactNode => {
    const [gaugeComponent, setGaugeComponent] = useState<ReactNode>(undefined)
    const cardContentRef = useRef(null)
    const size = useWindowSize()

    const angle = directionToAngle(direction)

    useEffect(() => {
        setGaugeComponent(
            <Gauge
                width={gaugeSize}
                height={gaugeSize}
                innerRadius="50%"
                outerRadius="85%"
                value={25}
                startAngle={-45 + angle}
                endAngle={360 + angle - 45}
                sx={() => ({
                    [`& .${gaugeClasses.valueText}`]: {
                        fontSize: '0',
                    },
                })}
            >
                <GaugePointer angle={angle} />
                <GaugeTicks></GaugeTicks>
            </Gauge>
        )
    }, [size])

    //@ts-expect-error
    const gaugeSize = cardContentRef.current?.clientWidth ?? 50

    return (
        <div ref={cardContentRef} className="gauge">
            {gaugeComponent}
        </div>
    )
}
