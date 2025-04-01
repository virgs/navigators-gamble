import classnames from 'classnames';
import { ReactNode, useEffect, useState } from 'react';
import { GameConfiguration } from '../engine/game-configuration/game-configuration';
import { PlayerType } from '../engine/game-configuration/player-type';
import { GameEngine } from '../engine/game-engine';
import { Player } from '../engine/players/player';
import { BoardComponent } from './BoardComponent';
import './GameContainer.scss';
import { HeaderComponent } from './HeaderComponent';
import { PlayerHandComponent } from './PlayerHandComponent';



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

export const GameScreen = (props: { gameConfig: GameConfiguration, onGameFinished: () => void }): ReactNode => {

    const [gameEngine, setGameEngine] = useState<GameEngine>(new GameEngine(props.gameConfig))

    const classes = classnames({
        "w-100": true,
        "h-100": true,
        'row': true,
        'g-0': true
    });

    const renderHumanPlayer = (): ReactNode => {
        const humanPlayer = gameEngine.players.find(player => player.type === PlayerType.HUMAN)
        if (humanPlayer) {
            return <PlayerHandComponent cards={humanPlayer.cards} score={humanPlayer.score} turn={false} onCardSelected={() => 4} />
        }
        return <></>
    }

    return (
        <>
            <div className={classes} onClick={() => props.onGameFinished()}>
                <div className='col-12 col-md-6 col-lg-12 d-flex' style={{ height: '100%', flexWrap: 'wrap', alignContent: 'space-evenly' }}>
                    <div className='w-100 d-md-none d-lg-block' style={{ height: '10svh' }}>
                        <HeaderComponent></HeaderComponent>
                    </div>
                    <div className='w-100 d-md-none d-lg-block' style={{ height: '10svh' }}>
                        {/* <PlayerHandComponent cards={gameEngine.players[0].cards} score={gameEngine.players[0].score} turn={false} onCardSelected={() => 4} /> */}
                    </div>
                    <div className='w-100' style={{ height: 'min(100svmin, 600px)' }}>
                        <BoardComponent board={gameEngine.board} />
                    </div>
                    <div className='w-100 d-md-none d-lg-block' style={{ height: '10svh' }}>
                        {renderHumanPlayer()}
                    </div>

                </div>
                <div className='col-6 d-none d-md-flex d-lg-none' style={{ height: '100%', flexWrap: 'wrap', alignContent: 'space-evenly' }}>
                    <div className='w-100' style={{ height: '10svh' }}>
                        <HeaderComponent></HeaderComponent>
                    </div>
                    <div className='w-100' style={{ height: '30svh' }}>
                        {/* <PlayerHandComponent cards={gameEngine.players[0].cards} score={gameEngine.players[0].score} turn={false} onCardSelected={() => 4} />                    */}
                    </div>
                    <div className='w-100' style={{ height: '30svh' }}>
                        {renderHumanPlayer()}
                    </div>
                </div>
            </div>
        </>
    )
}

