import { ReactNode, useState } from 'react';
import { AudioController } from '../../audio/audio-controller';
import { colors } from '../../constants/colors';
import { SerializableVertix } from '../../engine/board/serializable-board';
import { ScoreType } from '../../engine/score-calculator/score-type';
import { useFinishVerticesAnimationsCommandListener, useLinkAnimationCommandListener } from '../../events/events';
import { add, multiplyByScalar, normalize, Point, rotate90degreesCCW, subtract } from '../../math/point';
import "./LinkComponent.scss";

export type LinkComponentProps = {
    first: SerializableVertix,
    second: SerializableVertix,
    boardWidth: number,
};

const SQRT_2_HALF = Math.SQRT2 * .5;
const BOARD_SCALE = .05;

export const LinkComponent = (props: LinkComponentProps): ReactNode => {
    const [scoring, setScoring] = useState<string>('');
    const [scoreType, setScoreType] = useState<ScoreType | undefined>(undefined)
    const [color, setColor] = useState<string>('var(--compass-highlight-red)')

    useLinkAnimationCommandListener(payload => {
        if ((payload.first.id === props.first.id && payload.second.id === props.second.id) ||
            (payload.second.id === props.first.id && payload.first.id === props.second.id)) {
            setScoreType(payload.score.scoreType);
            setColor(colors[payload.playerTurnOrder])
            setScoring('scoring');
            AudioController.playScoreSound()
        }
    })

    useFinishVerticesAnimationsCommandListener(() => {
        if (scoring === 'scoring') {
            setScoring('');
        }
    })

    const drawBezierCurve = (middle: Point, normal: Point): ReactNode => {
        const first = props.first.position
        const second = props.second.position
        const width = props.boardWidth
        const origin = multiplyByScalar(first, width);
        const target = multiplyByScalar(second, width);
        const bezierAnchor = add(middle, multiplyByScalar(normal, props.boardWidth * BOARD_SCALE));
        const bezierPath = `M ${origin.x} ${origin.y} \
            C ${bezierAnchor.x} ${bezierAnchor.y}, \
            ${bezierAnchor.x} ${bezierAnchor.y}, \
            ${target.x} ${target.y}`;

        let classes: string = 'link show '.concat(scoring)
        if (scoreType === ScoreType.SEQUENCE) {
            classes += ' sequence'
        } else if (scoreType === ScoreType.PAIR) {
            classes += ' pair'
        } else if (scoreType === ScoreType.CANCEL) {
            classes += ' cancel'
        }

        return <path
            d={bezierPath}
            stroke={color}
            className={classes} />;
    }


    const drawPairCircle = (middleOnCurve: Point): ReactNode => {
        return <circle fill={color} stroke={color} className={'circle-pair '.concat(scoring)}
            cx={middleOnCurve.x} cy={middleOnCurve.y} />;
    }

    const drawCancelCross = (middleOnCurve: Point, normal: Point): ReactNode => {
        const antiNormal = multiplyByScalar(normal, -1)
        const perpendicular = rotate90degreesCCW(normal)
        const antiPerpendicular = multiplyByScalar(perpendicular, -1)
        const firstLine = {
            origin: add(middleOnCurve, multiplyByScalar(normal, 10)),
            target: add(middleOnCurve, multiplyByScalar(antiNormal, 10))
        }
        const secondLine = {
            origin: add(middleOnCurve, multiplyByScalar(perpendicular, 10)),
            target: add(middleOnCurve, multiplyByScalar(antiPerpendicular, 10))
        }
        return <g className={'cancel-cross '.concat(scoring)} stroke={color}>
            <line x1={firstLine.origin.x} y1={firstLine.origin.y} x2={firstLine.target.x} y2={firstLine.target.y} />
            <line x1={secondLine.origin.x} y1={secondLine.origin.y} x2={secondLine.target.x} y2={secondLine.target.y} />
        </g>
    }


    const render = (): ReactNode[] => {
        const components = []

        const first = props.first.position
        const second = props.second.position
        const width = props.boardWidth
        const origin = multiplyByScalar(first, width);
        const target = multiplyByScalar(second, width);
        const difference = subtract(target, origin);
        const middle = add(origin, multiplyByScalar(difference, .5));
        const normal = rotate90degreesCCW(normalize(difference));
        const middleOnCurve = add(middle, multiplyByScalar(normal, props.boardWidth * BOARD_SCALE * (SQRT_2_HALF + .05)));

        components.push(drawBezierCurve(middle, normal))
        if (scoreType === ScoreType.PAIR) {
            const circle = drawPairCircle(middleOnCurve)
            components.push(circle)
        } else if (scoreType === ScoreType.CANCEL) {
            components.push(drawCancelCross(middleOnCurve, normal))
        }
        return components

    }

    return <>
        {props.boardWidth !== undefined && <>
            {render().map((component, index) => {
                return <g key={index}>
                    {component}
                </g>
            }
            )}
        </>
        }

    </>
}

