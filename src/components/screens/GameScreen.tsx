import { ReactNode, useEffect, useRef, useState } from 'react';
import { GameConfiguration } from '../../engine/game-configuration/game-configuration';
import { GameEngine } from '../../engine/game-engine';
import { useEndOfBonusPointsEventListener, useEndOfScoreAnimationsEventListener } from '../../events/events';
import { BoardComponent } from '../BoardComponent';
import { HeaderComponent } from '../HeaderComponent';
import { HiddenCardsHandComponent } from '../hands/HiddenCardsHandComponent';
import { VisibleCardsHandComponent } from '../hands/VisibleCardsHandComponent';
import { ScoreAnimationCoordinator } from '../score/ScoreAnimationCoordinator';
import './GameScreen.scss';
import { GameConfigurationValidator } from '../../engine/game-configuration/game-configuration-validator';
import { GameAnnouncementModal } from '../GameAnnouncementModal';

export type GameFinished = {
    scores: Record<string, number>;
    finished: boolean;
}

type GameScreenProps = {
    gameConfiguration: GameConfiguration;
    onGameFinished: (result: GameFinished) => void;
};

export const GameScreen = (props: GameScreenProps): ReactNode => {

    useEffect(() => {
        if (gameEngine.current?.start()) {
            iterate()
        }
    }, [])
    const visibleHandPlayerIndex = props.gameConfiguration.players
        .findIndex(player => player.id === props.gameConfiguration.visibleHandPlayerId)
    const visiblePlayerComponent = visibleHandPlayerIndex !== -1 ? <VisibleCardsHandComponent turnOrder={visibleHandPlayerIndex}
        player={props.gameConfiguration.players[visibleHandPlayerIndex]} /> : <></>;

    const hiddenPlayers = props.gameConfiguration.players
        .map((player, index) => {
            if (player.id === props.gameConfiguration.visibleHandPlayerId) {
                return null;
            }
            return <HiddenCardsHandComponent key={player.id} turnOrder={index} player={player}></HiddenCardsHandComponent>;
        }).filter((player) => player !== null);

    const gameEngine = useRef<GameEngine>(null);
    const scoreAnimationCoordinator = useRef<ScoreAnimationCoordinator>(null);
    const [classes] = useState<string[]>(['game-screen', 'w-100', 'h-100', 'row', 'g-0'])

    if (gameEngine.current === null) {
        const validation = new GameConfigurationValidator(props.gameConfiguration).validate()
        if (!validation.valid) {
            throw Error(
                `Game configuration is not valid. Please check the game configuration. ${validation.errors.join('\n')}`
            )
        }
        gameEngine.current = new GameEngine(props.gameConfiguration);
        scoreAnimationCoordinator.current = new ScoreAnimationCoordinator(props.gameConfiguration);
    }

    gameEngine.current?.createHooks();
    scoreAnimationCoordinator.current?.createHooks();


    const iterate = async () => {
        if (gameEngine.current!.isGameOver()) {
            gameEngine.current!.calculateEndGameBonusPoints();
        } else {
            await gameEngine.current!.playNextRound();
        }
    }

    useEndOfBonusPointsEventListener(() => {
        console.log('End of bonus points');
        onGameFinished({
            scores: gameEngine.current!.getScores(),
            finished: true
        })
    })

    useEndOfScoreAnimationsEventListener(() => {
        iterate()
    })

    const onGameFinished = (result: GameFinished) => {
        gameEngine.current?.finish()
        gameEngine.current = null
        console.log('GameScreen unmounted');
        props.onGameFinished(result)
    }

    return (
        <>
            <div className={classes.join(' ')}>
                <div className='col-12 w-100'>
                    <HeaderComponent gameConfiguration={props.gameConfiguration} onQuit={() => onGameFinished({
                        scores: {},
                        finished: false
                    })}></HeaderComponent>
                </div>
                <div className='col-12 col-sm-6 col-md-12 d-flex align-content-between align-content-sm-center align-content-md-between justify-content-center'
                    style={{ flexWrap: 'wrap', alignContent: 'normal' }}>
                    <div className='w-100 d-flex d-sm-none d-md-flex align-items-center' style={{ justifyContent: 'left' }}>
                        {hiddenPlayers.map((aiHand, index) => <div key={`ai-hand-${index}`} className='w-100'>{aiHand}</div>)}
                    </div>
                    <div className='game-screen-board'>
                        <BoardComponent board={props.gameConfiguration.board} />
                    </div>
                    <div className='w-100 mb-5 d-sm-none d-md-block'>
                        {visiblePlayerComponent}
                    </div>
                </div>
                <div className='col-6 d-none d-sm-flex d-md-none' style={{ flexWrap: 'wrap', alignContent: 'normal' }}>
                    <div className='w-100 d-flex align-items-center' style={{ justifyContent: 'space-left' }}>
                        {hiddenPlayers}
                    </div>
                    <div className='w-100 mb-2'>
                        {visiblePlayerComponent}
                    </div>
                </div>
            </div>
            <GameAnnouncementModal />
        </>
    )
}


