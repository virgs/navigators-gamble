import { Reorder } from 'framer-motion'
import { ReactNode, useState } from 'react'
import { Card } from '../../engine/card'
import { GamePlayerCommonAttributes } from '../../engine/game-configuration/game-configuration'
import {
    PlayerMadeMoveEvent,
    useCardAddedToPlayerListener,
    useNewGameListener,
    usePlayerMadeMoveEventListener,
} from '../../events/events'
import { CardComponent } from '../card/CardComponent'
import { ScoreComponent } from '../score/ScoreComponent'
import './HiddenCardsHandComponent.scss'

type HiddenCardsHandComponentProps = {
    player: GamePlayerCommonAttributes
    turnOrder: number
}

export const HiddenCardsHandComponent = (props: HiddenCardsHandComponentProps): ReactNode => {
    const [cards, setCards] = useState<Card[]>([])

    useNewGameListener(() => setCards([]))

    usePlayerMadeMoveEventListener((event: PlayerMadeMoveEvent) => {
        if (event.playerId === props.player.id) {
            setCards(cards.filter((_, index) => index !== event.cardIndex))
        }
    })

    useCardAddedToPlayerListener((event) => {
        if (event.playerId === props.player.id) {
            setCards((prevCards) => [...prevCards, event.card])
        }
    })

    return (
        <div className="px-2 h-100">
            <ScoreComponent turnOrder={props.turnOrder} player={props.player}></ScoreComponent>
            <Reorder.Group
                className="d-flex p-0 m-0 align-items-start"
                values={cards}
                onReorder={setCards}
                axis="x"
                style={{ position: 'relative' }}
            >
                {cards.map((card) => {
                    return (
                        <Reorder.Item
                            key={card.id}
                            value={card}
                            className="d-flex justify-content-start"
                            style={{ width: '15%' }}
                            axis="" // do not allow drags
                            dragListener={false}
                        >
                            <div key={card.id} className="hidden-cards-hand-card">
                                <CardComponent card={card} selected={false}></CardComponent>
                            </div>
                        </Reorder.Item>
                    )
                })}
            </Reorder.Group>
        </div>
    )
}
