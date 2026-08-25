import React from 'react';
import { 
  Sun, 
  CloudRain, 
  Wind, 
  Coins, 
  Bed, 
  Store, 
  Backpack, 
  Sparkles, 
  Settings, 
  Volume2, 
  VolumeX, 
  HelpCircle 
} from 'lucide-react';
import { GameState, TimeOfDay, Weather } from '../types';
import { soundManager } from '../utils/audio';

interface GameHUDProps {
  gameState: GameState;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenShop: () => void;
  onOpenInventory: () => void;
  onOpenUpgrades: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
  onAdvanceDay: () => void;
  isAdvancingDay: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  gameState,
  soundEnabled,
  onToggleSound,
  onOpenShop,
  onOpenInventory,
  onOpenUpgrades,
  onOpenSettings,
  onOpenTutorial,
  onAdvanceDay,
  isAdvancingDay,
}) => {
  // Format game clock e.g. 6:00 AM to 11:30 PM
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    const isPM = hours >= 12;
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const displayMins = mins < 10 ? `0${mins}` : mins;
    return {
      timeString: `${displayHours}:${displayMins}`,
      period: isPM ? 'PM' : 'AM',
    };
  };

  const getWeatherDisplay = (weather: Weather) => {
    switch (weather) {
      case 'rainy':
        return {
          icon: <CloudRain className="w-4 h-4 text-[#5A7D6C]" />,
          label: 'Rainy Showers',
        };
      case 'breezy':
        return {
          icon: <Wind className="w-4 h-4 text-[#A5C9CA]" />,
          label: 'Gentle Breeze',
        };
      case 'sunny':
      default:
        return {
          icon: <Sun className="w-4 h-4 text-[#D97757]" />,
          label: 'Clear & Sunny',
        };
    }
  };

  const getTimeOfDayLabel = (timeOfDay: TimeOfDay) => {
    switch (timeOfDay) {
      case 'morning':
        return 'Early Morning';
      case 'day':
        return 'Midday Sun';
      case 'evening':
        return 'Golden Twilight';
      case 'night':
        return 'Moonlit Night';
    }
  };

  const weatherInfo = getWeatherDisplay(gameState.weather);
  const timeInfo = formatTime(gameState.timeMinutes);
  const dayPadded = gameState.day < 10 ? `0${gameState.day}` : `${gameState.day}`;

  return (
    <header
      id="game-hud"
      className="w-full bg-[#FDF8F1] border-b-2 border-[#634832]/20 px-4 py-3 sm:px-8 sm:py-4 text-[#2C2C2C] sticky top-0 z-30 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        {/* Left: Editorial Masthead with Large Day Numeral */}
        <div className="flex items-baseline gap-4 sm:gap-6">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl sm:text-6xl md:text-7xl font-black text-[#634832] font-serif leading-none tracking-tighter drop-shadow-sm">
              {dayPadded}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.2em] font-sans font-bold text-[#D97757]">
                Spring Season
              </span>
              <span className="text-xs text-[#634832]/40 font-sans font-semibold">·</span>
              <span className="text-xs uppercase tracking-[0.15em] font-sans font-bold text-[#634832]/70">
                Sproutwood
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {weatherInfo.icon}
              <span className="text-lg sm:text-2xl italic text-[#5A7D6C] font-serif">
                {weatherInfo.label}
              </span>
              <span className="text-xs text-[#634832]/50 font-sans ml-1 hidden sm:inline">
                ({getTimeOfDayLabel(gameState.timeOfDay)})
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right: Time, Purse, and Editorial Action Controls */}
        <div className="w-full md:w-auto flex flex-wrap items-center justify-between md:justify-end gap-3 sm:gap-4">
          {/* Time Display */}
          <div className="flex flex-col text-left md:text-right pr-2 sm:pr-4 border-r border-[#634832]/15">
            <div className="text-[10px] uppercase tracking-widest font-sans font-bold text-[#634832]/60">
              Current Time
            </div>
            <div className="text-xl sm:text-2xl font-light font-serif tracking-tight text-[#2C2C2C]">
              {timeInfo.timeString} <span className="text-xs font-sans font-semibold text-[#634832]/80">{timeInfo.period}</span>
            </div>
          </div>

          {/* Purse / Coins Badge */}
          <div
            id="coins-badge"
            className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-2xl border border-[#634832]/15 shadow-sm"
          >
            <div className="flex flex-col text-right">
              <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-[#5A7D6C]">
                Purse
              </span>
              <span className="text-base sm:text-lg font-black font-serif text-[#634832] leading-tight flex items-center gap-1">
                {gameState.coins}
                <span className="text-[10px] font-sans font-bold text-[#634832]/50">G</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Village Shop */}
            <button
              id="btn-open-shop"
              onClick={() => {
                soundManager.playClick();
                onOpenShop();
              }}
              className="flex items-center gap-1.5 bg-[#5A7D6C] hover:bg-[#4d6b5c] active:scale-95 text-white px-3 sm:px-3.5 py-2 rounded-2xl text-xs uppercase tracking-wider font-sans font-bold transition-all shadow-sm cursor-pointer"
              title="Open Barnaby's Village Shop"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Shop</span>
            </button>

            {/* Bag / Inventory */}
            <button
              id="btn-open-inventory"
              onClick={() => {
                soundManager.playClick();
                onOpenInventory();
              }}
              className="flex items-center gap-1.5 bg-white hover:bg-[#F4ECE0] active:scale-95 text-[#634832] border-2 border-[#634832]/20 hover:border-[#D97757] px-3 sm:px-3.5 py-2 rounded-2xl text-xs uppercase tracking-wider font-sans font-bold transition-all shadow-sm cursor-pointer"
              title="Open Farmer Backpack"
            >
              <Backpack className="w-3.5 h-3.5 text-[#D97757]" />
              <span>Pack</span>
              <span className="text-[10px] bg-[#634832]/10 px-1.5 py-0.5 rounded-full font-sans">
                {gameState.inventory.length}
              </span>
            </button>

            {/* Upgrades */}
            <button
              id="btn-open-upgrades"
              onClick={() => {
                soundManager.playClick();
                onOpenUpgrades();
              }}
              className="flex items-center gap-1.5 bg-white hover:bg-[#F4ECE0] active:scale-95 text-[#634832] border-2 border-[#634832]/20 hover:border-[#D97757] px-3 sm:px-3.5 py-2 rounded-2xl text-xs uppercase tracking-wider font-sans font-bold transition-all shadow-sm cursor-pointer"
              title="Farm Workshop & Upgrades"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D97757]" />
              <span className="hidden sm:inline">Craft</span>
            </button>

            {/* Sleep / Next Day Button */}
            <button
              id="btn-sleep-advance"
              onClick={() => {
                soundManager.playClick();
                onAdvanceDay();
              }}
              disabled={isAdvancingDay}
              className="flex items-center gap-1.5 bg-[#D97757] hover:bg-[#c66849] active:scale-95 disabled:opacity-50 text-white px-3 sm:px-4 py-2 rounded-2xl text-xs uppercase tracking-widest font-sans font-bold transition-all shadow-md border border-[#D97757] cursor-pointer"
              title="Rest & advance to tomorrow"
            >
              <Bed className="w-3.5 h-3.5" />
              <span>Sleep</span>
            </button>

            {/* Utility icons */}
            <div className="flex items-center gap-1 pl-1 border-l border-[#634832]/15">
              <button
                id="btn-toggle-sound"
                onClick={onToggleSound}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  soundEnabled
                    ? 'bg-[#E8DCC4] text-[#634832] border-[#D7C4A1]'
                    : 'bg-white text-[#634832]/40 border-[#634832]/20 hover:text-[#634832]'
                }`}
                title={soundEnabled ? 'Mute Audio FX' : 'Enable Synthesized Audio'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              <button
                id="btn-open-tutorial"
                onClick={() => {
                  soundManager.playClick();
                  onOpenTutorial();
                }}
                className="p-2 rounded-xl bg-white hover:bg-[#F4ECE0] text-[#634832] border border-[#634832]/20 transition-all cursor-pointer"
                title="Field Guide & Instructions"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>

              <button
                id="btn-open-settings"
                onClick={() => {
                  soundManager.playClick();
                  onOpenSettings();
                }}
                className="p-2 rounded-xl bg-white hover:bg-[#F4ECE0] text-[#634832] border border-[#634832]/20 transition-all cursor-pointer"
                title="Settings & Controls"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

