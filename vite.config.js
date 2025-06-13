import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
    base: "./",
    rollupOptions: {
        output: {
            // Separate MapLibre into its own chunk
            manualChunks: {
                'maplibre': ['maplibre-gl'],
            },

            // Optimize chunk file names for caching
            chunkFileNames: (chunkInfo) => {
                const facadeModuleId = chunkInfo.facadeModuleId
                if (facadeModuleId && facadeModuleId.includes('maplibre')) {
                    return 'assets/maplibre-[hash].js'
                }
                return 'assets/[name]-[hash].js'
            }
        }
    },
    plugins: [
        tailwindcss(),
    ],
    optimizeDeps: { exclude: ["fsevents"] },
})