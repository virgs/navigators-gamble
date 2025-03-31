import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './scss/styles.scss'
import './index.css'

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'

// import 'bootswatch/dist/morph/bootstrap.min.css'
import 'bootswatch/dist/sandstone/bootstrap.min.css'

createRoot(document.getElementById('root')!).render(
    // <StrictMode>
    <App />
    // </StrictMode>
)
