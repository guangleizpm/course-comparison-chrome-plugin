import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

// Plugin to copy manifest and other extension files after build
const chromeExtensionPlugin = () => {
  return {
    name: 'chrome-extension',
    closeBundle() {
      const distPath = resolve(__dirname, 'dist')
      const publicPath = resolve(__dirname, 'public')
      
      // Copy manifest.json
      copyFileSync(
        resolve(__dirname, 'manifest.json'),
        resolve(distPath, 'manifest.json')
      )
      
      // Copy background.js
      if (existsSync(resolve(publicPath, 'background.js'))) {
        copyFileSync(
          resolve(publicPath, 'background.js'),
          resolve(distPath, 'background.js')
        )
      }
      
      // Move sidepanel.html from dist/public/ to dist/ root and fix asset paths
      const sidepanelInPublic = resolve(distPath, 'public', 'sidepanel.html')
      const sidepanelInRoot = resolve(distPath, 'sidepanel.html')
      if (existsSync(sidepanelInPublic)) {
        const fs = require('fs')
        let htmlContent = fs.readFileSync(sidepanelInPublic, 'utf8')
        // Fix asset paths: change ../assets/ to ./assets/
        htmlContent = htmlContent.replace(/\.\.\/assets\//g, './assets/')
        fs.writeFileSync(sidepanelInRoot, htmlContent)
      }
      
      // Create icons directory if it doesn't exist
      const iconsDir = resolve(distPath, 'icons')
      if (!existsSync(iconsDir)) {
        mkdirSync(iconsDir, { recursive: true })
      }
    }
  }
}

export default defineConfig({
  plugins: [react(), chromeExtensionPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'public/sidepanel.html'),
      },
    },
  },
  publicDir: 'public',
  base: './',
})

