import { CropDefinition, CropType, FarmTile, GameState, InventoryItem, Upgrades } from '../types';

export const CROPS: Record<CropType, CropDefinition> = {
  turnip: {
    id: 'turnip',
    name: 'Turnip',
    seedPrice: 10,
    sellPrice: 24,
    growthDays: 2,
    stages: 3,
    description: 'Crisp and quick-growing root vegetable. Perfect for beginner farmers.',
    color: '#e27b9c',
    exp: 5,
  },
  carrot: {
    id: 'carrot',
    name: 'Carrot',
    seedPrice: 18,
    sellPrice: 44,
    growthDays: 3,
    stages: 4,
    description: 'Sweet and crunchy orange root. Thrives in well-watered soil.',
    color: '#ff8827',
    exp: 10,
  },
  tomato: {
    id: 'tomato',
    name: 'Tomato',
    seedPrice: 32,
    sellPrice: 78,
    growthDays: 4,
    stages: 4,
    description: 'Juicy, sun-ripened red vine fruit. High market value.',
    color: '#e73838',
    exp: 16,
  },
  pumpkin: {
    id: 'pumpkin',
    name: 'Pumpkin',
    seedPrice: 50,
    sellPrice: 135,
    growthDays: 5,
    stages: 4,
    description: 'Prized heavy autumn gourd. Requires patience but yields massive profit.',
    color: '#f39c12',
    exp: 28,
  },
  strawberry: {
    id: 'strawberry',
    name: 'Strawberry',
    seedPrice: 70,
    sellPrice: 180,
    growthDays: 4,
    stages: 4,
    regrows: true,
    regrowDays: 2,
    description: 'Delightful ruby berry. Continues to regrow every 2 days after first harvest!',
    color: '#ff3366',
    exp: 35,
  },
  corn: {
    id: 'corn',
    name: 'Sweet Corn',
    seedPrice: 42,
    sellPrice: 105,
    growthDays: 4,
    stages: 4,
    description: 'Tall golden stalks with sweet kernels loved by all villagers.',
    color: '#f1c40f',
    exp: 22,
  },
};

export const UPGRADE_CONFIG = {
  wateringCan: [
    { level: 1, name: 'Basic Can', cost: 0, desc: 'Waters 1 tile in front of you.' },
    { level: 2, name: 'Copper Can', cost: 150, desc: 'Waters 3 tiles in a line ahead.' },
    { level: 3, name: 'Gold Can', cost: 450, desc: 'Waters a full 3x3 (9 tiles) area instantly!' },
  ],
  backpack: [
    { level: 1, name: 'Small Pouch', cost: 0, slots: 8, desc: 'Holds 8 inventory items.' },
    { level: 2, name: 'Adventurer Pack', cost: 180, slots: 14, desc: 'Expanded bag with 14 inventory slots.' },
    { level: 3, name: 'Hiker Rucksack', cost: 400, slots: 20, desc: 'Large canvas rucksack with 20 slots.' },
  ],
  moveSpeed: [
    { level: 1, name: 'Work Boots', cost: 0, multiplier: 1.0, desc: 'Standard farm footwear.' },
    { level: 2, name: 'Swift Leather Shoes', cost: 120, multiplier: 1.35, desc: 'Increases movement speed by 35%.' },
    { level: 3, name: 'Windrunner Boots', cost: 320, multiplier: 1.7, desc: 'Increases movement speed by 70%.' },
  ],
  sprinklers: {
    cost: 350,
    name: 'Auto-Sprinkler Kit',
    desc: 'Automatically waters adjacent 4 tiles around each tilled plot every morning!',
  },
};

export const MAP_WIDTH = 18;
export const MAP_HEIGHT = 14;
export const TILE_SIZE = 32; // In canvas render pixels

export function generateInitialMap(): FarmTile[] {
  const tiles: FarmTile[] = [];

  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const id = `${x}_${y}`;
      let type: FarmTile['type'] = 'grass';
      let tilled = false;
      let watered = false;
      let obstacle: FarmTile['obstacle'] = null;

      // 1. House footprint (Top-Left: x 1..4, y 1..3)
      if (x >= 1 && x <= 4 && y >= 1 && y <= 3) {
        type = 'house';
      }
      // 2. Shipping Bin & Mailbox (x 6..7, y 1)
      else if (x === 6 && y === 1) {
        type = 'shipping_bin';
      }
      // 3. Pond on the bottom left (x 1..4, y 8..11)
      else if (x >= 1 && x <= 4 && y >= 8 && y <= 11) {
        type = 'water';
      }
      // Pond edge / well
      else if (x === 5 && y === 9) {
        type = 'well';
      }
      // 4. Main stone/dirt pathway
      else if (
        (x === 3 && y >= 4 && y <= 7) || // Path down from house
        (y === 5 && x >= 3 && x <= 16) || // Cross pathway
        (x === 10 && y >= 1 && y <= 12)   // Vertical pathway
      ) {
        type = 'path';
      }
      // 5. Trees along borders
      else if (
        (y === 0 && x % 2 === 0) ||
        (x === MAP_WIDTH - 1 && y % 3 === 0) ||
        (x === 0 && y >= 4 && y <= 7)
      ) {
        type = 'tree';
      }
      // 6. Natural tillable crop plots in main field
      else if (
        (x >= 5 && x <= 9 && y >= 2 && y <= 4) ||
        (x >= 11 && x <= 16 && y >= 1 && y <= 4) ||
        (x >= 5 && x <= 9 && y >= 6 && y <= 12) ||
        (x >= 11 && x <= 16 && y >= 6 && y <= 12)
      ) {
        type = 'soil';
        // Pre-till a starter patch for instant fun
        if (x >= 6 && x <= 8 && y >= 2 && y <= 3) {
          tilled = true;
        }
        // Random obstacles to clear
        if ((x === 8 && y === 8) || (x === 14 && y === 3) || (x === 12 && y === 10)) {
          obstacle = 'rock';
        } else if ((x === 7 && y === 11) || (x === 15 && y === 7)) {
          obstacle = 'weed';
        } else if (x === 13 && y === 9) {
          obstacle = 'stump';
        }
      }
      // 7. Decorative rocks/flowers around grass
      else {
        type = 'grass';
        if (x === 0 && y === 12) obstacle = 'rock';
        if (x === 17 && y === 13) obstacle = 'weed';
      }

      tiles.push({
        id,
        x,
        y,
        type,
        tilled,
        watered,
        crop: null,
        obstacle,
      });
    }
  }

  // Add 1-2 starter planted turnips ready to water/grow
  const starter1 = tiles.find(t => t.x === 6 && t.y === 2);
  if (starter1) {
    starter1.tilled = true;
    starter1.watered = true;
    starter1.crop = {
      type: 'turnip',
      dayPlanted: 1,
      growthProgress: 0.5,
      currentStage: 1,
      isMature: false,
    };
  }

  const starter2 = tiles.find(t => t.x === 7 && t.y === 2);
  if (starter2) {
    starter2.tilled = true;
    starter2.watered = true;
    starter2.crop = {
      type: 'turnip',
      dayPlanted: 1,
      growthProgress: 1.0,
      currentStage: 2,
      isMature: true, // Ready to harvest on start to showcase the joy of farming!
    };
  }

  return tiles;
}

export function getInitialInventory(): InventoryItem[] {
  return [
    {
      id: 'tool_hoe',
      type: 'tool',
      itemKey: 'hoe',
      name: 'Farmer Hoe',
      count: 1,
      description: 'Till dirt into rich soil for planting, or clear wild weeds.',
    },
    {
      id: 'tool_water_can',
      type: 'tool',
      itemKey: 'water_can',
      name: 'Watering Can',
      count: 1,
      description: 'Water tilled soil every day so your crops can grow big and healthy.',
    },
    {
      id: 'tool_scythe',
      type: 'tool',
      itemKey: 'scythe',
      name: 'Harvest Scythe',
      count: 1,
      description: 'Quickly harvest mature crops or clear stubborn field stumps.',
    },
    {
      id: 'seed_turnip',
      type: 'seed',
      itemKey: 'seed_turnip',
      name: 'Turnip Seeds',
      count: 5,
      cropType: 'turnip',
      buyPrice: 10,
      description: 'Plant on tilled soil. Grows in 2 days.',
    },
    {
      id: 'seed_carrot',
      type: 'seed',
      itemKey: 'seed_carrot',
      name: 'Carrot Seeds',
      count: 3,
      cropType: 'carrot',
      buyPrice: 18,
      description: 'Plant on tilled soil. Sweet root, grows in 3 days.',
    },
    {
      id: 'seed_tomato',
      type: 'seed',
      itemKey: 'seed_tomato',
      name: 'Tomato Seeds',
      count: 2,
      cropType: 'tomato',
      buyPrice: 32,
      description: 'Plant on tilled soil. Juicy vines, grows in 4 days.',
    },
  ];
}

export function getInitialGameState(): GameState {
  return {
    player: {
      name: 'Farmer Willow',
      energy: 100,
      maxEnergy: 100,
      x: 3.5 * TILE_SIZE, // Center in front of house
      y: 4.5 * TILE_SIZE,
      direction: 'down',
    },
    coins: 75, // Starting coins
    inventory: getInitialInventory(),
    selectedSlot: 0,
    farmTiles: generateInitialMap(),
    mapWidth: MAP_WIDTH,
    mapHeight: MAP_HEIGHT,
    day: 1,
    timeMinutes: 360, // 6:00 AM
    timeOfDay: 'morning',
    weather: 'sunny',
    upgrades: {
      wateringCanLevel: 1,
      backpackLevel: 1,
      moveSpeedLevel: 1,
      hasAutoSprinklers: false,
      unlockedPlots: 1,
    },
    stats: {
      cropsHarvested: 0,
      totalEarned: 0,
      daysPlayed: 1,
      seedsPlanted: 0,
      wateredCount: 0,
    },
    tutorialCompleted: false,
    lastSaved: new Date().toISOString(),
  };
}
