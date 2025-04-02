import classnames from 'classnames';
import { ReactNode, useState } from 'react';
import backgroundImage from '../assets/resized-background.jpg';
import { GameConfiguration } from '../engine/game-configuration/game-configuration';
import { GameScreen } from './GameScreen';
import { SetupScreen } from './SetupScreen';
import './GameContainer.scss';


export const GameContainer = (): ReactNode => {
    const [gameConfiguration, setGameConfiguration] = useState<GameConfiguration | undefined>(undefined)
    const [gameIsRunning, setGameIsRunning] = useState<Boolean>(false)

    const classes = classnames({
        'game-container': true,
        'container-lg': true,
        'g-0': true
    });

    const backgroundClasses = classnames({
        'background': true,
        'game-running': gameIsRunning,
    });

    const onStartButton = (config: GameConfiguration): void => {
        setGameConfiguration(config)
        setGameIsRunning(true)
    }

    const onGameFinished = (): void => {
        setGameIsRunning(false)
    }

    const screen = () => {
        if (gameConfiguration && gameIsRunning) {
            return <GameScreen gameConfiguration={gameConfiguration} onGameFinished={() => onGameFinished()}></GameScreen>
        } else {
            return <SetupScreen onStartButton={(config) => onStartButton(config)}></SetupScreen>
        }
    }



    return (
        <div className={classes}>
            <div className={backgroundClasses} style={{ backgroundImage: `url(${backgroundImage})` }} />
            <div className='w-100 h-100' style={{ zIndex: 10 }}>
                {screen()}
            </div>
        </div>
    )
}
