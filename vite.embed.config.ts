// vite.embed.config.ts - 嵌入式版本构建配置
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-embed',
    rollupOptions: {
      input: {
        embed: 'embed.html'
      },
      output: {
        // 确保文件名一致，方便缓存
        entryFileNames: 'assets/embed-[hash].js',
        chunkFileNames: 'assets/embed-chunk-[hash].js',
        assetFileNames: 'assets/embed-[hash].[ext]'
      }
    },
    // 允许在 iframe 中使用
    assetsDir: 'assets'
  },
  // 开发服务器配置
  server: {
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'Content-Security-Policy': "frame-ancestors *"
    }
  },
  // 生产环境也需要这些头部
  preview: {
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'Content-Security-Policy': "frame-ancestors *"
    }
  }
})