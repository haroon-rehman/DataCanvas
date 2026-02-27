import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** API middleware plugin — runs before Vite core so /api/* is handled before SPA fallback */
function tileLayoutApiPlugin() {
  const configDir = path.join(__dirname, 'public', 'config')
  const tileLayoutsDir = path.join(__dirname, 'public', 'config', 'tilelayouts')
  const dashboardsDir = path.join(__dirname, 'public', 'config', 'dashboards')
  const apiMiddleware = (req, res, next) => {
    const url = req.url?.split('?')[0] ?? ''
    const isApi = ['/api/health', '/api/tile-layouts', '/api/save-tile-layout', '/api/dashboards', '/api/save-dashboard'].includes(url) ||
      (req.method === 'DELETE' && (url.startsWith('/api/tile-layouts/') || url.startsWith('/api/dashboards/')))
    if (!isApi) return next()

    if (url === '/api/health') {
      if (req.method !== 'GET') {
        res.writeHead(405, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Method not allowed' }))
        return
      }
      console.log('[DataCanvas] Health API accessed')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'datacanvas',
      }))
      return
    }

    if (req.method === 'DELETE' && url.startsWith('/api/tile-layouts/')) {
      const id = decodeURIComponent(url.replace(/^\/api\/tile-layouts\//, ''))
      if (!id) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'id required' }))
        return
      }
      try {
        const newPath = path.join(tileLayoutsDir, `${id}.json`)
        const legacyPath = path.join(configDir, `${id}.json`)
        const filePath = fs.existsSync(newPath) ? newPath : legacyPath
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: true }))
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Not found' }))
        }
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: e.message }))
      }
      return
    }

    if (req.method === 'DELETE' && url.startsWith('/api/dashboards/')) {
      const id = decodeURIComponent(url.replace(/^\/api\/dashboards\//, ''))
      if (!id) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'id required' }))
        return
      }
      try {
        const filePath = path.join(dashboardsDir, `${id}.json`)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: true }))
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Not found' }))
        }
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: e.message }))
      }
      return
    }

    if (url === '/api/tile-layouts') {
      if (req.method !== 'GET') {
        res.writeHead(405, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Method not allowed' }))
        return
      }
      try {
        const layoutsById = new Map()
        const readFromDir = (dir) => {
          if (!fs.existsSync(dir)) return
          const files = fs.readdirSync(dir)
          for (const file of files) {
            if (!file.endsWith('.json')) continue
            const filePath = path.join(dir, file)
            const stat = fs.statSync(filePath)
            try {
              const content = JSON.parse(fs.readFileSync(filePath, 'utf8'))
              if (!content.layout) continue
              const id = content.id || file.replace(/\.json$/, '')
              // Prefer tilelayouts/ over legacy config root if both exist.
              if (!layoutsById.has(id) || dir === tileLayoutsDir) {
                layoutsById.set(id, {
                  id,
                  label: content.label || id,
                  description: content.description || '',
                  created: content.created || stat.birthtime?.toISOString?.() || null,
                  updated: content.updated || stat.mtime?.toISOString?.() || null,
                })
              }
            } catch { /* skip */ }
          }
        }
        readFromDir(configDir) // legacy support
        readFromDir(tileLayoutsDir)
        const layouts = Array.from(layoutsById.values())
        layouts.sort((a, b) => (b.updated || '').localeCompare(a.updated || ''))
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(layouts))
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: e.message }))
      }
      return
    }

    if (url === '/api/save-tile-layout') {
      if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Method not allowed' }))
        return
      }
      let body = ''
      req.on('data', (chunk) => { body += chunk })
      req.on('end', () => {
        try {
          const data = JSON.parse(body)
          const { id, label, description, layout } = data
          if (!id || !layout) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'id and layout are required' }))
            return
          }
          if (!fs.existsSync(tileLayoutsDir)) fs.mkdirSync(tileLayoutsDir, { recursive: true })
          const now = new Date().toISOString()
          let created = now
          const filePath = path.join(tileLayoutsDir, `${id}.json`)
          if (fs.existsSync(filePath)) {
            try {
              const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'))
              created = existing.created || created
            } catch { /* use defaults */ }
          } else {
            // Legacy support: preserve original created time if the layout exists in old location.
            const legacyPath = path.join(configDir, `${id}.json`)
            if (fs.existsSync(legacyPath)) {
              try {
                const existing = JSON.parse(fs.readFileSync(legacyPath, 'utf8'))
                created = existing.created || created
              } catch { /* use defaults */ }
            }
          }
          const payload = { id, label: label || '', description: description || '', created, updated: now, layout }
          fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8')
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: true, filename: `${id}.json` }))
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: e.message }))
        }
      })
      return
    }

    if (url === '/api/dashboards') {
      if (req.method !== 'GET') {
        res.writeHead(405, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Method not allowed' }))
        return
      }
      try {
        const dashboards = []
        if (fs.existsSync(dashboardsDir)) {
          const files = fs.readdirSync(dashboardsDir)
          for (const file of files) {
            if (!file.endsWith('.json')) continue
            const filePath = path.join(dashboardsDir, file)
            const stat = fs.statSync(filePath)
            try {
              const content = JSON.parse(fs.readFileSync(filePath, 'utf8'))
              if (!content.widgets) continue
              const id = content.id || file.replace(/\.json$/, '')
              dashboards.push({
                id,
                label: content.label || id,
                description: content.description || '',
                created: content.created || stat.birthtime?.toISOString?.() || null,
                updated: content.updated || stat.mtime?.toISOString?.() || null,
              })
            } catch { /* skip */ }
          }
          dashboards.sort((a, b) => (b.updated || '').localeCompare(a.updated || ''))
        }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(dashboards))
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: e.message }))
      }
      return
    }

    if (url === '/api/save-dashboard') {
      if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Method not allowed' }))
        return
      }
      let body = ''
      req.on('data', (chunk) => { body += chunk })
      req.on('end', () => {
        try {
          const data = JSON.parse(body)
          const { id, label, description, widgets, gridOptions } = data
          if (!id || !Array.isArray(widgets)) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'id and widgets are required' }))
            return
          }
          if (!fs.existsSync(dashboardsDir)) fs.mkdirSync(dashboardsDir, { recursive: true })
          const now = new Date().toISOString()
          let created = now
          const filePath = path.join(dashboardsDir, `${id}.json`)
          if (fs.existsSync(filePath)) {
            try {
              const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'))
              created = existing.created || created
            } catch { /* use defaults */ }
          }
          const payload = {
            id,
            label: label || '',
            description: description || '',
            created,
            updated: now,
            widgets,
            gridOptions: gridOptions || {},
          }
          fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8')
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: true, filename: `${id}.json` }))
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: e.message }))
        }
      })
      return
    }

    next()
  }
  return {
    name: 'tile-layout-api',
    enforce: 'pre',
    configureServer(server) {
      // Prepend so API runs before Vite's SPA fallback (index.html for unknown paths)
      server.middlewares.stack.unshift({ route: '', handle: apiMiddleware })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true, // Listen on all interfaces (localhost + machine IP)
  },
  plugins: [
    tileLayoutApiPlugin(),
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue3-calendar-heatmap': path.join(__dirname, 'node_modules/vue3-calendar-heatmap'),
    },
  },
})
