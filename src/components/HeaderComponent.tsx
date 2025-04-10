import { ReactNode } from 'react';
import { GameConfiguration } from '../engine/game-configuration/game-configuration';

export const HeaderComponent = (props: { gameConfiguration: GameConfiguration, onQuit: () => void }): ReactNode => {
    // card per direction, exit, sound

    return <div onClick={() => props.onQuit()} style={{
        backgroundColor: 'green', height: '100%'
    }}>Header</div>;
};
