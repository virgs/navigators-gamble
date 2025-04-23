import { ReactNode, useEffect, useRef, useState } from 'react'
import { GameConfiguration } from '../../engine/game-configuration/game-configuration'
import { GameConfigurationValidator } from '../../engine/game-configuration/game-configuration-validator'
import { PlayerType } from '../../engine/game-configuration/player-type'
import { GameEngine } from '../../engine/game-engine'
import { useEndOfBonusPointsEventListener, useEndOfScoreAnimationsEventListener } from '../../events/events'
import { BrowserDb, MatchStats } from '../../repository/browser-db'
import { BoardComponent } from '../BoardComponent'
import { GameAnnouncementModal } from '../GameAnnouncementModal'
import { HiddenCardsHandComponent } from '../hands/HiddenCardsHandComponent'
import { VisibleCardsHandComponent } from '../hands/VisibleCardsHandComponent'
import { ScoreAnimationCoordinator } from '../score/ScoreAnimationCoordinator'
import './GameScreen.scss'

type GameScreenProps = {
    gameConfiguration: GameConfiguration
    onGameFinished: (result: MatchStats) => void
}

export const GameScreen = (props: GameScreenProps): ReactNode => {
    useEffect(() => {
        if (gameEngine.current?.start()) {
            console.log('GameScreen started')
            iterate()
        }
    }, [])
    const visibleHandPlayerIndex = props.gameConfiguration?.players.findIndex(
        (player) => player.id === props.gameConfiguration.visibleHandPlayerId
    )
    const visiblePlayerComponent =
        visibleHandPlayerIndex !== -1 ? (
            <VisibleCardsHandComponent
                turnOrder={visibleHandPlayerIndex}
                player={props.gameConfiguration?.players[visibleHandPlayerIndex]}
            />
        ) : (
            <></>
        )

    const hiddenPlayers = props.gameConfiguration?.players
        .map((player, index) => {
            if (player.id === props.gameConfiguration.visibleHandPlayerId) {
                return null
            }
            return (
                <HiddenCardsHandComponent key={player.id} turnOrder={index} player={player}></HiddenCardsHandComponent>
            )
        })
        .filter((player) => player !== null)

    const gameEngine = useRef<GameEngine>(null)
    const scoreAnimationCoordinator = useRef<ScoreAnimationCoordinator>(null)
    const [classes] = useState<string[]>(['w-100', 'h-100', 'row', 'g-0', 'game-arena-container'])

    if (gameEngine.current === null) {
        console.log('Instantiating game engine')
        const validation = new GameConfigurationValidator(props.gameConfiguration).validate()
        if (!validation.valid) {
            throw Error(
                `Game configuration is not valid. Please check the game configuration. ${validation.errors.join('\n')}`
            )
        }
        gameEngine.current = new GameEngine(props.gameConfiguration)
        scoreAnimationCoordinator.current = new ScoreAnimationCoordinator(props.gameConfiguration)
    }

    gameEngine.current?.createHooks()
    scoreAnimationCoordinator.current?.createHooks()

    const iterate = async () => {
        if (gameEngine.current!.isGameOver()) {
            gameEngine.current!.calculateEndGameBonusPoints()
        } else {
            await gameEngine.current!.playNextRound()
        }
    }

    useEndOfBonusPointsEventListener(() => {
        console.log('End of bonus points')
        const result = gameEngine.current!.getScores()
        const humanId = props.gameConfiguration?.players.find((player) => player.type === PlayerType.HUMAN)?.id
        const humanScore = result[humanId!]
        const someOpponentBeatsHumanScore = Object.entries(result).some(
            ([key, value]) => key !== humanId && value > humanScore
        )
        const someOpponentTiesHumanScore = Object.entries(result).some(
            ([key, value]) => key !== humanId && value === humanScore
        )
        const stats: MatchStats = {
            defeat: someOpponentBeatsHumanScore,
            draw: someOpponentTiesHumanScore,
            victory: !someOpponentBeatsHumanScore && !someOpponentTiesHumanScore,
            levelConfiguration: props.gameConfiguration,
            levelHash: BrowserDb.getLevelHash(props.gameConfiguration),
            timestamp: Date.now(),
        }
        onGameFinished(stats)
    })

    useEndOfScoreAnimationsEventListener(() => {
        iterate()
    })

    const onGameFinished = (result: MatchStats) => {
        gameEngine.current?.finish()
        gameEngine.current = null
        console.log('GameScreen unmounted')
        props.onGameFinished(result)
    }

    return (
        <>
            <div className={classes.join(' ')}>
                <div
                    className="col-12 col-sm-7 col-lg-12 d-flex align-content-between align-content-sm-center align-content-lg-between justify-content-center"
                    style={{ flexWrap: 'wrap', alignContent: 'normal', overflowX: 'hidden' }}
                >
                    <div
                        className="w-100 d-flex d-sm-none d-lg-flex align-items-center"
                        style={{ justifyContent: 'left' }}
                    >
                        {hiddenPlayers.map((aiHand, index) => (
                            <div key={`ai-hand-${index}`} className="w-100">
                                {aiHand}
                            </div>
                        ))}
                    </div>
                    <div className="game-screen-board">
                        <BoardComponent board={props.gameConfiguration.board} />
                    </div>
                    <div className="w-100 mb-2 mb-lg-5 d-sm-none d-lg-block">{visiblePlayerComponent}</div>
                </div>
                <div className="col-5 d-none d-sm-flex d-lg-none" style={{ flexWrap: 'wrap', alignContent: 'normal' }}>
                    <div className="w-100 d-flex align-items-center" style={{ justifyContent: 'space-left' }}>
                        {hiddenPlayers}
                    </div>
                    <div className="w-100 mb-2">{visiblePlayerComponent}</div>
                </div>
            </div>
            <GameAnnouncementModal />
        </>
    )
}
