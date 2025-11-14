import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

// Plugin to copy manifest and other extension files after build
const chromeExtensionPlugin = () => {
  let savedIcons: { name: string; content: Buffer }[] = []
  
  return {
    name: 'chrome-extension',
    buildStart() {
      // Save existing icon files before build (since emptyOutDir will delete them)
      const distIconsPath = resolve(__dirname, 'dist', 'icons')
      if (existsSync(distIconsPath)) {
        const files = readdirSync(distIconsPath)
        savedIcons = files
          .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.svg') || file.endsWith('.ico'))
          .map(file => ({
            name: file,
            content: require('fs').readFileSync(join(distIconsPath, file))
          }))
      }
    },
    closeBundle() {
      const distPath = resolve(__dirname, 'dist')
      const publicPath = resolve(__dirname, 'public')
      const fs = require('fs')
      
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
      
      // Restore saved icon files
      savedIcons.forEach(icon => {
        const iconPath = join(iconsDir, icon.name)
        fs.writeFileSync(iconPath, icon.content)
      })
      
      // Also copy icons from public/icons if they exist
      const publicIconsPath = resolve(publicPath, 'icons')
      if (existsSync(publicIconsPath)) {
        const publicIconFiles = readdirSync(publicIconsPath)
        publicIconFiles.forEach(file => {
          if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.svg') || file.endsWith('.ico')) {
            const sourcePath = join(publicIconsPath, file)
            const destPath = join(iconsDir, file)
            // Only copy if file doesn't already exist (preserve existing icons)
            if (!existsSync(destPath)) {
              copyFileSync(sourcePath, destPath)
            }
          }
        })
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

