import { ReactNode, useEffect } from 'react';

export const HeaderComponent = (): ReactNode => {
    // card per direction, exit, sound
    useEffect(() => {
        console.log('Game header initialized');
    }, []);

    return <div style={{
        backgroundColor: 'green', height: '100%'
    }}>Header</div>;
};
