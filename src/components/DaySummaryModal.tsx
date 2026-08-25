import React from 'react';
import { Sun, CloudRain, Wind, Sunrise, ArrowRight } from 'lucide-react';
import { GameState, Weather } from '../types';
import { soundManager } from '../utils/audio';

interface DaySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
}

export const DaySummaryModal: React.FC<DaySummaryModalProps> = ({
  isOpen,
  onClose,
  gameState,
}) => {
  if (!isOpen) return null;

  // Count crops currently growing vs mature
  const matureCrops = gameState.farmTiles.filter(t => t.crop && t.crop.isMature);
  const growingCrops = gameState.farmTiles.filter(t => t.crop && !t.crop.isMature);

  const getWeatherDisplay = (weather: Weather) => {
    switch (weather) {
      case 'rainy':
        return {
          icon: <CloudRain className="w-6 h-6 text-[#5A7D6C]" />,
          title: 'Rainy Showers',
          desc: 'Gentle showers nourish the soil. All tilled farm tiles are watered automatically today.',
        };
      case 'breezy':
        return {
          icon: <Wind className="w-6 h-6 text-[#A5C9CA]" />,
          title: 'Pleasant Breeze',
          desc: 'Refreshing cool winds sweep across the valley. A crisp, wonderful morning for farming.',
        };
      case 'sunny':
      default:
        return {
          icon: <Sun className="w-6 h-6 text-[#D97757]" />,
          title: 'Warm & Sunny',
          desc: 'Clear blue skies with radiant sunlight to nurture your growing plants throughout the day.',
        };
    }
  };

  const weatherInfo = getWeatherDisplay(gameState.weather);

  return (
    <div
      id="day-summary-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C2C2C]/60 backdrop-blur-xs p-3 sm:p-4 animate-fade-in"
    >
      <div
        id="day-summary-modal-card"
        className="relative w-full max-w-lg bg-[#FDF8F1] border-2 border-[#634832]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-in"
      >
        {/* Banner with Sunrise Artwork */}
        <div className="bg-[#F4ECE0] p-6 text-center border-b border-[#634832]/20 relative overflow-hidden">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#D97757] text-white shadow-md mb-3">
            <Sunrise className="w-9 h-9" />
          </div>

          <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-[#D97757] block">
            Dawn in Sproutwood
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#634832] tracking-tight mt-1">
            Day {gameState.day} Begins
          </h2>
          <p className="text-xs sm:text-sm text-[#634832]/70 mt-1 font-serif italic">
            The morning light fills the valley. Your stamina and tools are refreshed.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Weather report */}
          <div className="bg-white border border-[#634832]/15 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-[#FDF8F1] rounded-2xl border border-[#634832]/15 shadow-inner">
              {weatherInfo.icon}
            </div>
            <div>
              <h3 className="font-bold font-serif text-[#634832] text-base flex items-center gap-1.5">
                Today's Weather: <span className="text-[#D97757]">{weatherInfo.title}</span>
              </h3>
              <p className="text-xs text-[#2C2C2C]/70 mt-0.5 font-sans">{weatherInfo.desc}</p>
            </div>
          </div>

          {/* Farm Status Cards */}
          <div className="grid grid-cols-2 gap-3 font-sans">
            <div className="bg-white border border-[#5A7D6C]/30 p-4 rounded-2xl text-center shadow-sm">
              <span className="text-2xl mb-1 block">✨</span>
              <span className="text-2xl font-bold font-serif text-[#5A7D6C]">{matureCrops.length}</span>
              <p className="text-xs text-[#634832]/80 font-bold uppercase tracking-wider mt-0.5">Ready to Harvest</p>
            </div>

            <div className="bg-white border border-[#D97757]/30 p-4 rounded-2xl text-center shadow-sm">
              <span className="text-2xl mb-1 block">🌱</span>
              <span className="text-2xl font-bold font-serif text-[#D97757]">{growingCrops.length}</span>
              <p className="text-xs text-[#634832]/80 font-bold uppercase tracking-wider mt-0.5">Growing Crops</p>
            </div>
          </div>

          {/* Tips / Summary stats */}
          <div className="bg-[#F4ECE0]/70 p-3.5 rounded-2xl border border-[#634832]/15 text-xs text-[#634832]/80 flex items-center justify-between font-sans">
            <span>Cumulative farm sales:</span>
            <span className="text-[#634832] font-bold font-serif text-sm">{gameState.stats.totalEarned || 0}g</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="bg-[#F4ECE0] p-5 border-t border-[#634832]/20 flex justify-center">
          <button
            id="btn-wake-up-start-day"
            onClick={() => {
              soundManager.playMorning();
              onClose();
            }}
            className="w-full py-3 bg-[#D97757] hover:bg-[#c66849] active:scale-98 text-white rounded-2xl font-sans font-bold uppercase tracking-widest text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Begin Today's Chores</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

