import { Gauge, gaugeClasses, useGaugeState } from "@mui/x-charts";
import { ReactNode, useEffect, useState } from "react";
import { degreeToRadians } from "../math/trigonometry";

const wiggleRange = Math.PI / 24;

const GaugePointer = (props: { angle: number }): ReactNode => {
    const { valueAngle, outerRadius, cx, cy } = useGaugeState();
    if (valueAngle === null) {
        // No value to display
        return null;
    }

    useEffect(() => {
        setRadians(degreeToRadians(props.angle + 90 + 90 + 90))
    }, [props.angle]);

    const [radians, setRadians] = useState<number>(degreeToRadians(props.angle + 90 + 90 + 90))
    const [wiggle, setWiggle] = useState<number>(radians)

    useEffect(() => {
        const interval = setInterval(() => {
            setWiggle(radians + Math.random() * 2 * wiggleRange - wiggleRange);
        }, 100);
        return () => clearInterval(interval);
    })


    const target = {
        x: cx + (outerRadius + 2) * Math.sin(wiggle),
        y: cy - (outerRadius + 2) * Math.cos(wiggle),
    };
    return (
        <g className='needle-path' >
            <circle cx={cx} cy={cy} r={2} />
            <path stroke="var(--compass-black)" d={`M ${cx} ${cy} L ${target.x} ${target.y}`} />
        </g>
    );
}


export const DifficultyGauge = (props: {
    value: number
    maxValue: number
    minValue: number
}): ReactNode => {
    const { value, maxValue, minValue } = props
    const percentage = ((value - minValue) / (maxValue - minValue)) * 100
    return (
        <div className='difficulty-gauge'>
            <Gauge
                className="mx-auto"
                width={80}
                height={40}
                innerRadius="50%"
                outerRadius="85%"
                value={percentage}
                startAngle={-90}
                endAngle={90}
                sx={() => ({
                    [`& .${gaugeClasses.valueText}`]: {
                        fontSize: '0',
                    },
                    [`& .${gaugeClasses.valueArc}`]: {
                        fill: 'transparent',
                    },
                    [`& .${gaugeClasses.referenceArc}`]: {
                        fill: 'url(#gradient)',
                    },
                })}
            >
                <GaugePointer angle={180 * value} />
                <defs>
                    <linearGradient id="gradient">
                        <stop offset="0" stopColor="rgb(63, 166, 84)" />
                        <stop offset="50%" stopColor="rgb(235, 188, 33)" />
                        <stop offset="100%" stopColor="rgb(196, 19, 19)" />
                    </linearGradient>
                </defs>
            </Gauge>
        </div>
    );
}
