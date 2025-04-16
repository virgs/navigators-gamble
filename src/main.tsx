import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// import "bootswatch/dist/brite/bootstrap.min.css";
import "bootswatch/dist/sandstone/bootstrap.min.css";

import './scss/styles.scss'
import './index.scss'

import "bootstrap-icons/font/bootstrap-icons.css";

document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});

createRoot(document.getElementById('root')!).render(
    // <StrictMode>
    <App />
    // </StrictMode>
)
