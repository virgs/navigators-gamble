import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { qrcode } from 'vite-plugin-qrcode'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), qrcode()],
    assetsInclude: [],
    resolve: {
        alias: {
            '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
        },
    },
    optimizeDeps: {
        exclude: [],
    },
    base: '/navigators-gamble',
    build: {
        target: 'esnext',
        rollupOptions: {
            output: {},
        },
        outDir: 'docs',
        assetsDir: '.',
    },
})
