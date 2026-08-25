import React, { useState, useEffect, useCallback } from 'react';
import { FarmCanvas } from './components/FarmCanvas';
import { GameHUD } from './components/GameHUD';
import { Hotbar } from './components/Hotbar';
import { ShopModal } from './components/ShopModal';
import { InventoryModal } from './components/InventoryModal';
import { UpgradesModal } from './components/UpgradesModal';
import { DaySummaryModal } from './components/DaySummaryModal';
import { SettingsModal } from './components/SettingsModal';
import { TutorialGuide } from './components/TutorialGuide';
import { MobileControls } from './components/MobileControls';
import { ToastContainer, ToastMessage } from './components/ToastNotification';
import { getInitialGameState } from './constants/gameData';
import { executeAction, fetchGameState, resetGame, saveGameState } from './services/api';
import { CropType, GameState, ToolType } from './types';
import { soundManager } from './utils/audio';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(getInitialGameState());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundManager.isEnabled());

  // Modal States
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isUpgradesOpen, setIsUpgradesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isDaySummaryOpen, setIsDaySummaryOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev.slice(-3), { id, message, type, title }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch initial state from backend API on mount
  useEffect(() => {
    async function init() {
      try {
        const state = await fetchGameState();
        setGameState(state);
        if (!state.tutorialCompleted) {
          setIsTutorialOpen(true);
        }
      } catch (err) {
        console.error('Initial state fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // Toggle Sound
  const handleToggleSound = () => {
    const enabled = soundManager.toggleSound();
    setSoundEnabled(enabled);
    addToast(enabled ? 'Sound FX enabled 🔊' : 'Sound FX muted 🔇', 'info');
  };

  // Select hotbar slot via 1-8 keys or click
  const handleSelectSlot = (index: number) => {
    if (index >= 0 && index < gameState.inventory.length) {
      setGameState(prev => ({ ...prev, selectedSlot: index }));
    }
  };

  // Keyboard shortcut listener for slots 1-8
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 8) {
        handleSelectSlot(num - 1);
      } else if (e.key.toLowerCase() === 'b' || e.key.toLowerCase() === 'i') {
        setIsInventoryOpen(prev => !prev);
      } else if (e.key.toLowerCase() === 'm' || e.key.toLowerCase() === 's') {
        // Toggle shop
        if (e.key.toLowerCase() === 's' && !e.ctrlKey) {
          // let normal movement happen for 's' unless modifier
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.inventory.length]);

  // Determine current active tool / seed
  const selectedItem = gameState.inventory[gameState.selectedSlot] || null;
  let activeTool: ToolType | 'seed' | 'crop' | 'fertilizer' | 'none' = 'none';
  let activeCropType: CropType | undefined = undefined;

  if (selectedItem) {
    if (selectedItem.type === 'tool') {
      activeTool = selectedItem.itemKey as ToolType;
    } else if (selectedItem.type === 'seed') {
      activeTool = 'seed';
      activeCropType = selectedItem.cropType;
    } else if (selectedItem.type === 'crop') {
      activeTool = 'crop';
      activeCropType = selectedItem.cropType;
    }
  }

  // Farm Tile Action Executor (Till, Water, Plant, Harvest, Obstacles)
  const handleTileAction = useCallback(async (tileX: number, tileY: number) => {
    const tile = gameState.farmTiles.find(t => t.x === tileX && t.y === tileY);
    if (!tile) return;

    setIsActionLoading(true);

    // 1. If tile has an obstacle, clear it with Hoe/Scythe
    if (tile.obstacle) {
      const res = await executeAction({
        action: 'clear_obstacle',
        tileX,
        tileY,
      });
      if (res.success && res.state) {
        setGameState(res.state);
        soundManager.playClear();
        addToast(res.message, 'success');
      } else {
        addToast(res.message, 'warning');
      }
      setIsActionLoading(false);
      return;
    }

    // 2. If tile has a mature crop ready to harvest, harvest it!
    if (tile.crop && tile.crop.isMature) {
      const res = await executeAction({
        action: 'harvest',
        tileX,
        tileY,
      });
      if (res.success && res.state) {
        setGameState(res.state);
        soundManager.playHarvest();
        addToast(res.message, 'harvest', '✨ Harvest Success!');
      } else {
        addToast(res.message, 'warning');
      }
      setIsActionLoading(false);
      return;
    }

    // 3. If holding Hoe, till the soil
    if (activeTool === 'hoe') {
      if (tile.type !== 'soil' && tile.type !== 'grass') {
        addToast('Cannot till this ground type', 'warning');
        setIsActionLoading(false);
        return;
      }
      const res = await executeAction({
        action: 'till',
        tileX,
        tileY,
      });
      if (res.success && res.state) {
        setGameState(res.state);
        soundManager.playTill();
      } else {
        addToast(res.message, 'warning');
      }
      setIsActionLoading(false);
      return;
    }

    // 4. If holding Watering Can, water the crops
    if (activeTool === 'water_can') {
      if (!tile.tilled) {
        addToast('Till the soil first before watering', 'info');
        setIsActionLoading(false);
        return;
      }
      const res = await executeAction({
        action: 'water',
        tileX,
        tileY,
      });
      if (res.success && res.state) {
        setGameState(res.state);
        soundManager.playWater();
      } else {
        addToast(res.message, 'warning');
      }
      setIsActionLoading(false);
      return;
    }

    // 5. If holding Seeds, plant them on tilled soil
    if (activeTool === 'seed' && activeCropType) {
      if (!tile.tilled) {
        addToast('Soil must be tilled with a Hoe first!', 'warning');
        setIsActionLoading(false);
        return;
      }
      if (tile.crop) {
        addToast('A crop is already planted here', 'info');
        setIsActionLoading(false);
        return;
      }
      const res = await executeAction({
        action: 'plant',
        tileX,
        tileY,
        cropType: activeCropType,
      });
      if (res.success && res.state) {
        setGameState(res.state);
        soundManager.playPlant();
        addToast(res.message, 'success');
      } else {
        addToast(res.message, 'warning');
      }
      setIsActionLoading(false);
      return;
    }

    // 6. If clicking a tilled soil with nothing selected, remind user to select seeds or water
    if (tile.tilled && !tile.crop) {
      addToast('Select seeds from hotbar (1-8) and click here to plant!', 'info');
    } else if (tile.crop && !tile.crop.isMature) {
      addToast(
        `${tile.crop.type.toUpperCase()}: Growing (Stage ${tile.crop.currentStage + 1}). Water it daily!`,
        'info'
      );
    } else {
      addToast('Select a tool from your hotbar (Hoe, Can, Seeds) to farm', 'info');
    }

    setIsActionLoading(false);
  }, [activeCropType, activeTool, addToast, gameState.farmTiles]);

  // Advance Day / Sleep
  const handleAdvanceDay = async () => {
    setIsActionLoading(true);
    const res = await executeAction({ action: 'advance_day' });
    if (res.success && res.state) {
      setGameState(res.state);
      setIsDaySummaryOpen(true);
      soundManager.playMorning();
    } else {
      addToast(res.message, 'warning');
    }
    setIsActionLoading(false);
  };

  // Buy Item in Shop
  const handleBuyItem = async (itemKey: string, quantity: number) => {
    setIsActionLoading(true);
    const res = await executeAction({
      action: 'buy',
      itemKey,
      quantity,
    });
    if (res.success && res.state) {
      setGameState(res.state);
      soundManager.playCoins();
      addToast(res.message, 'success');
    } else {
      addToast(res.message, 'warning');
    }
    setIsActionLoading(false);
  };

  // Sell Item in Shop
  const handleSellItem = async (itemKey: string, quantity: number) => {
    setIsActionLoading(true);
    const res = await executeAction({
      action: 'sell',
      itemKey,
      quantity,
    });
    if (res.success && res.state) {
      setGameState(res.state);
      soundManager.playCoins();
      addToast(res.message, 'success');
    } else {
      addToast(res.message, 'warning');
    }
    setIsActionLoading(false);
  };

  // Sell All Harvested Crops
  const handleSellAllCrops = async () => {
    setIsActionLoading(true);
    const res = await executeAction({ action: 'sell_all' });
    if (res.success && res.state) {
      setGameState(res.state);
      soundManager.playCoins();
      addToast(res.message, 'success', '💰 Harvest Shipped!');
    } else {
      addToast(res.message, 'warning');
    }
    setIsActionLoading(false);
  };

  // Upgrades
  const handleUpgrade = async (type: 'wateringCan' | 'backpack' | 'moveSpeed' | 'sprinklers') => {
    setIsActionLoading(true);
    const res = await executeAction({
      action: 'upgrade',
      upgradeType: type,
    });
    if (res.success && res.state) {
      setGameState(res.state);
      soundManager.playHarvest();
      addToast(res.message, 'success', '✨ Upgrade Acquired!');
    } else {
      addToast(res.message, 'warning');
    }
    setIsActionLoading(false);
  };

  // Reset Game
  const handleResetGame = async () => {
    setIsLoading(true);
    const fresh = await resetGame();
    setGameState(fresh);
    setIsLoading(false);
    addToast('Farm reset to Day 1. Happy farming!', 'info');
  };

  // Tutorial complete callback
  const handleTutorialComplete = async () => {
    const updated = { ...gameState, tutorialCompleted: true };
    setGameState(updated);
    await saveGameState(updated);
  };

  return (
    <div
      id="app-root-container"
      className="min-h-screen bg-[#FDF8F1] text-[#2C2C2C] flex flex-col justify-between overflow-x-hidden font-sans select-none"
    >
      {/* Top Game HUD */}
      <GameHUD
        gameState={gameState}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenShop={() => setIsShopOpen(true)}
        onOpenInventory={() => setIsInventoryOpen(true)}
        onOpenUpgrades={() => setIsUpgradesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onAdvanceDay={handleAdvanceDay}
        isAdvancingDay={isActionLoading}
      />

      {/* Main Farm Play Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 my-auto relative w-full max-w-5xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-[#634832]/20 shadow-md animate-pulse">
            <span className="text-4xl mb-3">🌱</span>
            <p className="text-[#634832] font-serif font-bold text-base">Preparing Sproutwood Valley...</p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <FarmCanvas
              gameState={gameState}
              selectedTool={activeTool}
              selectedCropType={activeCropType}
              onTileAction={handleTileAction}
              isActionLoading={isActionLoading}
            />
          </div>
        )}
      </main>

      {/* Bottom Hotbar / Mobile Controls */}
      <footer className="w-full pb-3 px-2 flex flex-col items-center gap-2">
        <Hotbar
          inventory={gameState.inventory}
          selectedSlot={gameState.selectedSlot}
          onSelectSlot={handleSelectSlot}
        />

        {/* On-Screen Mobile Touch D-Pad & Action button */}
        <MobileControls
          onActionPress={() => {
            // Trigger action on tile in front of player
            const p = gameState.player;
            const tileX = Math.floor((p.x + 16) / 32);
            let targetX = tileX;
            let targetY = Math.floor((p.y + 24) / 32);
            if (p.direction === 'up') targetY -= 1;
            else if (p.direction === 'down') targetY += 1;
            else if (p.direction === 'left') targetX -= 1;
            else if (p.direction === 'right') targetX += 1;
            handleTileAction(targetX, targetY);
          }}
        />
      </footer>

      {/* Modals & Overlays */}
      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        gameState={gameState}
        onBuyItem={handleBuyItem}
        onSellItem={handleSellItem}
        onSellAll={handleSellAllCrops}
        isLoading={isActionLoading}
      />

      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        gameState={gameState}
        onSelectSlot={handleSelectSlot}
        onSellAllCrops={handleSellAllCrops}
      />

      <UpgradesModal
        isOpen={isUpgradesOpen}
        onClose={() => setIsUpgradesOpen(false)}
        gameState={gameState}
        onUpgrade={handleUpgrade}
        isLoading={isActionLoading}
      />

      <DaySummaryModal
        isOpen={isDaySummaryOpen}
        onClose={() => setIsDaySummaryOpen(false)}
        gameState={gameState}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onResetGame={handleResetGame}
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />

      <TutorialGuide
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onComplete={handleTutorialComplete}
      />

      {/* Floating Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
