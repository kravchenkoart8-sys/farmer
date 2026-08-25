import React, { useState } from 'react';
import { X, Backpack, Sparkles } from 'lucide-react';
import { UPGRADE_CONFIG } from '../constants/gameData';
import { GameState, InventoryItem } from '../types';
import { soundManager } from '../utils/audio';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onSelectSlot: (index: number) => void;
  onSellAllCrops: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onSelectSlot,
  onSellAllCrops,
}) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);

  if (!isOpen) return null;

  const bagLevel = gameState.upgrades.backpackLevel || 1;
  const maxSlots = UPGRADE_CONFIG.backpack[Math.min(bagLevel - 1, 2)].slots;

  const slots: (InventoryItem | null)[] = Array.from({ length: maxSlots }, (_, i) => gameState.inventory[i] || null);
  const selectedItem = gameState.inventory[selectedItemIndex] || null;

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

  const cropCount = gameState.inventory.filter(i => i.type === 'crop').reduce((a, b) => a + b.count, 0);

  return (
    <div
      id="inventory-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C2C2C]/60 backdrop-blur-xs p-3 sm:p-4"
    >
      <div
        id="inventory-modal-card"
        className="relative w-full max-w-xl bg-[#FDF8F1] border-2 border-[#634832]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-in"
      >
        {/* Header */}
        <div className="bg-[#F4ECE0] px-6 py-4 border-b border-[#634832]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D97757] text-white flex items-center justify-center text-2xl shadow-sm">
              🎒
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-[#D97757]">
                Equipment & Storage
              </span>
              <h2 className="text-xl font-bold font-serif text-[#634832] tracking-tight leading-tight">
                Farmer's Backpack
              </h2>
              <p className="text-xs text-[#634832]/70 font-sans">
                Capacity: {gameState.inventory.length} / {maxSlots} Slots (Tier {bagLevel})
              </p>
            </div>
          </div>

          <button
            id="btn-close-inventory"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white hover:bg-[#E8DCC4] text-[#634832] border border-[#634832]/20 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {/* Inventory Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2.5 bg-[#F4ECE0]/70 p-4 rounded-2xl border border-[#634832]/15">
            {slots.map((item, index) => {
              const isSelected = selectedItemIndex === index;
              return (
                <button
                  key={index}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedItemIndex(index);
                    onSelectSlot(index);
                  }}
                  className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    item
                      ? isSelected
                        ? 'bg-[#D97757] text-white border-2 border-[#D97757] shadow-md scale-105'
                        : 'bg-white border-2 border-[#634832]/20 hover:border-[#D97757] shadow-sm'
                      : 'bg-white/40 border border-dashed border-[#634832]/20 text-[#634832]/30'
                  }`}
                  title={item ? `${item.name} (${item.count})` : 'Empty Slot'}
                >
                  <span className={`absolute top-1 left-1.5 text-[8px] font-sans font-bold ${
                    isSelected ? 'text-white/80' : 'text-[#634832]/40'
                  }`}>
                    {index + 1}
                  </span>

                  {item ? (
                    <>
                      <span className="text-2xl drop-shadow-sm">{getItemEmoji(item)}</span>
                      {item.count > 1 && (
                        <span className={`absolute bottom-1 right-1 text-[9px] font-bold font-sans px-1.5 rounded-full ${
                          isSelected ? 'bg-[#634832] text-white' : 'bg-[#634832] text-white'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Selected Item Details Box */}
          {selectedItem ? (
            <div className="bg-white border border-[#634832]/15 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
              <div className="text-3xl p-3 bg-[#FDF8F1] rounded-2xl border border-[#634832]/15 shadow-inner">
                {getItemEmoji(selectedItem)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold font-serif text-[#634832] text-base">{selectedItem.name}</h3>
                  <span className="text-xs font-bold font-sans text-[#D97757] bg-[#D97757]/10 px-2.5 py-0.5 rounded-full border border-[#D97757]/20">
                    x{selectedItem.count}
                  </span>
                </div>
                <p className="text-xs text-[#2C2C2C]/70 mt-1 font-sans">{selectedItem.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs font-sans">
                  <span className="text-[#634832]/70">
                    Category: <span className="capitalize text-[#634832] font-semibold">{selectedItem.type}</span>
                  </span>
                  {selectedItem.sellPrice && (
                    <span className="text-[#5A7D6C] font-semibold">
                      Value: {selectedItem.sellPrice}g each
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-[#634832]/60 font-sans">
              Select an item above to view its details.
            </div>
          )}

          {/* Quick Ship button if player has crops */}
          {cropCount > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#5A7D6C] text-white p-3.5 rounded-2xl gap-2 shadow-sm">
              <span className="text-xs font-sans">
                You have {cropCount} fresh crops ready for sale at the merchant.
              </span>
              <button
                onClick={() => {
                  soundManager.playCoins();
                  onSellAllCrops();
                }}
                className="px-4 py-1.5 bg-white text-[#5A7D6C] hover:bg-[#FDF8F1] active:scale-95 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
              >
                Quick Ship Crops
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F4ECE0] px-6 py-3.5 border-t border-[#634832]/20 flex items-center justify-between text-xs text-[#634832]/80 font-sans">
          <span className="font-serif italic">Tip: Use keys 1 to 8 to quickly cycle items!</span>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-2 bg-[#634832] hover:bg-[#4e3827] text-white rounded-xl font-bold uppercase tracking-wider text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

