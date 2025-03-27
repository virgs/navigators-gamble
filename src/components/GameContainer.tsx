import biggerLogo from '../assets/transparent-compass.webp'
import './GameContainer.scss'
import { ReactNode, useState } from 'react'

export const GameContainer = (): ReactNode => {
    const [gameIsRunning, setGameIsRunning] = useState<Boolean>(false)

    return (
        <>
            <div className={`game-container container-md m-0 ${gameIsRunning || 'game-running'}`} >
                {/* <img src={biggerLogo} className="logo compass" alt="React logo" /> */}
                <button type="button" className="btn btn-primary"
                    onClick={() => setGameIsRunning(!gameIsRunning)}
                    data-bs-toggle="button" aria-pressed="true">

                    {gameIsRunning ? 'Start' : 'Finish'}

                </button>


            </div>
        </>
    )
}
