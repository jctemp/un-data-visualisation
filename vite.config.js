import { resolve } from 'path'
import { defineConfig } from 'vite'
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        visualisation: resolve(__dirname, 'pages/visualisation.html'),
        about: resolve(__dirname, 'pages/about.html'),
      },
    },
  },
  plugins: [topLevelAwait()],
})
