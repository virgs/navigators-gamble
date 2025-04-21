import { ReactNode, useState } from 'react';
import { AudioController } from '../audio/audio-controller';
import { GameConfiguration } from '../engine/game-configuration/game-configuration';
import LevelEditor from '../level-editor/LevelEditor';
import { sleep } from '../math/sleep';
import './GameContainer.scss';
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

    const [backgroundClasses, setBackgroundClasses] = useState<string[]>(['background-image'])
    const [gameOnClasses, setGameOnClasses] = useState<string[]>([])
    const [setupScreenClasses, setSetupScreenClasses] = useState<string[]>([])
    const [levelEditorClasses, setLevelEditorClasses] = useState<string[]>([])

    const [gameConfiguration, setGameConfiguration] = useState<GameConfiguration | undefined>(undefined)
    const renderGameScreens = (): ReactNode => {
        const result: ReactNode[] = []
        if (gameScreens.has(GameScreens.LEVEL_SETUP)) {
            result.push(
                <div className={['setup-screen'].concat(...setupScreenClasses).join(' ')}>
                    <SetupScreen
                        onStartButton={async (config: GameConfiguration) => {
                            setGameConfiguration(config)
                            setSetupScreenClasses(classes => classes.concat(hideToLeftClass))
                            setGameOnClasses(classes => classes.concat(showFromRightClass))
                            setGameScreens(gs => gs.add(GameScreens.GAME_ON))
                            setBackgroundClasses(classes => classes.concat(GameScreens[GameScreens.GAME_ON].toLowerCase()))
                            // await sleep(screenTransitionsDurationsInMs)
                            // setSetupScreenClasses(classes => classes.filter(classes => classes !== 'hide-to-left'))
                            // setGameRunningClasses(classes => classes.filter(classes => classes !== 'show-from-right'))
                            // setGameScreens(gs => gs.filter((screen) => screen !== GameScreens.SETUP))
                        }}
                        onLevelEditorButton={async () => {
                            setSetupScreenClasses(classes => classes.concat(hideToRightClass))
                            setLevelEditorClasses(classes => classes.concat(showFromLeftClass))
                            setGameScreens(gs => gs.add(GameScreens.LEVEL_EDITOR))
                            setBackgroundClasses(classes => classes.concat(GameScreens[GameScreens.LEVEL_EDITOR].toLowerCase()))
                            // await sleep(screenTransitionsDurationsInMs)
                            // setLevelEditorClasses(classes => classes.filter(classes => classes !== 'show-from-left'))
                            // setSetupScreenClasses(classes => classes.filter(classes => classes !== 'hide-to-right'))
                            // setGameScreens(gs => gs.filter((screen) => screen !== GameScreens.SETUP))
                        }}></SetupScreen>
                </div>
            )
        }
        if (gameScreens.has(GameScreens.GAME_ON)) {
            result.push(
                <div className={['game-on-screen'].concat(...gameOnClasses).join(' ')}>
                    <GameScreen
                        gameConfiguration={gameConfiguration!}
                        onGameFinished={async (result) => {
                            //TODO persist data
                            setGameOnClasses(classes => classes.concat(hideToRightClass))
                            setSetupScreenClasses(classes => classes.filter(classes => classes !== hideToLeftClass).concat(showFromLeftClass))
                            setGameScreens(gs => gs.add(GameScreens.LEVEL_SETUP))
                            setBackgroundClasses(classes => classes.filter(gs => gs !== GameScreens[GameScreens.GAME_ON].toLowerCase()))
                            await sleep(screenTransitionsDurationsInMs)
                            setGameScreens(gs => removeFromMap(gs, GameScreens.GAME_ON))
                            setGameOnClasses(classes => classes.filter(classes => classes !== hideToRightClass))
                            setSetupScreenClasses(classes => classes.filter(classes => classes !== showFromLeftClass))
                            console.log(result)
                        }} />
                </div>
            )
        }
        if (gameScreens.has(GameScreens.LEVEL_EDITOR)) {
            console.log('rendering level editor')
            result.push(
                <div className={['level-editor-screen'].concat(...levelEditorClasses).join(' ')}>
                    <LevelEditor
                        configuration={gameConfiguration}
                        onExit={async (config?: GameConfiguration) => {
                            console.log('exiting level editor', config)
                            setGameConfiguration(config)
                            setLevelEditorClasses(classes => classes.concat(hideToLeftClass))
                            setBackgroundClasses(classes => classes.filter(gs => gs !== GameScreens[GameScreens.LEVEL_EDITOR].toLowerCase()))
                            setSetupScreenClasses(classes => classes.filter(classes => classes !== hideToRightClass).concat(showFromRightClass))
                            setGameScreens(gs => gs.add(GameScreens.LEVEL_SETUP))
                            await sleep(screenTransitionsDurationsInMs)
                            setGameScreens(gs => removeFromMap(gs, GameScreens.LEVEL_EDITOR))
                            setLevelEditorClasses(classes => classes.filter(classes => classes !== hideToLeftClass))
                            setSetupScreenClasses(classes => classes.filter(classes => classes !== showFromRightClass))
                        }} />
                </div>
            )
        }
        return result
            .map((screen, index) => <div key={index} style={{ zIndex: 10 }}> {screen}</div>)
    }

    const classesFromScreens = Array.from(gameScreens.values())
        .map(screen => GameScreens[screen].toLowerCase())
        .join(' ')

    return (
        <div className='game-container container-lg g-0' onPointerDown={() => AudioController.start()}>
            <div className={backgroundClasses.join(' ')} />
            {renderGameScreens()}
        </div>
    )
}
