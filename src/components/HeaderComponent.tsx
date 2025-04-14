import { ReactNode, useState } from 'react';
import { GameConfiguration } from '../engine/game-configuration/game-configuration';
import "./HeaderComponent.scss"
import { AudioController } from '../audio/audio-controller';
import { directions } from '../engine/directions';
import { usePlayerMadeMoveEventListener } from '../events/events';
import { PlayerType } from '../engine/game-configuration/player-type';

export const HeaderComponent = (props: { gameConfiguration?: GameConfiguration, onQuit?: () => void, levelNumber?: number }): ReactNode => {
    const totalCards = (): number | undefined => {
        if (props.gameConfiguration === undefined) {
            return undefined;
        }
        return (directions.length * props.gameConfiguration.cardsPerDirection)
            - (props.gameConfiguration.initialCardsPerPlayer * props.gameConfiguration.players.length);
    };

    const [muted, setMuted] = useState<boolean>(AudioController.isMuted());
    const [remainingCards, setRemainingCards] = useState<number | undefined>(totalCards);

    usePlayerMadeMoveEventListener(() => {
        setRemainingCards(remainingCards === undefined ? undefined : remainingCards - 1);
    });

    const toggleSound = () => {
        setMuted(!muted);
        AudioController.toggleMute();
    }

    return <div className='row g-0 header'>
        <div className='col-6'>
            {props.onQuit && <span className='ms-2 button' style={{ cursor: 'pointer' }} onClick={() => props.onQuit && props.onQuit()}>
                <i className="bi bi-x-lg"></i></span>}
            <span className='level-name ms-4' style={{ textAlign: 'center', fontSize: '1.2rem' }}>
                {props.levelNumber !== undefined ? props.levelNumber : "5"}
                <i className="bi bi-dot mx-2"></i>
                {props.gameConfiguration?.levelName ?? "Baiú"}
            </span>
        </div>
        <div className='col-6 justify-content-end d-flex'>
            {props.gameConfiguration !== undefined &&
                <>
                    <span className='me-4'>
                        <i className="bi bi-robot mx-2" />
                        <span className='position-relative'>
                            <span className="position-absolute top-100 start-100 translate-middle ">
                                {props.gameConfiguration.players.find(player => player.type === PlayerType.ARTIFICIAL_INTELLIGENCE)?.iterationsPerAlternative}
                            </span>
                        </span>
                    </span>
                    <span className='me-4'>
                        <i className="bi bi-files mx-2" />
                        <span className='position-relative'>
                            <span className="position-absolute top-100 start-100 translate-middle ">
                                {Math.max(remainingCards ?? 0, 0)}
                            </span>
                        </span>
                    </span>
                    <span className='me-4'>
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
            <span className='me-2 button' onClick={() => toggleSound()}>{muted ?
                <i className="bi bi-volume-up-fill"></i> :
                <i className="bi bi-volume-mute-fill"></i>}
            </span>
        </div>
    </div>;
};