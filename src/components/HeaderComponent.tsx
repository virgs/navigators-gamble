import { ReactNode, useState } from 'react';
import { GameConfiguration } from '../engine/game-configuration/game-configuration';
import "./HeaderComponent.scss"
import { AudioController } from '../audio/audio-controller';
import { directions } from '../engine/directions';
import { usePlayerMadeMoveEventListener } from '../events/events';
import { PlayerType } from '../engine/game-configuration/player-type';

type HeaderProps = {
    gameConfiguration?: GameConfiguration;
    onQuit?: () => void;
    levelNumber?: number;
};

export const HeaderComponent = (props: HeaderProps): ReactNode => {
    const totalCards = (): number | undefined => {
        if (props.gameConfiguration === undefined) {
            return undefined;
        }
        return (directions.length * props.gameConfiguration.cardsPerDirection)
            - (props.gameConfiguration.initialCardsPerPlayer * props.gameConfiguration.players.length);
    };

    const [muted, setMuted] = useState<boolean>(AudioController.isMuted());
    const [turnCounter, setTurnCounter] = useState<number | undefined>(0);
    const [remainingCards, setRemainingCards] = useState<number | undefined>(totalCards);

    usePlayerMadeMoveEventListener(() => {
        setRemainingCards(remainingCards === undefined ? undefined : remainingCards - 1);
        setTurnCounter((turnCounter ?? 0) + 1);
    });

    const toggleSound = () => {
        setMuted(!muted);
        AudioController.toggleMute();
    }

    return <div className='row g-0 header'>
        <div className='col-12 col-sm-6 menu py-1'>
            {props.onQuit && <span className='ms-2 button' onClick={() => props.onQuit && props.onQuit()}>
                <i className="bi bi-x-lg"></i></span>}
            {props.gameConfiguration !== undefined && <>
                <span className='level-name ms-4' style={{ textAlign: 'center', fontSize: '1.2rem' }}>
                    {props.levelNumber}
                    <i className="bi bi-dot mx-1"></i>
                    {props.gameConfiguration?.levelName}
                </span>
            </>}
        </div>
        <div className='col-12 col-sm-6 justify-content-between justify-content-sm-end align-items-center d-flex menu py-1'>
            {props.gameConfiguration !== undefined &&
                <>
                    {
                        process.env.NODE_ENV === 'development' &&
                        <>
                            <span className='mx-4'>
                                <i className="bi bi-robot mx-2" />
                                <span className='position-relative'>
                                    <span className="position-absolute top-100 start-100 translate-middle ">
                                        {props.gameConfiguration.players.find(player => player.type === PlayerType.ARTIFICIAL_INTELLIGENCE)?.iterationsPerAlternative ?? '-'}
                                    </span>
                                </span>
                            </span>
                            <span className='mx-4'>
                                <i className="bi bi-speedometer mx-2" />
                                <span className='position-relative'>
                                    <span className="position-absolute top-100 start-100 translate-middle ">
                                        {props.gameConfiguration.estimatedDifficulty}
                                    </span>
                                </span>
                            </span>
                        </>
                    }
                    {turnCounter !== undefined &&
                        <span className='mx-4'>
                            <i className="bi bi-arrow-repeat mx-2" />
                            <span className='position-relative'>
                                <span className="position-absolute top-100 start-100 translate-middle ">
                                    {turnCounter}
                                </span>
                            </span>
                        </span>
                    }
                    <span className='mx-4'>
                        <i className="bi bi-files mx-2" />
                        <span className='position-relative'>
                            <span className="position-absolute top-100 start-100 translate-middle ">
                                {Math.max(remainingCards ?? 0, 0)}
                            </span>
                        </span>
                    </span>
                    <span className='mx-4'>
                        <i className="bi bi-compass" />
                        {/* <i class="bi bi-browser-safari"></i> */}
                        <span className='position-relative'>
                            <span className="position-absolute top-100 start-100 translate-middle ">
                                {props.gameConfiguration.cardsPerDirection}
                            </span>
                        </span>
                    </span>
                </>
            }
            <span className='mx-2 button' onClick={() => toggleSound()}>{muted ?
                <i className="bi bi-volume-up-fill"></i> :
                <i className="bi bi-volume-mute-fill"></i>}
            </span>
        </div>
    </div>;
};