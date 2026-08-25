# 🌾 Sproutwood Farm - Cozy Farming Simulator

A charming, casual browser farming simulator inspired by the cozy feeling of countryside life, crafted with original visuals, characters, procedural pixel art, and audio synthesis.

## 🌟 Features

- **Core Farming Loop**: Till fertile soil, plant diverse seeds, water daily, and harvest mature crops.
- **Crop Variety**: Turnips, Sweet Carrots, Vine Tomatoes, Heavy Pumpkins, Regrowable Strawberries, and Golden Corn.
- **Dynamic Time & Weather**: Day/night cycle (Morning, Midday, Evening, Night) with Sunny, Rainy (auto-waters crops!), and Breezy conditions.
- **Village Economy & Shop**: Buy seeds and sell harvested produce at Barnaby's General Store.
- **Progression & Upgrades**: Upgrade your Watering Can (3-tile line / 3x3 grid), expand your Backpack capacity, equip Swift Boots for faster movement, and install Auto-Sprinklers.
- **Audio Synthesizer**: 100% self-contained Web Audio procedural sound effects (watering, tilling, planting, sparkling harvest arpeggios, morning rooster chords, coin clinks). Muted by default with toggle.
- **Cross-Platform Controls**: Responsive desktop WASD / Arrow keys + hotkeys (1-8), mouse clicking/targeting, and mobile touch D-Pad with action buttons.
- **Full Backend Persistence**: REST API with atomic actions and server-side JSON state persistence in `data/gamestate.json`.

---

## 🚀 Getting Started

### Option 1: Standard Full-Stack (Express + Vite)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Opens on `http://localhost:3000`.

3. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

### Option 2: Bun Backend Setup

You can also run the backend directly with Bun:

1. **Install Bun packages**:
   ```bash
   bun install
   ```

2. **Start the Bun REST API**:
   ```bash
   bun run server/bun-server.ts
   ```

---

## 📡 REST API Endpoints

- `GET /api/game`: Returns the current full player game state.
- `POST /api/game`: Persists updated player game state to `data/gamestate.json`.
- `POST /api/game/action`: Performs validated atomic actions:
  - `till`: Tills grass or soil into planting ground.
  - `water`: Waters crops with upgrade radius support.
  - `plant`: Consumes seeds and places crop.
  - `harvest`: Gathers mature crops into inventory.
  - `clear_obstacle`: Removes rocks, weeds, and stumps.
  - `advance_day`: Advances day, grows watered crops, and rolls new weather.
  - `buy` / `sell` / `sell_all`: Handles shop transactions and economy.
  - `upgrade`: Applies tools and backpack upgrades.
- `POST /api/game/reset`: Resets farm back to Day 1.

---

## 🎮 Controls

| Action | Desktop Keyboard / Mouse | Mobile Touch |
|---|---|---|
| **Move Farmer** | `W`, `A`, `S`, `D` or Arrow Keys | On-screen Touch D-Pad |
| **Use Tool / Plant / Harvest** | `Spacebar`, `E`, `Enter`, or Click Tile | Tap tile or press `ACTION` button |
| **Select Hotbar Item** | Number keys `1` to `8` or Click slot | Tap hotbar slot |
| **Open Bag / Inventory** | `B` or HUD Bag icon | HUD Bag button |
