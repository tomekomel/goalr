import { resolve } from 'node:path'
import { readdirSync, existsSync } from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// Collect blog post entries dynamically
function getBlogEntries() {
  const blogDir = resolve(__dirname, 'blog')
  const entries: Record<string, string> = {
    blog: resolve(blogDir, 'index.html'),
  }
  if (existsSync(blogDir)) {
    for (const entry of readdirSync(blogDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const htmlPath = resolve(blogDir, entry.name, 'index.html')
        if (existsSync(htmlPath)) {
          entries[`blog-${entry.name}`] = htmlPath
        }
      }
    }
  }
  return entries
}

// https://vite.dev/config/
export default defineConfig({
  appType: 'mpa',
  plugins: [
    vue(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        landing: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'app/index.html'),
        demo: resolve(__dirname, 'demo/index.html'),
        ...getBlogEntries(),
      },
    },
  },
})
