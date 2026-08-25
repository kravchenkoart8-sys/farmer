import React from 'react';
import { InventoryItem } from '../types';
import { soundManager } from '../utils/audio';

interface HotbarProps {
  inventory: InventoryItem[];
  selectedSlot: number;
  onSelectSlot: (index: number) => void;
}

export const Hotbar: React.FC<HotbarProps> = ({
  inventory,
  selectedSlot,
  onSelectSlot,
}) => {
  // Show first 8 items in hotbar
  const HOTBAR_SLOTS = 8;
  const slots = Array.from({ length: HOTBAR_SLOTS }, (_, i) => inventory[i] || null);

  const getItemEmoji = (item: InventoryItem | null) => {
    if (!item) return null;
    if (item.itemKey === 'hoe') return '⛏️';
    if (item.itemKey === 'water_can') return '🚿';
    if (item.itemKey === 'scythe') return '🌾';

    if (item.type === 'seed') {
      if (item.cropType === 'turnip') return '🌰';
      if (item.cropType === 'carrot') return '🥕';
      if (item.cropType === 'tomato') return '🍅';
      if (item.cropType === 'pumpkin') return '🎃';
      if (item.cropType === 'strawberry') return '🍓';
      if (item.cropType === 'corn') return '🌽';
      return '🌱';
    }

    if (item.type === 'crop') {
      if (item.cropType === 'turnip') return '🟣';
      if (item.cropType === 'carrot') return '🥕';
      if (item.cropType === 'tomato') return '🍅';
      if (item.cropType === 'pumpkin') return '🎃';
      if (item.cropType === 'strawberry') return '🍓';
      if (item.cropType === 'corn') return '🌽';
      return '🧺';
    }

    return '📦';
  };

  const getToolShortName = (item: InventoryItem | null, index: number) => {
    if (!item) return `Slot ${index + 1}`;
    if (item.itemKey === 'hoe') return 'Hoe';
    if (item.itemKey === 'water_can') return 'Water';
    if (item.itemKey === 'scythe') return 'Scythe';
    if (item.type === 'seed') return 'Seeds';
    if (item.type === 'crop') return 'Produce';
    return item.name.split(' ')[0];
  };

  const selectedItem = inventory[selectedSlot] || null;

  return (
    <div
      id="game-hotbar-container"
      className="flex flex-col items-center gap-2 w-full max-w-2xl mx-auto px-2 py-1 select-none z-20"
    >
      {/* Selected Item Info Banner */}
      {selectedItem && (
        <div className="bg-white/95 text-[#2C2C2C] border border-[#634832]/20 px-4 py-1.5 rounded-full text-xs flex items-center gap-2 shadow-sm backdrop-blur-sm animate-fade-in font-sans">
          <span className="text-base">{getItemEmoji(selectedItem)}</span>
          <span className="font-bold text-[#634832] font-serif text-sm">{selectedItem.name}</span>
          <span className="text-[#634832]/60 hidden sm:inline text-xs">— {selectedItem.description}</span>
        </div>
      )}

      {/* Editorial Tool Cards */}
      <div
        id="hotbar-slots"
        className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap"
      >
        {slots.map((item, index) => {
          const isSelected = selectedSlot === index;
          const shortName = getToolShortName(item, index);

          return (
            <div
              key={index}
              onClick={() => {
                soundManager.playClick();
                onSelectSlot(index);
              }}
              className="flex flex-col items-center group cursor-pointer"
            >
              <button
                id={`hotbar-slot-${index}`}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#D97757] border-2 border-[#D97757] text-white shadow-md scale-105'
                    : 'bg-white border-2 border-[#634832]/20 group-hover:border-[#D97757] group-hover:scale-102 shadow-sm'
                }`}
                title={item ? `${item.name} (${item.count})` : `Slot ${index + 1} (Empty)`}
              >
                {/* Slot Hotkey Label */}
                <span
                  className={`absolute top-1 left-1.5 text-[8px] font-sans font-bold ${
                    isSelected ? 'text-white/80' : 'text-[#634832]/40'
                  }`}
                >
                  {index + 1}
                </span>

                {/* Item Icon */}
                {item ? (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xl sm:text-2xl drop-shadow-sm">{getItemEmoji(item)}</span>
                    {/* Item Quantity Badge */}
                    {item.count > 1 && (
                      <span
                        className={`absolute -top-1.5 -right-1.5 text-[9px] font-sans font-bold px-1.5 py-0.2 rounded-full shadow-sm ${
                          isSelected
                            ? 'bg-[#634832] text-white border border-white/40'
                            : 'bg-[#634832] text-white'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[#634832]/20 text-xs">·</span>
                )}
              </button>

              <span
                className={`text-[9px] sm:text-[10px] mt-1 uppercase tracking-widest font-sans font-bold ${
                  isSelected ? 'text-[#D97757]' : item ? 'text-[#634832]/80' : 'opacity-30 text-[#634832]'
                }`}
              >
                {shortName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

