import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './scss/styles.scss'
import './index.scss'

// Import all of Bootstrap's JS
// import * as bootstrap from 'bootstrap'

document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});

createRoot(document.getElementById('root')!).render(
    // <StrictMode>
    <App />
    // </StrictMode>
)
