import { ReactNode, useState } from 'react';
import { SerializableVertix } from '../../engine/board/serializable-board';
import { useFinishVerticesAnimationsCommandListener, useLinkAnimationCommandListener } from '../../events/events';
import { getAngle, getDistance } from '../../math/point';
import "./LinkComponent.scss";
import { colors } from '../../constants/colors';
import { AudioController } from '../../audio/audio-controller';

export type LinkComponentProps = {
    first: SerializableVertix,
    second: SerializableVertix
};

export const LinkComponent = (props: LinkComponentProps): ReactNode => {
    const [classes, setClasses] = useState<string[]>(['link']);
    const length = getDistance(props.first.position, props.second.position)
    const inclination = getAngle(props.first.position, props.second.position)
    const [color, setColor] = useState<string>('var(--compass-highlight-red)')

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

    return <div
        data-link-id={`{${props.first.id}-${props.second.id}}`}
        className={classes.join(' ')}
        style={{
            top: `${props.first.position.y * 100}%`,
            left: `${props.first.position.x * 100}%`,
            width: `calc(${length} * 100%)`,
            transform: `rotate(${inclination}rad) translateY(-50%)`,
            borderTopColor: color,
        }}></div>
}
