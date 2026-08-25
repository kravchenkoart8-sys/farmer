import { getInitialGameState } from '../constants/gameData';
import { GameActionPayload, GameActionResponse, GameState } from '../types';

const API_BASE = '/api';

export async function fetchGameState(): Promise<GameState> {
  try {
    const res = await fetch(`${API_BASE}/game`);
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data = await res.json();
    if (data.success && data.state) {
      return data.state as GameState;
    }
    throw new Error(data.message || 'Failed to fetch state');
  } catch (err) {
    console.warn('API fetch failed, checking localStorage fallback:', err);
    try {
      const local = localStorage.getItem('sproutwood_gamestate_fallback');
      if (local) {
        return JSON.parse(local) as GameState;
      }
    } catch {}
    return getInitialGameState();
  }
}

export async function saveGameState(state: GameState): Promise<GameState> {
  try {
    // Save to localStorage as immediate client fallback
    try {
      localStorage.setItem('sproutwood_gamestate_fallback', JSON.stringify(state));
    } catch {}

    const res = await fetch(`${API_BASE}/game`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data = await res.json();
    if (data.success && data.state) {
      return data.state as GameState;
    }
    return state;
  } catch (err) {
    console.warn('API save warning:', err);
    return state;
  }
}

export async function executeAction(payload: GameActionPayload): Promise<GameActionResponse> {
  try {
    const res = await fetch(`${API_BASE}/game/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as GameActionResponse;
    if (data.state) {
      try {
        localStorage.setItem('sproutwood_gamestate_fallback', JSON.stringify(data.state));
      } catch {}
    }
    return data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Action request failed';
    return {
      success: false,
      message: msg,
    };
  }
}

export async function resetGame(): Promise<GameState> {
  try {
    localStorage.removeItem('sproutwood_gamestate_fallback');
    const res = await fetch(`${API_BASE}/game/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (data.success && data.state) {
      return data.state as GameState;
    }
  } catch (err) {
    console.warn('Reset request error:', err);
  }
  return getInitialGameState();
}
