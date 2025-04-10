import classnames from 'classnames';
import { ReactNode } from 'react';
// import custom from '../../assets/levels/custom.json?raw';
import level from '../../assets/levels/level-4.json?raw';
import { GameConfiguration } from '../../engine/game-configuration/game-configuration';



export const SetupScreen = (props: { onStartButton: (config: GameConfiguration) => void, onLevelEditorButton: () => void }): ReactNode => {
    const levelConfig = JSON.parse(level) as GameConfiguration;
    // const levelConfig = JSON.parse(custom) as GameConfiguration;
    const classes = classnames({
        "w-100": true
    });

    return (
        <>
            <div className={classes} style={{ textAlign: 'center', height: '50%', backgroundColor: 'blue' }} onClick={() => props.onStartButton(levelConfig)} >
            </div>
            <div className={classes} style={{ textAlign: 'center', height: '50%', backgroundColor: 'red' }} onClick={() => props.onLevelEditorButton()} >
            </div>
        </>
    )
}
