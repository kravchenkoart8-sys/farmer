import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { gameStateManager } from './server/gameStateManager';
import { GameActionPayload, GameState } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Standard JSON body parsing
  app.use(express.json());

  // REST API Routes
  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 2. GET /api/game - Return current player state
  app.get('/api/game', (req, res) => {
    try {
      const state = gameStateManager.getState();
      res.json({ success: true, state });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      res.status(500).json({ success: false, error: msg });
    }
  });

  // 3. POST /api/game - Save player state directly
  app.post('/api/game', (req, res) => {
    try {
      const newState = req.body as GameState;
      if (!newState || !newState.farmTiles) {
        res.status(400).json({ success: false, message: 'Invalid game state payload' });
        return;
      }
      const saved = gameStateManager.setState(newState);
      res.json({ success: true, message: 'Game saved successfully', state: saved });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      res.status(500).json({ success: false, error: msg });
    }
  });

  // 4. POST /api/game/action - Execute a game action on server
  app.post('/api/game/action', (req, res) => {
    try {
      const payload = req.body as GameActionPayload;
      if (!payload || !payload.action) {
        res.status(400).json({ success: false, message: 'Missing action field' });
        return;
      }
      const result = gameStateManager.processAction(payload);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      res.status(500).json({ success: false, error: msg });
    }
  });

  // 5. POST /api/game/reset - Reset the game to fresh state
  app.post('/api/game/reset', (req, res) => {
    try {
      const fresh = gameStateManager.resetState();
      res.json({ success: true, message: 'Game state reset to day 1', state: fresh });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      res.status(500).json({ success: false, error: msg });
    }
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌾 Sproutwood Farm Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
