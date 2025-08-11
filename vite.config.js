// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(process.cwd(), 'src'),
            components: resolve(process.cwd(), 'src/components'),
            entities: resolve(process.cwd(), 'src/entities'),
            pages: resolve(process.cwd(), 'src/pages'),
            lib: resolve(process.cwd(), 'src/lib'),
        },
    },
    server: {
        proxy: {
            '/api.php': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
})