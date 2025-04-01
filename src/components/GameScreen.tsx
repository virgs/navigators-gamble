import classnames from 'classnames';
import { ReactNode, useState } from 'react';
import { GameConfiguration } from '../engine/game-configuration/game-configuration';
import { PlayerType } from '../engine/game-configuration/player-type';
import { GameEngine } from '../engine/game-engine';
import { BoardComponent } from './BoardComponent';
import './GameContainer.scss';
import { HeaderComponent } from './HeaderComponent';
import { PlayerHandComponent } from './PlayerHandComponent';
import { AIHandComponent } from './AIHandComponent';



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

export const GameScreen = (props: { gameConfiguration: GameConfiguration, onGameFinished: () => void }): ReactNode => {

    const [gameEngine, setGameEngine] = useState<GameEngine>(new GameEngine(props.gameConfiguration))

    const classes = classnames({
        "w-100": true,
        "h-100": true,
        'row': true,
        'g-0': true
    });

    const renderHumanPlayer = (): ReactNode => {
        const humanPlayer = gameEngine.players.find(player => player.type === PlayerType.HUMAN)
        if (humanPlayer) {
            return <PlayerHandComponent cards={humanPlayer.cards} score={humanPlayer.score} turn={true} onCardSelected={() => 4} />
        }
        return <></>
    }

    const renderArtificialIntelligencePlayers = (): ReactNode => {
        return gameEngine.players.filter(player => player.type !== PlayerType.HUMAN).map(aiPlayer => {
            return <AIHandComponent key={aiPlayer.id} cards={aiPlayer.cards} score={aiPlayer.score} turn={true} onCardSelected={() => 4}></AIHandComponent>
        })
    }

    return (
        <>
            <div className={classes}>
                <div className='col-12 col-md-6 col-lg-12 d-flex' style={{ height: '100%', flexWrap: 'wrap', alignContent: 'space-evenly' }}>
                    <div onClick={() => props.onGameFinished()} className='w-100 d-md-none d-lg-block' style={{ height: '10svh' }}>
                        <HeaderComponent></HeaderComponent>
                    </div>
                    <div className='w-100 d-flex d-md-none d-lg-flex' style={{ height: '10svh', alignItems: 'center', justifyContent: 'left' }}>
                        {renderArtificialIntelligencePlayers()}
                    </div>
                    <div className='w-100' style={{ height: 'min(100svmin, 600px)' }}>
                        <BoardComponent board={gameEngine.board} />
                    </div>
                    <div className='w-100 mb-2 d-md-none d-lg-block' style={{}}>
                        {renderHumanPlayer()}
                    </div>

                </div>
                <div className='col-6 d-none d-md-flex d-lg-none' style={{ height: '100%', flexWrap: 'wrap', alignContent: 'space-evenly' }}>
                    <div className='w-100' style={{ height: '10svh' }}>
                        <HeaderComponent></HeaderComponent>
                    </div>
                    <div className='w-100 d-flex' style={{ height: '30svh', alignItems: 'center', justifyContent: 'space-left' }}>
                        {renderArtificialIntelligencePlayers()}
                    </div>
                    <div className='w-100 mb-2' style={{}}>
                        {renderHumanPlayer()}
                    </div>
                </div>
            </div>
        </>
    )
}

