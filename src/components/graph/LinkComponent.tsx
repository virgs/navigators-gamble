import { ReactNode, useEffect, useState } from 'react';
import { AudioController } from '../../audio/audio-controller';
import { colors } from '../../constants/colors';
import { SerializableVertix } from '../../engine/board/serializable-board';
import { useFinishVerticesAnimationsCommandListener, useLinkAnimationCommandListener } from '../../events/events';
import { add, multiplyByScalar, normalize, Point, rotate90degreesCCW, subtract } from '../../math/point';
import "./LinkComponent.scss";

export type LinkComponentProps = {
    first: SerializableVertix,
    second: SerializableVertix,
    boardWidth: number,
};

export const LinkComponent = (props: LinkComponentProps): ReactNode => {
    const calculatePath = (first: Point, second: Point, width: number): string => {
        const origin = multiplyByScalar(first, width);
        const target = multiplyByScalar(second, width);

        const direction = rotate90degreesCCW(multiplyByScalar(normalize(subtract(target, origin)), props.boardWidth * .05));
        const middle = multiplyByScalar(add(target, origin), .5);
        const anchor = add(middle, direction);

        const result = `M ${origin.x} ${origin.y} C ${anchor
            .x} ${anchor.y}, ${anchor
                .x} ${anchor.y}, ${target.x} ${target.y}`
        console.log(props.boardWidth, result)
        return result

    }
    const calculateMiddle = (first: Point, second: Point, width: number): Point => {
        const origin = multiplyByScalar(first, width);
        const target = multiplyByScalar(second, width);

        const direction = rotate90degreesCCW(multiplyByScalar(normalize(subtract(target, origin)), props.boardWidth * .05));
        const middle = multiplyByScalar(add(target, origin), .5);
        const anchor = add(middle, multiplyByScalar(direction, .8));
        return anchor
    }

    const [classes, setClasses] = useState<string[]>(['link show']);
    const [color, setColor] = useState<string>('var(--compass-highlight-red)')
    const [middle, setMiddle] = useState<Point>(calculateMiddle(props.first.position, props.second.position, props.boardWidth));
    const [path, setPath] = useState<string>(calculatePath(props.first.position, props.second.position, props.boardWidth));

    useEffect(() => {
        const newPath = calculatePath(props.first.position, props.second.position, props.boardWidth);
        if (newPath !== path) {
            setPath(newPath);
        }
        const newMiddle = calculateMiddle(props.first.position, props.second.position, props.boardWidth);
        if (newMiddle.x !== middle.x || newMiddle.y !== middle.y) {
            setMiddle(newMiddle);
        }
    }, [props.first.position, props.second.position, props.boardWidth]);

    useLinkAnimationCommandListener(payload => {
        if ((payload.first.id === props.first.id && payload.second.id === props.second.id) ||
            (payload.second.id === props.first.id && payload.first.id === props.second.id)) {
            setColor(colors[payload.playerTurnOrder])
            setClasses(list => list.concat(payload.score.scoreType.toLowerCase()).concat('scoring'));
            AudioController.playScoreSound()
        }
    })

    useFinishVerticesAnimationsCommandListener(() => {
        setClasses(list => list.filter(item => item !== 'scoring'));
    })

    return <>
        {props.boardWidth !== undefined && <>
            <path
                d={path}
                stroke={color}
                className={classes.join(' ')}
            />
            <circle cx={middle.x} cy={middle.y} r="5" /></>
        }

    </>
}

