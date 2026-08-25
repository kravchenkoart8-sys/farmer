import fs from 'fs';
import path from 'path';
import { CROPS, generateInitialMap, getInitialGameState, UPGRADE_CONFIG } from '../src/constants/gameData';
import { CropType, FarmTile, GameActionPayload, GameActionResponse, GameState, InventoryItem } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'gamestate.json');

class GameStateManager {
  private state: GameState;

  constructor() {
    this.state = this.loadState();
  }

  private ensureDataDir() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (err) {
      console.warn('Could not create data directory, using in-memory state:', err);
    }
  }

  private loadState(): GameState {
    try {
      this.ensureDataDir();
      if (fs.existsSync(STATE_FILE)) {
        const raw = fs.readFileSync(STATE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.farmTiles && parsed.inventory) {
          return parsed as GameState;
        }
      }
    } catch (err) {
      console.warn('Error reading gamestate.json, initializing fresh state:', err);
    }
    const fresh = getInitialGameState();
    this.saveStateToDisk(fresh);
    return fresh;
  }

  private saveStateToDisk(stateToSave: GameState) {
    try {
      this.ensureDataDir();
      stateToSave.lastSaved = new Date().toISOString();
      fs.writeFileSync(STATE_FILE, JSON.stringify(stateToSave, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Error saving gamestate.json to disk:', err);
    }
  }

  public getState(): GameState {
    return this.state;
  }

  public setState(newState: GameState): GameState {
    this.state = {
      ...newState,
      lastSaved: new Date().toISOString(),
    };
    this.saveStateToDisk(this.state);
    return this.state;
  }

  public resetState(): GameState {
    this.state = getInitialGameState();
    this.saveStateToDisk(this.state);
    return this.state;
  }

  public processAction(payload: GameActionPayload): GameActionResponse {
    const s = this.state;
    const { action, tileX, tileY, cropType, itemKey, quantity = 1, upgradeType } = payload;

    const findTile = (x: number, y: number): FarmTile | undefined => {
      return s.farmTiles.find(t => t.x === x && t.y === y);
    };

    switch (action) {
      case 'till': {
        if (tileX === undefined || tileY === undefined) {
          return { success: false, message: 'Invalid tile coordinates' };
        }
        const tile = findTile(tileX, tileY);
        if (!tile) return { success: false, message: 'Tile not found' };
        if (tile.type !== 'soil' && tile.type !== 'grass') {
          return { success: false, message: 'Cannot till this ground type' };
        }
        if (tile.obstacle) {
          return { success: false, message: 'Clear the obstacle first!' };
        }
        tile.type = 'soil';
        tile.tilled = true;
        this.saveStateToDisk(s);
        return { success: true, message: 'Soil tilled!', state: s };
      }

      case 'water': {
        if (tileX === undefined || tileY === undefined) {
          return { success: false, message: 'Invalid tile coordinates' };
        }

        const canLevel = s.upgrades.wateringCanLevel || 1;
        const targetTiles: FarmTile[] = [];

        if (canLevel === 1) {
          const t = findTile(tileX, tileY);
          if (t) targetTiles.push(t);
        } else if (canLevel === 2) {
          // 3-tile line based on player direction
          const dir = s.player.direction;
          for (let i = -1; i <= 1; i++) {
            const tx = dir === 'up' || dir === 'down' ? tileX + i : tileX;
            const ty = dir === 'left' || dir === 'right' ? tileY + i : tileY;
            const t = findTile(tx, ty);
            if (t) targetTiles.push(t);
          }
        } else {
          // 3x3 area
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const t = findTile(tileX + dx, tileY + dy);
              if (t) targetTiles.push(t);
            }
          }
        }

        let wateredAny = false;
        targetTiles.forEach(t => {
          if (t.tilled && !t.watered) {
            t.watered = true;
            wateredAny = true;
            s.stats.wateredCount = (s.stats.wateredCount || 0) + 1;
          }
        });

        if (!wateredAny) {
          // Even if already watered or till is dry, allow visual feedback
          const primary = findTile(tileX, tileY);
          if (primary && primary.tilled) {
            primary.watered = true;
          }
        }

        this.saveStateToDisk(s);
        return { success: true, message: 'Crops watered!', state: s };
      }

      case 'plant': {
        if (tileX === undefined || tileY === undefined || !cropType) {
          return { success: false, message: 'Missing tile or crop seed' };
        }
        const tile = findTile(tileX, tileY);
        if (!tile) return { success: false, message: 'Tile not found' };
        if (!tile.tilled) return { success: false, message: 'Soil must be tilled first!' };
        if (tile.crop) return { success: false, message: 'A crop is already planted here!' };

        // Find seed in inventory
        const seedItem = s.inventory.find(i => i.type === 'seed' && i.cropType === cropType && i.count > 0);
        if (!seedItem) {
          return { success: false, message: `No ${cropType} seeds in inventory!` };
        }

        seedItem.count -= 1;
        if (seedItem.count <= 0) {
          s.inventory = s.inventory.filter(i => i.count > 0 || i.type === 'tool');
        }

        tile.crop = {
          type: cropType,
          dayPlanted: s.day,
          growthProgress: 0,
          currentStage: 0,
          isMature: false,
        };

        s.stats.seedsPlanted = (s.stats.seedsPlanted || 0) + 1;
        this.saveStateToDisk(s);
        return { success: true, message: `Planted ${cropType}!`, state: s };
      }

      case 'harvest': {
        if (tileX === undefined || tileY === undefined) {
          return { success: false, message: 'Invalid tile coordinates' };
        }
        const tile = findTile(tileX, tileY);
        if (!tile || !tile.crop) return { success: false, message: 'No crop to harvest here' };
        if (!tile.crop.isMature) return { success: false, message: 'Crop is not mature yet!' };

        const cropDef = CROPS[tile.crop.type];
        const harvestedType = tile.crop.type;

        // Check max inventory capacity
        const maxSlots = UPGRADE_CONFIG.backpack[Math.min(s.upgrades.backpackLevel - 1, 2)].slots;
        const existingSlot = s.inventory.find(i => i.type === 'crop' && i.cropType === harvestedType);

        if (!existingSlot && s.inventory.length >= maxSlots) {
          return { success: false, message: 'Backpack is full! Upgrade bag or sell items.' };
        }

        if (existingSlot) {
          existingSlot.count += 1;
        } else {
          s.inventory.push({
            id: `crop_${harvestedType}_${Date.now()}`,
            type: 'crop',
            itemKey: `crop_${harvestedType}`,
            name: cropDef.name,
            count: 1,
            cropType: harvestedType,
            sellPrice: cropDef.sellPrice,
            description: `Freshly harvested organic ${cropDef.name}. Ready to sell at shop!`,
          });
        }

        s.stats.cropsHarvested = (s.stats.cropsHarvested || 0) + 1;

        // Handle regrow crops (e.g. Strawberry)
        if (cropDef.regrows) {
          tile.crop.isMature = false;
          tile.crop.growthProgress = 0.5;
          tile.crop.currentStage = Math.max(1, cropDef.stages - 2);
        } else {
          tile.crop = null;
        }

        this.saveStateToDisk(s);
        return {
          success: true,
          message: `Harvested fresh ${cropDef.name}!`,
          state: s,
          harvestedCrop: { type: harvestedType, count: 1, coinsGained: cropDef.sellPrice },
        };
      }

      case 'clear_obstacle': {
        if (tileX === undefined || tileY === undefined) {
          return { success: false, message: 'Invalid tile coordinates' };
        }
        const tile = findTile(tileX, tileY);
        if (!tile || !tile.obstacle) return { success: false, message: 'No obstacle here' };

        const obsName = tile.obstacle;
        tile.obstacle = null;
        tile.type = 'soil';

        this.saveStateToDisk(s);
        return { success: true, message: `Cleared ${obsName}! Ground is now clear soil.`, state: s };
      }

      case 'advance_day': {
        s.day += 1;
        s.stats.daysPlayed += 1;
        s.timeMinutes = 360; // Reset to 6:00 AM
        s.timeOfDay = 'morning';
        s.player.energy = s.player.maxEnergy;

        // Roll new weather: 70% sunny, 20% rainy, 10% breezy
        const rand = Math.random();
        if (rand < 0.2) {
          s.weather = 'rainy';
        } else if (rand < 0.35) {
          s.weather = 'breezy';
        } else {
          s.weather = 'sunny';
        }

        const isRainy = s.weather === 'rainy';
        const hasSprinklers = s.upgrades.hasAutoSprinklers;

        // Progress all crops
        s.farmTiles.forEach(tile => {
          if (isRainy && tile.tilled) {
            tile.watered = true;
          }

          if (hasSprinklers && tile.tilled) {
            tile.watered = true;
          }

          if (tile.crop) {
            const cropDef = CROPS[tile.crop.type];
            if (tile.watered && !tile.crop.isMature) {
              const dailyInc = 1 / cropDef.growthDays;
              tile.crop.growthProgress = Math.min(1, tile.crop.growthProgress + dailyInc);
              tile.crop.currentStage = Math.min(
                cropDef.stages - 1,
                Math.floor(tile.crop.growthProgress * cropDef.stages)
              );
              if (tile.crop.growthProgress >= 1.0) {
                tile.crop.isMature = true;
                tile.crop.currentStage = cropDef.stages - 1;
              }
            }
          }

          // Soil dries up each day unless rainy
          if (!isRainy && !hasSprinklers) {
            tile.watered = false;
          }
        });

        this.saveStateToDisk(s);
        return {
          success: true,
          message: `Day ${s.day} begins! Weather: ${s.weather}.`,
          state: s,
        };
      }

      case 'buy': {
        if (!itemKey) return { success: false, message: 'Item key required' };

        // Look up item in crop seeds
        const seedCrop = Object.values(CROPS).find(c => `seed_${c.id}` === itemKey);
        if (seedCrop) {
          const totalCost = seedCrop.seedPrice * quantity;
          if (s.coins < totalCost) {
            return { success: false, message: `Not enough coins! Need ${totalCost}g` };
          }

          const maxSlots = UPGRADE_CONFIG.backpack[Math.min(s.upgrades.backpackLevel - 1, 2)].slots;
          const existing = s.inventory.find(i => i.itemKey === itemKey);

          if (!existing && s.inventory.length >= maxSlots) {
            return { success: false, message: 'Backpack is full! Upgrade bag or sell items.' };
          }

          s.coins -= totalCost;
          if (existing) {
            existing.count += quantity;
          } else {
            s.inventory.push({
              id: `seed_${seedCrop.id}_${Date.now()}`,
              type: 'seed',
              itemKey: `seed_${seedCrop.id}`,
              name: `${seedCrop.name} Seeds`,
              count: quantity,
              cropType: seedCrop.id,
              buyPrice: seedCrop.seedPrice,
              description: `Plant on tilled soil. Grows in ${seedCrop.growthDays} days.`,
            });
          }

          this.saveStateToDisk(s);
          return { success: true, message: `Purchased ${quantity}x ${seedCrop.name} Seeds!`, state: s };
        }

        return { success: false, message: 'Item not available in shop' };
      }

      case 'sell': {
        if (!itemKey) return { success: false, message: 'Item key required' };
        const itemIndex = s.inventory.findIndex(i => i.itemKey === itemKey && i.type === 'crop');
        if (itemIndex === -1) return { success: false, message: 'Item not found in backpack' };

        const item = s.inventory[itemIndex];
        const sellQty = Math.min(quantity, item.count);
        const unitPrice = item.sellPrice || (item.cropType ? CROPS[item.cropType].sellPrice : 10);
        const earned = unitPrice * sellQty;

        s.coins += earned;
        s.stats.totalEarned = (s.stats.totalEarned || 0) + earned;

        item.count -= sellQty;
        if (item.count <= 0) {
          s.inventory.splice(itemIndex, 1);
        }

        this.saveStateToDisk(s);
        return {
          success: true,
          message: `Sold ${sellQty}x ${item.name} for +${earned}g!`,
          coinsChange: earned,
          state: s,
        };
      }

      case 'sell_all': {
        const cropItems = s.inventory.filter(i => i.type === 'crop' && i.count > 0);
        if (cropItems.length === 0) {
          return { success: false, message: 'No harvested crops to sell!' };
        }

        let totalEarned = 0;
        cropItems.forEach(item => {
          const unitPrice = item.sellPrice || (item.cropType ? CROPS[item.cropType].sellPrice : 10);
          totalEarned += unitPrice * item.count;
        });

        s.coins += totalEarned;
        s.stats.totalEarned = (s.stats.totalEarned || 0) + totalEarned;
        s.inventory = s.inventory.filter(i => i.type !== 'crop');

        this.saveStateToDisk(s);
        return {
          success: true,
          message: `Shipped all crops for +${totalEarned}g!`,
          coinsChange: totalEarned,
          state: s,
        };
      }

      case 'upgrade': {
        if (!upgradeType) return { success: false, message: 'Upgrade type required' };

        if (upgradeType === 'wateringCan') {
          const cur = s.upgrades.wateringCanLevel;
          const next = cur + 1;
          const config = UPGRADE_CONFIG.wateringCan.find(u => u.level === next);
          if (!config) return { success: false, message: 'Watering can already maxed!' };
          if (s.coins < config.cost) return { success: false, message: `Need ${config.cost}g for this upgrade!` };

          s.coins -= config.cost;
          s.upgrades.wateringCanLevel = next;
          this.saveStateToDisk(s);
          return { success: true, message: `Upgraded to ${config.name}!`, state: s };
        }

        if (upgradeType === 'backpack') {
          const cur = s.upgrades.backpackLevel;
          const next = cur + 1;
          const config = UPGRADE_CONFIG.backpack.find(u => u.level === next);
          if (!config) return { success: false, message: 'Backpack already maxed!' };
          if (s.coins < config.cost) return { success: false, message: `Need ${config.cost}g for this upgrade!` };

          s.coins -= config.cost;
          s.upgrades.backpackLevel = next;
          this.saveStateToDisk(s);
          return { success: true, message: `Upgraded to ${config.name} (${config.slots} slots)!`, state: s };
        }

        if (upgradeType === 'moveSpeed') {
          const cur = s.upgrades.moveSpeedLevel;
          const next = cur + 1;
          const config = UPGRADE_CONFIG.moveSpeed.find(u => u.level === next);
          if (!config) return { success: false, message: 'Boots already maxed!' };
          if (s.coins < config.cost) return { success: false, message: `Need ${config.cost}g for this upgrade!` };

          s.coins -= config.cost;
          s.upgrades.moveSpeedLevel = next;
          this.saveStateToDisk(s);
          return { success: true, message: `Equipped ${config.name}!`, state: s };
        }

        if (upgradeType === 'sprinklers') {
          if (s.upgrades.hasAutoSprinklers) return { success: false, message: 'Sprinklers already installed!' };
          const cost = UPGRADE_CONFIG.sprinklers.cost;
          if (s.coins < cost) return { success: false, message: `Need ${cost}g for sprinklers!` };

          s.coins -= cost;
          s.upgrades.hasAutoSprinklers = true;
          this.saveStateToDisk(s);
          return { success: true, message: 'Auto-Sprinkler Kit installed! Crops will auto-water every morning.', state: s };
        }

        return { success: false, message: 'Unknown upgrade type' };
      }

      default:
        return { success: false, message: 'Unknown action' };
    }
  }
}

export const gameStateManager = new GameStateManager();
