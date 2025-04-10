import classnames from 'classnames';
import { ReactNode } from 'react';
import custom from '../../assets/levels/custom.json?raw';
import { GameConfiguration } from '../../engine/game-configuration/game-configuration';



export const SetupScreen = (props: { onStartButton: (config: GameConfiguration) => void }): ReactNode => {
    // const levelConfig = JSON.parse(level) as GameConfiguration;
    const levelConfig = JSON.parse(custom) as GameConfiguration;
    console.log(levelConfig)
    const classes = classnames({
        "w-100": true
    });

    return (
        <>
            <div className={classes} style={{ textAlign: 'center', height: '100%' }} onClick={() => props.onStartButton(levelConfig)} >
            </div>
        </>
    )
}
