import React, { useState } from 'react';
import { X, Store, Coins, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { CROPS } from '../constants/gameData';
import { CropType, GameState } from '../types';
import { soundManager } from '../utils/audio';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onBuyItem: (itemKey: string, quantity: number) => void;
  onSellItem: (itemKey: string, quantity: number) => void;
  onSellAll: () => void;
  isLoading?: boolean;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onBuyItem,
  onSellItem,
  onSellAll,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

  if (!isOpen) return null;

  const cropKeys: CropType[] = ['turnip', 'carrot', 'tomato', 'pumpkin', 'strawberry', 'corn'];

  // Filter crops in inventory
  const inventoryCrops = gameState.inventory.filter(i => i.type === 'crop' && i.count > 0);
  const totalHarvestValue = inventoryCrops.reduce((acc, item) => {
    const price = item.sellPrice || (item.cropType ? CROPS[item.cropType].sellPrice : 10);
    return acc + price * item.count;
  }, 0);

  const getCropEmoji = (type: CropType) => {
    switch (type) {
      case 'turnip': return '🌰';
      case 'carrot': return '🥕';
      case 'tomato': return '🍅';
      case 'pumpkin': return '🎃';
      case 'strawberry': return '🍓';
      case 'corn': return '🌽';
    }
  };

  const getCropFruitEmoji = (type: CropType) => {
    switch (type) {
      case 'turnip': return '🟣';
      case 'carrot': return '🥕';
      case 'tomato': return '🍅';
      case 'pumpkin': return '🎃';
      case 'strawberry': return '🍓';
      case 'corn': return '🌽';
    }
  };

  return (
    <div
      id="shop-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C2C2C]/60 backdrop-blur-xs p-3 sm:p-4"
    >
      <div
        id="shop-modal-card"
        className="relative w-full max-w-2xl bg-[#FDF8F1] border-2 border-[#634832]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
      >
        {/* Header */}
        <div className="bg-[#F4ECE0] px-6 py-4 border-b border-[#634832]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#5A7D6C] text-white flex items-center justify-center text-2xl shadow-sm">
              🏪
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-[#D97757]">
                Village Merchant
              </span>
              <h2 className="text-xl font-bold font-serif text-[#634832] tracking-tight leading-tight">
                Barnaby's General Store
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white border border-[#634832]/20 px-3.5 py-1.5 rounded-2xl text-[#634832] font-serif font-bold text-sm shadow-sm">
              <Coins className="w-4 h-4 text-[#D97757]" />
              <span>{gameState.coins}g</span>
            </div>
            <button
              id="btn-close-shop"
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-white hover:bg-[#E8DCC4] text-[#634832] border border-[#634832]/20 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#634832]/15 bg-[#FDF8F1] px-6 pt-3 gap-2">
          <button
            id="tab-shop-buy"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('buy');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-2xl font-sans uppercase tracking-wider font-bold text-xs transition cursor-pointer ${
              activeTab === 'buy'
                ? 'bg-white text-[#D97757] border-t-2 border-[#D97757] shadow-sm'
                : 'text-[#634832]/70 hover:text-[#634832] hover:bg-[#F4ECE0]/60'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Seed Packets</span>
          </button>

          <button
            id="tab-shop-sell"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('sell');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-2xl font-sans uppercase tracking-wider font-bold text-xs transition cursor-pointer ${
              activeTab === 'sell'
                ? 'bg-white text-[#5A7D6C] border-t-2 border-[#5A7D6C] shadow-sm'
                : 'text-[#634832]/70 hover:text-[#634832] hover:bg-[#F4ECE0]/60'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Sell Produce ({inventoryCrops.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
          {activeTab === 'buy' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {cropKeys.map(cropKey => {
                const crop = CROPS[cropKey];
                const canAfford1 = gameState.coins >= crop.seedPrice;
                const canAfford5 = gameState.coins >= crop.seedPrice * 5;

                return (
                  <div
                    key={crop.id}
                    className="bg-white border border-[#634832]/15 hover:border-[#D97757]/60 rounded-2xl p-4 flex flex-col justify-between gap-3 transition shadow-sm"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="text-3xl p-2.5 bg-[#FDF8F1] rounded-2xl border border-[#634832]/15 shadow-inner">
                        {getCropEmoji(crop.id)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold font-serif text-[#634832] text-base">{crop.name} Seeds</h4>
                          <span className="text-xs font-bold font-sans text-[#D97757] bg-[#D97757]/10 px-2.5 py-0.5 rounded-full border border-[#D97757]/20">
                            {crop.seedPrice}g
                          </span>
                        </div>
                        <p className="text-xs text-[#2C2C2C]/70 line-clamp-2 mt-1 font-sans">
                          {crop.description}
                        </p>
                        <div className="flex items-center gap-2.5 mt-2 text-[11px] font-sans">
                          <span className="text-[#5A7D6C] font-semibold">⏳ {crop.growthDays} days</span>
                          <span className="text-[#634832] font-semibold">💰 Sells {crop.sellPrice}g</span>
                          {crop.regrows && (
                            <span className="text-[#D97757] font-bold bg-[#D97757]/10 px-1.5 rounded">
                              Regrows!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#634832]/10">
                      <button
                        onClick={() => {
                          soundManager.playCoins();
                          onBuyItem(`seed_${crop.id}`, 1);
                        }}
                        disabled={!canAfford1 || isLoading}
                        className="flex-1 py-2 bg-[#D97757] hover:bg-[#c66849] disabled:opacity-40 disabled:hover:bg-[#D97757] active:scale-95 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
                      >
                        Buy 1 ({crop.seedPrice}g)
                      </button>
                      <button
                        onClick={() => {
                          soundManager.playCoins();
                          onBuyItem(`seed_${crop.id}`, 5);
                        }}
                        disabled={!canAfford5 || isLoading}
                        className="flex-1 py-2 bg-[#634832] hover:bg-[#4e3827] disabled:opacity-40 disabled:hover:bg-[#634832] active:scale-95 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
                      >
                        Buy 5 ({crop.seedPrice * 5}g)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sell All Banner */}
              {inventoryCrops.length > 0 ? (
                <div className="bg-[#5A7D6C] text-white p-5 rounded-2xl border border-[#5A7D6C]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-[#E8DCC4]">
                      Produce Shipping
                    </span>
                    <h3 className="font-bold font-serif text-lg flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-200" />
                      Bulk Export Shipping Bin
                    </h3>
                    <p className="text-xs text-white/80 font-sans mt-0.5">
                      Ship all {inventoryCrops.reduce((a, b) => a + b.count, 0)} harvested goods for{' '}
                      <span className="text-amber-200 font-extrabold font-serif">{totalHarvestValue}g</span>
                    </p>
                  </div>
                  <button
                    id="btn-sell-all-crops"
                    onClick={() => {
                      soundManager.playCoins();
                      onSellAll();
                    }}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-5 py-2.5 bg-white text-[#5A7D6C] hover:bg-[#FDF8F1] active:scale-95 rounded-xl text-xs uppercase tracking-widest font-sans font-black transition shadow-md cursor-pointer"
                  >
                    Ship All (+{totalHarvestValue}g)
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#634832]/20 p-6">
                  <div className="text-4xl mb-2">🧺</div>
                  <h4 className="font-bold font-serif text-[#634832] text-base">Your crop basket is empty</h4>
                  <p className="text-xs text-[#634832]/70 mt-1 max-w-sm mx-auto font-sans">
                    Plant seeds, water them daily until fully mature, then harvest them to sell here for farm profits!
                  </p>
                </div>
              )}

              {/* Individual Harvested Crop Items */}
              <div className="space-y-2.5">
                {inventoryCrops.map(item => {
                  const unitPrice =
                    item.sellPrice || (item.cropType ? CROPS[item.cropType].sellPrice : 10);
                  const totalPrice = unitPrice * item.count;

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-[#634832]/15 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 bg-[#FDF8F1] rounded-xl border border-[#634832]/15">
                          {item.cropType ? getCropFruitEmoji(item.cropType) : '🧺'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-serif text-[#634832] text-base">{item.name}</span>
                            <span className="text-xs text-[#D97757] font-bold font-sans bg-[#D97757]/10 px-2 py-0.5 rounded-full border border-[#D97757]/20">
                              x{item.count}
                            </span>
                          </div>
                          <p className="text-xs text-[#634832]/70 font-sans mt-0.5">
                            Unit: {unitPrice}g · Total: {totalPrice}g
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 font-sans">
                        <button
                          onClick={() => {
                            soundManager.playCoins();
                            onSellItem(item.itemKey, 1);
                          }}
                          disabled={isLoading}
                          className="px-3.5 py-1.5 bg-[#F4ECE0] hover:bg-[#E8DCC4] active:scale-95 text-[#634832] rounded-xl text-xs font-bold transition border border-[#634832]/20 cursor-pointer"
                        >
                          Sell 1 (+{unitPrice}g)
                        </button>
                        <button
                          onClick={() => {
                            soundManager.playCoins();
                            onSellItem(item.itemKey, item.count);
                          }}
                          disabled={isLoading}
                          className="px-3.5 py-1.5 bg-[#5A7D6C] hover:bg-[#4d6b5c] active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                        >
                          Sell All (+{totalPrice}g)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F4ECE0] px-6 py-3.5 border-t border-[#634832]/20 flex items-center justify-between text-xs text-[#634832]/80 font-sans">
          <span className="italic font-serif">🌾 Barnaby: "Best prices in the valley, guaranteed!"</span>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-2 bg-[#634832] hover:bg-[#4e3827] text-white rounded-xl font-bold uppercase tracking-wider text-xs transition cursor-pointer"
          >
            Done Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

