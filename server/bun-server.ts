/**
 * Standalone Bun HTTP Server for Sproutwood Farm
 * Compatible with `bun run server/bun-server.ts`
 */
import { gameStateManager } from './gameStateManager';

const PORT = Number(process.env.PORT) || 3001;

console.log(`Starting Bun API Server on port ${PORT}...`);

const server = (globalThis as any).Bun ? (globalThis as any).Bun.serve({
  port: PORT,
  async fetch(req: Request) {
    const url = new URL(req.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. GET /api/game
      if (url.pathname === '/api/game' && req.method === 'GET') {
        const state = gameStateManager.getState();
        return new Response(JSON.stringify({ success: true, state }), { headers: corsHeaders });
      }

      // 2. POST /api/game
      if (url.pathname === '/api/game' && req.method === 'POST') {
        const body = await req.json();
        const saved = gameStateManager.setState(body);
        return new Response(JSON.stringify({ success: true, message: 'Game saved', state: saved }), { headers: corsHeaders });
      }

      // 3. POST /api/game/action
      if (url.pathname === '/api/game/action' && req.method === 'POST') {
        const payload = await req.json();
        const result = gameStateManager.processAction(payload);
        const status = result.success ? 200 : 400;
        return new Response(JSON.stringify(result), { status, headers: corsHeaders });
      }

      // 4. POST /api/game/reset
      if (url.pathname === '/api/game/reset' && req.method === 'POST') {
        const fresh = gameStateManager.resetState();
        return new Response(JSON.stringify({ success: true, message: 'Reset completed', state: fresh }), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders });
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, error: err.message || 'Server error' }), { status: 500, headers: corsHeaders });
    }
  },
}) : null;

if (server) {
  console.log(`🌾 Bun REST API running at http://localhost:${server.port}`);
}

export default server;
