import { ReactNode, useEffect, useRef, useState } from 'react';
import { GameConfiguration } from '../../engine/game-configuration/game-configuration';
import { GameEngine } from '../../engine/game-engine';
import { useEndOfScoreAnimationsEventListener } from '../../events/events';
import { BoardComponent } from '../BoardComponent';
import { HeaderComponent } from '../HeaderComponent';
import { HiddenCardsHandComponent } from '../hands/HiddenCardsHandComponent';
import { VisibleCardsHandComponent } from '../hands/VisibleCardsHandComponent';
import { ScoreAnimationCoordinator } from './ScoreAnimationCoordinator';
import './GameScreen.scss';

export const GameScreen = (props: { gameConfiguration: GameConfiguration, onGameFinished: () => void }): ReactNode => {
    const gameEngine = useRef<GameEngine>(undefined);
    const scoreAnimationCoordinator = useRef<ScoreAnimationCoordinator>(undefined);
    const [classes] = useState<string[]>(['game-screen', 'w-100', 'h-100', 'row', 'g-0'])

    if (gameEngine.current === undefined) {
        console.log('GameScreen mounted');
        gameEngine.current = new GameEngine(props.gameConfiguration)
    }

    if (scoreAnimationCoordinator.current === undefined) {
        scoreAnimationCoordinator.current = new ScoreAnimationCoordinator(props.gameConfiguration);
    }

    useEffect(() => {
        gameEngine.current!.start()
        setTimeout(() => iterate(), 1000)
        return () => {
            gameEngine.current?.finish()
            gameEngine.current = undefined
            console.log('GameScreen unmounted');
        }
    }, [])

    const iterate = async () => {
        if (gameEngine.current!.isGameOver()) {
            console.log('Game finished');
            gameEngine.current!.calculateEndGameBonusPoints()
            setTimeout(() => onGameFinished(), 10000)
        } else {
            await gameEngine.current!.playNextRound()
        }
    }

    useEndOfScoreAnimationsEventListener(() => {
        iterate()
    })

    const onGameFinished = () => {
        setTimeout(() => props.onGameFinished(), 0)
    }

    const visibleHandPlayerIndex = props.gameConfiguration.players
        .findIndex(player => player.id === props.gameConfiguration.visibleHandPlayerId)
    const visiblePlayerComponent = visibleHandPlayerIndex !== -1 ? <VisibleCardsHandComponent turnOrder={visibleHandPlayerIndex}
        player={props.gameConfiguration.players[visibleHandPlayerIndex]} /> : <></>

    const hiddenPlayers: ReactNode[] = props.gameConfiguration.players
        .map((player, index) => {
            if (player.id === props.gameConfiguration.visibleHandPlayerId) {
                return <></>
            }
            return <HiddenCardsHandComponent key={player.id} turnOrder={index} player={player}></HiddenCardsHandComponent>;
        });

    return (
        <>
            <div className={classes.join(' ')}>
                <div className='col-12 col-sm-6 col-md-12 d-flex h-100 align-items-center justify-content-center'
                    style={{ flexWrap: 'wrap', alignContent: 'normal', overflow: 'hidden' }}>
                    <div onClick={() => onGameFinished()} className='w-100 d-sm-none d-md-block' >
                        <HeaderComponent></HeaderComponent>
                    </div>
                    <div className='w-100 d-flex d-sm-none d-md-flex align-items-center' style={{ justifyContent: 'left' }}>
                        {hiddenPlayers.map((aiHand, index) => <div key={`ai-hand-${index}`} className='w-100'>{aiHand}</div>)}
                    </div>
                    <div className='game-screen-board'>
                        <BoardComponent board={props.gameConfiguration.board} />
                    </div>
                    <div className='w-100 mb-2 d-sm-none d-md-block' style={{}}>
                        {visiblePlayerComponent}
                    </div>
                </div>
                <div className='col-6 d-none d-sm-flex d-md-none h-100' style={{ flexWrap: 'wrap', alignContent: 'normal' }}>
                    <div className='w-100' onClick={() => onGameFinished()} >
                        <HeaderComponent></HeaderComponent>
                    </div>
                    <div className='w-100 d-flex align-items-center' style={{ justifyContent: 'space-left' }}>
                        {hiddenPlayers}
                    </div>
                    <div className='w-100 mb-2'>
                        {visiblePlayerComponent}
                    </div>
                </div>
            </div>
        </>
    )
}

