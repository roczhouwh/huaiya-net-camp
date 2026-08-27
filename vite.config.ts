import { defineConfig } from 'vite'

// base: './' 相对路径，纯静态托管任意子路径均可访问
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})