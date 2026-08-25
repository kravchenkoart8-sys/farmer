export type CropType = 'turnip' | 'carrot' | 'tomato' | 'pumpkin' | 'strawberry' | 'corn';

export interface CropDefinition {
  id: CropType;
  name: string;
  seedPrice: number;
  sellPrice: number;
  growthDays: number;
  stages: number; // usually 3 or 4 stages (0: seed, 1: sprout, 2: growing, 3: mature)
  description: string;
  regrows?: boolean;
  regrowDays?: number;
  color: string;
  exp: number;
}

export type TileType = 
  | 'grass' 
  | 'soil' 
  | 'water' 
  | 'path' 
  | 'fence' 
  | 'house' 
  | 'tree' 
  | 'rock' 
  | 'well' 
  | 'pond_edge'
  | 'shipping_bin'
  | 'decor';

export interface PlantedCrop {
  type: CropType;
  dayPlanted: number;
  growthProgress: number; // 0 to 1 float or current days grown
  currentStage: number;   // 0 to maxStage
  isMature: boolean;
  fertilized?: boolean;
}

export interface FarmTile {
  id: string;
  x: number; // Grid tile coordinate (0 to mapWidth - 1)
  y: number; // Grid tile coordinate (0 to mapHeight - 1)
  type: TileType;
  tilled: boolean;
  watered: boolean;
  crop: PlantedCrop | null;
  obstacle?: 'rock' | 'weed' | 'stump' | null;
  sprinkler?: boolean;
}

export type ToolType = 
  | 'hoe' 
  | 'water_can' 
  | 'scythe' 
  | 'seed' 
  | 'fertilizer' 
  | 'hand';

export type Weather = 'sunny' | 'rainy' | 'breezy';
export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

export interface InventoryItem {
  id: string;
  type: 'tool' | 'seed' | 'crop' | 'fertilizer' | 'special';
  itemKey: string;
  name: string;
  count: number;
  cropType?: CropType;
  description: string;
  sellPrice?: number;
  buyPrice?: number;
  icon?: string;
}

export interface Upgrades {
  wateringCanLevel: number; // 1: standard, 2: copper (3-tile line), 3: gold (3x3 grid)
  backpackLevel: number;    // 1: 8 slots, 2: 14 slots, 3: 20 slots
  moveSpeedLevel: number;   // 1: normal, 2: swift (1.3x), 3: sprint (1.6x)
  hasAutoSprinklers: boolean;
  unlockedPlots: number;    // 1: standard (12x10), 2: large (16x12)
}

export interface PlayerStats {
  cropsHarvested: number;
  totalEarned: number;
  daysPlayed: number;
  seedsPlanted: number;
  wateredCount: number;
}

export interface GameState {
  player: {
    name: string;
    energy: number;
    maxEnergy: number;
    x: number; // canvas pixel position
    y: number;
    direction: 'down' | 'up' | 'left' | 'right';
  };
  coins: number;
  inventory: InventoryItem[];
  selectedSlot: number;
  farmTiles: FarmTile[];
  mapWidth: number;
  mapHeight: number;
  day: number;
  timeMinutes: number; // 360 (6:00 AM) to 1440 (24:00)
  timeOfDay: TimeOfDay;
  weather: Weather;
  upgrades: Upgrades;
  stats: PlayerStats;
  tutorialCompleted: boolean;
  lastSaved?: string;
}

export interface GameActionPayload {
  action: 
    | 'till' 
    | 'water' 
    | 'plant' 
    | 'harvest' 
    | 'clear_obstacle' 
    | 'advance_day' 
    | 'buy' 
    | 'sell' 
    | 'sell_all'
    | 'upgrade'
    | 'move_item'
    | 'refill_water';
  tileX?: number;
  tileY?: number;
  cropType?: CropType;
  itemKey?: string;
  quantity?: number;
  slotIndex?: number;
  targetSlotIndex?: number;
  upgradeType?: 'wateringCan' | 'backpack' | 'moveSpeed' | 'sprinklers';
}

export interface GameActionResponse {
  success: boolean;
  message: string;
  state?: GameState;
  harvestedCrop?: { type: CropType; count: number; coinsGained?: number };
  coinsChange?: number;
}
