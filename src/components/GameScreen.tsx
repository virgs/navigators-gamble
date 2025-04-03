import { ReactNode, useEffect, useState } from 'react';
import { GameConfiguration } from '../engine/game-configuration/game-configuration';
import { PlayerType } from '../engine/game-configuration/player-type';
import { GameEngine } from '../engine/game-engine';
import { BoardComponent } from './BoardComponent';
import { HeaderComponent } from './HeaderComponent';
import { PlayerHandComponent } from './hands/PlayerHandComponent';
import { AIHandComponent } from './hands/AIHandComponent';
import './GameScreen.scss';



export const GameScreen = (props: { gameConfiguration: GameConfiguration, onGameFinished: () => void }): ReactNode => {

    const iterate = async (gameConfiguration: GameConfiguration, iterations: number) => {
        const gameEngine = new GameEngine(gameConfiguration)
        while (!gameEngine.isGameOver() && iterations > 0) {
            await gameEngine.playNextRound()
            --iterations
        }
        return gameEngine
    }

    const [gameEngine, setGameEngine] = useState<GameEngine | undefined>(undefined)
    const [classes, setClasses] = useState<string[]>(['game-screen', 'w-100', 'h-100', 'row', 'g-0'])

    useEffect(() => {
        iterate(props.gameConfiguration, 1).then(gameEngine => {
            return setGameEngine(gameEngine);
        })
    }, [])

    const onGameFinished = () => {
        setTimeout(() => props.onGameFinished(), 1000)
    }


    if (!gameEngine) {
        return <div />
    }

    const renderHumanPlayer = (): ReactNode => {
        const humanPlayer = gameEngine.players.find(player => player.type === PlayerType.HUMAN)
        if (humanPlayer) {
            return <PlayerHandComponent cards={humanPlayer.cards} score={humanPlayer.score} turn={true} onCardSelected={() => 4} />
        }
        return <></>
    }

    const renderArtificialIntelligencePlayers = (): ReactNode[] => {
        return gameEngine.players.filter(player => player.type !== PlayerType.HUMAN).map(aiPlayer => {
            return <AIHandComponent key={aiPlayer.id} cards={aiPlayer.cards} score={aiPlayer.score} turn={true} onCardSelected={() => 4}></AIHandComponent>
        })
    }

    return (
        <>
            <div className={classes.join(' ')}>
                <div className='col-12 col-md-8 col-lg-12 d-flex h-100' style={{ flexWrap: 'wrap', alignContent: 'normal' }}>
                    <div onClick={() => onGameFinished()} className='w-100 d-md-none d-lg-block' >
                        <HeaderComponent></HeaderComponent>
                    </div>
                    <div className='w-100 d-flex d-md-none d-lg-flex' style={{ alignItems: 'center', justifyContent: 'left' }}>
                        {renderArtificialIntelligencePlayers().map((aiHand, index) => <div key={`ai-hand-${index}`} style={{ width: '50%' }}>{aiHand}</div>)}
                    </div>
                    <div className='w-100' style={{
                        height: 'min(100svmin, 600px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <BoardComponent board={gameEngine.board} />
                    </div>
                    <div className='w-100 mb-2 d-md-none d-lg-block' style={{}}>
                        {renderHumanPlayer()}
                    </div>

                </div>
                <div className='col-4 d-none d-md-flex d-lg-none h-100' style={{ flexWrap: 'wrap', alignContent: 'normal' }}>
                    <div className='w-100' onClick={() => onGameFinished()} >
                        <HeaderComponent ></HeaderComponent>
                    </div>
                    <div className='w-100 d-flex' style={{ alignItems: 'center', justifyContent: 'space-left' }}>
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

