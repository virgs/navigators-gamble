import { ReactNode, useState } from 'react';
import { AudioController } from '../audio/audio-controller';
import { GameConfiguration } from '../engine/game-configuration/game-configuration';
import LevelEditor from '../level-editor/LevelEditor';
import { sleep } from '../math/sleep';
import { BrowserDb } from '../repository/browser-db';
import './GameContainer.scss';
import { HeaderComponent } from './HeaderComponent';
import { GameScreen } from './screens/GameScreen';
import { SetupScreen } from './screens/SetupScreen';

enum GameScreens {
    LEVEL_SETUP,
    GAME_ON,
    LEVEL_EDITOR
}

const screenTransitionsDurationsInMs = 1000

const showFromRightClass = 'show-from-right'
const hideToRightClass = 'hide-to-right'
const showFromLeftClass = 'show-from-left'
const hideToLeftClass = 'hide-to-left'

const removeFromMap = <T,>(map: Set<T>, value: T): Set<T> => {
    map.delete(value)
    return map
}

export const GameContainer = (): ReactNode => {
    const [gameScreens, setGameScreens] = useState<Set<GameScreens>>(new Set([GameScreens.LEVEL_SETUP]))
    const [setupUpdateCounter, setSetupUpdateCounter] = useState<number>(0)

    const [backgroundClasses, setBackgroundClasses] = useState<string[]>(['background-image'])
    const [gameOnClasses, setGameOnClasses] = useState<string[]>([])
    const [setupScreenClasses, setSetupScreenClasses] = useState<string[]>([])
    const [levelEditorClasses, setLevelEditorClasses] = useState<string[]>([])

    const [gameConfiguration, setGameConfiguration] = useState<GameConfiguration | undefined>(undefined)


    const onHumeButtonClicked = async () => {
        if (gameScreens.has(GameScreens.LEVEL_EDITOR)) {
            setLevelEditorClasses(classes => classes.concat(hideToLeftClass))
            setBackgroundClasses(classes => classes.filter(gs => gs !== GameScreens[GameScreens.LEVEL_EDITOR].toLowerCase()))
            setSetupScreenClasses(classes => classes.filter(classes => classes !== hideToRightClass).concat(showFromRightClass))
            setGameScreens(gs => gs.add(GameScreens.LEVEL_SETUP))
            await sleep(screenTransitionsDurationsInMs)
            setGameScreens(gs => removeFromMap(gs, GameScreens.LEVEL_EDITOR))
            setLevelEditorClasses(classes => classes.filter(classes => classes !== hideToLeftClass))
            setSetupScreenClasses(classes => classes.filter(classes => classes !== showFromRightClass))
        } else if (gameScreens.has(GameScreens.GAME_ON)) {
            setGameOnClasses(classes => classes.concat(hideToRightClass))
            setSetupScreenClasses(classes => classes.filter(classes => classes !== hideToLeftClass).concat(showFromLeftClass))
            setGameScreens(gs => gs.add(GameScreens.LEVEL_SETUP))
            setBackgroundClasses(classes => classes.filter(gs => gs !== GameScreens[GameScreens.GAME_ON].toLowerCase()))
            await sleep(screenTransitionsDurationsInMs)
            setGameConfiguration(undefined)
            setGameScreens(gs => removeFromMap(gs, GameScreens.GAME_ON))
            setGameOnClasses(classes => classes.filter(classes => classes !== hideToRightClass))
            setSetupScreenClasses(classes => classes.filter(classes => classes !== showFromLeftClass))
        }
        return undefined
    }

    const renderGameScreens = (): ReactNode => {
        const result: ReactNode[] = []
        if (gameScreens.has(GameScreens.LEVEL_SETUP)) {
            result.push(
                <div className={['setup-screen'].concat(...setupScreenClasses).join(' ')}>
                    <SetupScreen
                        setupUpdateCounter={setupUpdateCounter}
                        onStartButton={async (config: GameConfiguration) => {
                            setGameConfiguration(config)
                            setSetupScreenClasses(classes => classes.concat(hideToLeftClass))
                            setGameOnClasses(classes => classes.concat(showFromRightClass))
                            setGameScreens(gs => gs.add(GameScreens.GAME_ON))
                            setBackgroundClasses(classes => classes.concat(GameScreens[GameScreens.GAME_ON].toLowerCase()))
                        }}
                        onLevelEditorButton={async () => {
                            setGameConfiguration(undefined)
                            setSetupScreenClasses(classes => classes.concat(hideToRightClass))
                            setLevelEditorClasses(classes => classes.concat(showFromLeftClass))
                            setGameScreens(gs => gs.add(GameScreens.LEVEL_EDITOR))
                            setBackgroundClasses(classes => classes.concat(GameScreens[GameScreens.LEVEL_EDITOR].toLowerCase()))
                        }}></SetupScreen>
                </div>
            )
        }
        if (gameScreens.has(GameScreens.GAME_ON)) {
            result.push(
                <div className={['game-on-screen'].concat(...gameOnClasses).join(' ')}>
                    <GameScreen
                        gameConfiguration={gameConfiguration!}
                        onGameFinished={async (stats) => {
                            BrowserDb.addLevelStats(stats)
                            console.log('Stats saved', stats)
                            setSetupUpdateCounter(c => c + 1)
                            onHumeButtonClicked()
                        }} />
                </div>
            )
        }
        if (gameScreens.has(GameScreens.LEVEL_EDITOR)) {
            result.push(
                <div className={['level-editor-screen'].concat(...levelEditorClasses).join(' ')}>
                    <LevelEditor
                        configuration={gameConfiguration}
                        onPlay={async (config: GameConfiguration) => {
                            setGameConfiguration(config)
                            onHumeButtonClicked()
                        }} />
                </div>
            )
        }
        return result
            .map((screen, index) => <div key={index} className='screen-container'> {screen}</div>)
    }

    return (
        <div className='container-lg g-0 game-container' onPointerDown={() => AudioController.start()}>
            <div className={backgroundClasses.join(' ')} />
            <HeaderComponent
                gameConfiguration={gameConfiguration}
                onHomeButton={gameScreens.size !== 1 ? () => onHumeButtonClicked() : undefined}
            />
            <div className='game-screens-container'>
                {renderGameScreens()}
            </div>
        </div>
    )
}
