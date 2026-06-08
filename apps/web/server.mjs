// Production SSR server for BIGHEAD web.
// Serves the TanStack Start fetch handler over Node via @hono/node-server.
// Static assets in dist/client are served by nginx in front of this process
// (try_files $uri @ssr); this server only handles SSR + server functions.
import { serve } from '@hono/node-server'
import handler from './dist/server/server.js'

const port = Number(process.env.PORT || 3050)
const hostname = process.env.HOST || '127.0.0.1'

serve({ fetch: (request) => handler.fetch(request), port, hostname }, (info) => {
  console.log(`[bighead-web] SSR listening on http://${info.address}:${info.port}`)
})
