import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

import './index.scss'
import './scss/styles.scss'

import 'bootstrap-icons/font/bootstrap-icons.css'

document.addEventListener('contextmenu', (event) => {
    event.preventDefault()
})

// updateLevelData()

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
)
