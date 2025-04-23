import { ReactNode, useState } from 'react'
import { colors } from '../../constants/colors'
import { GamePlayerCommonAttributes } from '../../engine/game-configuration/game-configuration'
import { useFinishVerticesAnimationsCommandListener, usePlayerTurnChangedListener } from '../../events/events'
import { generateUID } from '../../math/generate-id'
import './ScoreComponent.scss'
import { ScoreIncrease } from './ScoreIncrease'

export const ScoreComponent = (props: { player: GamePlayerCommonAttributes; turnOrder: number }): ReactNode => {
    const color: string = props.turnOrder !== undefined ? colors[props.turnOrder] : 'yellow'

    const [score, setScore] = useState<number>(0)
    const [turn, setTurn] = useState<Boolean>(false)
    const [increaseEffectList, setIncreaseEffectList] = useState<{ id: string; value: number }[]>([])

    const animate = (points: number) => {
        setScore(score + points)
        setIncreaseEffectList((list) =>
            list.concat({
                id: generateUID(),
                value: points,
            })
        )
    }

    useFinishVerticesAnimationsCommandListener((payload) => {
        if (payload.playerId === props.player.id) {
            if (payload.playerId === props.player.id) {
                animate(payload.points)
            }
        }
    })

    usePlayerTurnChangedListener((payload) => {
        setTurn(payload.playerId === props.player.id)
    })

    const removeEffect = (id: string) => {
        setIncreaseEffectList((list) => list.filter((effect) => effect.id !== id))
    }

    return (
        <div className="score d-flex align-items-center mb-2" style={{ color: color, fontSize: '1.75rem' }}>
            <i className={'bi bi-coin mx-2'.concat(increaseEffectList.length > 0 ? ' flip' : '')}></i>
            {increaseEffectList.map((effect) => (
                <ScoreIncrease
                    key={effect.id}
                    id={effect.id}
                    increase={effect.value}
                    onDismiss={removeEffect}
                ></ScoreIncrease>
            ))}
            {score}
            <span className={"ms-1 turn-arrow ".concat(turn ? 'show' : '')} style={{ color: color }} >
                ⇐
            </span>
        </div>
    )
}
