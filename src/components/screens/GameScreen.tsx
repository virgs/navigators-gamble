import { useOrientation } from '@uidotdev/usehooks';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { GameConfiguration } from '../../engine/game-configuration/game-configuration';
import { GameEngine } from '../../engine/game-engine';
import { useEndOfScoreAnimationsEventListener } from '../../events/events';
import { BoardComponent } from '../BoardComponent';
import { HeaderComponent } from '../HeaderComponent';
import { HiddenCardsHandComponent } from '../hands/HiddenCardsHandComponent';
import { VisibleCardsHandComponent } from '../hands/VisibleCardsHandComponent';
import './GameScreen.scss';


export const GameScreen = (props: { gameConfiguration: GameConfiguration, onGameFinished: () => void }): ReactNode => {
    const gameEngine = new GameEngine(props.gameConfiguration)
    const orientation = useOrientation();
    const [classes] = useState<string[]>(['game-screen', 'w-100', 'h-100', 'row', 'g-0'])

    useEffect(() => {
        console.log('orientation', orientation);
    }, [orientation]);


    const iterate = () => {
        gameEngine.playNextRound()
            .then(() => {
                if (gameEngine.isGameOver()) {
                    gameEngine.finish()
                    setTimeout(() => onGameFinished())
                }
            })
            .catch(e => {
                console.error('Error', e);
            })
    }

    useEffect(() => {
        gameEngine.start()
        setTimeout(() => iterate(), 2000)
    }, [])

    useEndOfScoreAnimationsEventListener(() => {
        iterate()
    })

    const onGameFinished = () => {
        setTimeout(() => props.onGameFinished(), 5000)
    }


    console.log('GameScreen', props.gameConfiguration.players.map(player => player.id).join(', '));

    const visibleHandPlayer = props.gameConfiguration.players
        .find(player => player.id === props.gameConfiguration.visibleHandPlayerId)
    const visiblePlayerComponent = useRef<ReactNode>(visibleHandPlayer ? <VisibleCardsHandComponent player={visibleHandPlayer} /> : <></>)

    const hiddenPlayers: ReactNode[] = props.gameConfiguration.players
        .filter(player => player.id !== props.gameConfiguration.visibleHandPlayerId)
        .map((player) => <HiddenCardsHandComponent key={player.id} player={player}></HiddenCardsHandComponent>);

    return (
        <>
            <div className={classes.join(' ')}>
                <div className='col-12 col-md-8 col-lg-12 d-flex h-100' style={{ flexWrap: 'wrap', alignContent: 'normal', alignItems: 'center' }}>
                    <div onClick={() => onGameFinished()} className='w-100 d-md-none d-lg-block' >
                        <HeaderComponent></HeaderComponent>
                    </div>
                    <div className='w-100 d-flex d-md-none d-lg-flex' style={{ alignItems: 'center', justifyContent: 'left' }}>
                        {hiddenPlayers.map((aiHand, index) => <div key={`ai-hand-${index}`} style={{ width: '50%' }}>{aiHand}</div>)}
                    </div>
                    <div className='w-100 game-screen-board'>
                        <BoardComponent board={props.gameConfiguration.board} />
                    </div>
                    <div className='w-100 mb-2 d-md-none d-lg-block' style={{}}>
                        {visiblePlayerComponent.current}
                    </div>
                </div>
                <div className='col-4 d-none d-md-flex d-lg-none h-100' style={{ flexWrap: 'wrap', alignContent: 'normal' }}>
                    <div className='w-100' onClick={() => onGameFinished()} >
                        <HeaderComponent></HeaderComponent>
                    </div>
                    <div className='w-100 d-flex' style={{ alignItems: 'center', justifyContent: 'space-left' }}>
                        {hiddenPlayers}
                    </div>
                    <div className='w-100 mb-2' style={{}}>
                        {/* {visiblePlayerComponent.current} */}
                    </div>
                </div>
            </div>
        </>
    )
}

