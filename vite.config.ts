import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { qrcode } from 'vite-plugin-qrcode'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), qrcode()],
    resolve: {
        alias: {
            '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
        },
    },
})
