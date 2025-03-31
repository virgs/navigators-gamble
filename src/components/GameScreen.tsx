import classnames from 'classnames';
import { ReactNode } from 'react';
import { GameConfiguration } from '../engine/game-configuration/game-configuration';
import './GameContainer.scss';


// const gameEngine = new GameEngine(gameConfig)

// const iterate = async () => {
//     if (!gameEngine.isGameOver()) {
//         await gameEngine.playNextRound()
//         setTimeout(iterate, 100)
//     } else {
//         console.log(`Game over`)
//         gameEngine.finishGame()
//         console.log(gameEngine.getScores())
//     }
// }

// iterate()


const GameHeader = (): ReactNode => {
    // useEffect(() => {
    //     console.log('Game header initialized')
    // }, [])

    return <div style={{
        backgroundColor: 'green', height: '100%'
    }}>Header</div>;
}
const AiHand = (): ReactNode => <><div style={{ backgroundColor: 'gray', height: '100%' }}>Ai hand</div></>
const Board = (): ReactNode => <><div style={{ backgroundColor: 'yellow', height: '100%' }}>Board</div></>
const PlayerHand = (): ReactNode => <><div style={{ backgroundColor: 'lightblue', height: '100%' }}>Player hand</div></>


export const GameScreen = (props: { gameConfig: GameConfiguration, onGameFinished: () => void }): ReactNode => {
    const classes = classnames({
        "w-100": true,
        "h-100": true,
        'row': true,
        'g-0': true
    });


    return (
        <>
            <div className={classes} onClick={() => props.onGameFinished()}>
                <div className='col-12 col-md-6 col-lg-12 d-flex' style={{ height: '100%', flexWrap: 'wrap', alignContent: 'space-between' }}>
                    <div className='w-100 d-md-none d-lg-block' style={{ height: '10svh' }}>
                        <GameHeader></GameHeader>
                    </div>
                    <div className='w-100 d-md-none d-lg-block' style={{ height: '10svh' }}>
                        <AiHand />
                    </div>
                    <div className='w-100' style={{ height: 'min(100svmin, 600px)' }}>
                        <Board />
                    </div>
                    <div className='w-100 d-md-none d-lg-block' style={{ height: '10svh' }}>
                        <PlayerHand></PlayerHand>
                    </div>
                </div>
                <div className='col-6 d-none d-md-flex d-lg-none' style={{ height: '100%', flexWrap: 'wrap', alignContent: 'space-between' }}>
                    <div className='w-100' style={{ height: '10svh' }}>
                        <GameHeader></GameHeader>
                    </div>
                    <div className='w-100' style={{ height: '30svh' }}>
                        <AiHand />
                    </div>
                    <div className='w-100' style={{ height: '30svh' }}>
                        <PlayerHand></PlayerHand>
                    </div>
                </div>
            </div>
        </>
    )
}

