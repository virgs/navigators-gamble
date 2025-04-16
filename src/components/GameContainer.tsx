import classnames from 'classnames';
import { ReactNode, useState } from 'react';
import backgroundImage from '../assets/resized-background.jpg';
import { AudioController } from '../audio/audio-controller';
import { GameConfiguration } from '../engine/game-configuration/game-configuration';
import LevelEditor from '../level-editor/LevelEditor';
import { GameFinished, GameScreen } from './screens/GameScreen';
import { SetupScreen } from './screens/SetupScreen';
import './GameContainer.scss';
import { GameAnnouncementModal } from './GameAnnouncementModal';


export const GameContainer = (): ReactNode => {
    const [gameConfiguration, setGameConfiguration] = useState<GameConfiguration | undefined>(undefined)
    const [setupScreenClasses, setSetupScreenClasses] = useState<string[]>([])
    const [gameIsRunning, setGameIsRunning] = useState<Boolean>(false)
    const [levelEditor, setLevelEditor] = useState<Boolean>(false)

    const classes = classnames({
        'game-container': true,
        'container-lg': true,
        'g-0': true
    });

    const backgroundClasses = classnames({
        'background': true,
        'game-running': gameIsRunning,
        'level-editor': levelEditor,
    });

    const onStartButton = (config: GameConfiguration): void => {
        setGameConfiguration(config)
        setGameIsRunning(true)
    }

    const onGameFinished = (result: GameFinished): void => {
        console.log('Game finished', result)
        setSetupScreenClasses(['show-from-left'])
        //TODO persist data
        setGameIsRunning(false)
    }

    const screen = () => {
        if (gameConfiguration && gameIsRunning) {
            return <div className='w-100 h-100 d-flex justify-content-center align-items-center game-container-screen show'>
                <GameScreen gameConfiguration={gameConfiguration} onGameFinished={(result) => onGameFinished(result)}></GameScreen>
            </div>
        } else {
            if (process.env.NODE_ENV === 'development' && levelEditor) {
                return <div className='level-editor show mx-2'>
                    <LevelEditor
                        configuration={gameConfiguration}
                        onExit={(config: GameConfiguration) => {
                            onStartButton(config)
                            setSetupScreenClasses(['show-from-right'])
                            return setLevelEditor(false);
                        }}></LevelEditor>
                </div>
            }
            return <div className={['setup-screen', 'h-100'].concat(...setupScreenClasses).join(' ')}>
                <SetupScreen onLevelEditorButton={() => setLevelEditor(true)} onStartButton={(config) => onStartButton(config)}></SetupScreen>
            </div>
        }
    }



    return (
        <div className={classes} onScroll={() => AudioController.start()} onPointerDown={() => AudioController.start()}>
            <div className={backgroundClasses} style={{ backgroundImage: `url(${backgroundImage})` }} />
            <div className='w-100 h-100' style={{ zIndex: 10 }}>
                {screen()}
            </div>
            <GameAnnouncementModal />

        </div>
    )
}
