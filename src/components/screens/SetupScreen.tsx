import classnames from 'classnames';
import { ReactNode } from 'react';
import level from '../../assets/levels/custom.json?raw';
import { GameConfiguration } from '../../engine/game-configuration/game-configuration';
import { HeaderComponent } from '../HeaderComponent';



export const SetupScreen = (props: { onStartButton: (config: GameConfiguration) => void, onLevelEditorButton: () => void }): ReactNode => {
    const levelConfig = JSON.parse(level) as GameConfiguration;
    const classes = classnames({
        "w-100": true
    });

    return (
        <>
            <HeaderComponent></HeaderComponent>
            <div className={classes} style={{ textAlign: 'center', height: '50%', backgroundColor: 'transparent' }} />
            <div className={classes} style={{ textAlign: 'center', height: '20%', backgroundColor: 'blue' }} onClick={() => props.onStartButton(levelConfig)} />
            <div className={classes} style={{ textAlign: 'center', height: '20%', backgroundColor: 'red' }} onClick={() => props.onLevelEditorButton()} />
        </>
    )
}
