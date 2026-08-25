import React from 'react';
import { X, Sparkles, Droplets, Backpack, Footprints, Zap, Coins, Check } from 'lucide-react';
import { UPGRADE_CONFIG } from '../constants/gameData';
import { GameState } from '../types';
import { soundManager } from '../utils/audio';

interface UpgradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onUpgrade: (type: 'wateringCan' | 'backpack' | 'moveSpeed' | 'sprinklers') => void;
  isLoading?: boolean;
}

export const UpgradesModal: React.FC<UpgradesModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onUpgrade,
  isLoading,
}) => {
  if (!isOpen) return null;

  const { upgrades, coins } = gameState;

  // Next upgrade levels
  const nextWaterCan = UPGRADE_CONFIG.wateringCan.find(u => u.level === upgrades.wateringCanLevel + 1);
  const curWaterCan = UPGRADE_CONFIG.wateringCan.find(u => u.level === upgrades.wateringCanLevel);

  const nextBag = UPGRADE_CONFIG.backpack.find(u => u.level === upgrades.backpackLevel + 1);
  const curBag = UPGRADE_CONFIG.backpack.find(u => u.level === upgrades.backpackLevel);

  const nextBoots = UPGRADE_CONFIG.moveSpeed.find(u => u.level === upgrades.moveSpeedLevel + 1);
  const curBoots = UPGRADE_CONFIG.moveSpeed.find(u => u.level === upgrades.moveSpeedLevel);

  const sprinklerConfig = UPGRADE_CONFIG.sprinklers;

  return (
    <div
      id="upgrades-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C2C2C]/60 backdrop-blur-xs p-3 sm:p-4"
    >
      <div
        id="upgrades-modal-card"
        className="relative w-full max-w-2xl bg-[#FDF8F1] border-2 border-[#634832]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
      >
        {/* Header */}
        <div className="bg-[#F4ECE0] px-6 py-4 border-b border-[#634832]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D97757] text-white flex items-center justify-center text-2xl shadow-sm">
              ⚡
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-[#D97757]">
                Blacksmith & Carpenter
              </span>
              <h2 className="text-xl font-bold font-serif text-[#634832] tracking-tight leading-tight">
                Farm Workshop & Tool Upgrades
              </h2>
              <p className="text-xs text-[#634832]/70 font-sans">
                Enhance your tools and expand farm efficiency
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white border border-[#634832]/20 px-3.5 py-1.5 rounded-2xl text-[#634832] font-serif font-bold text-sm shadow-sm">
              <Coins className="w-4 h-4 text-[#D97757]" />
              <span>{coins}g</span>
            </div>
            <button
              id="btn-close-upgrades"
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

        {/* Upgrade Cards List */}
        <div className="p-6 flex-1 overflow-y-auto space-y-3.5">
          {/* 1. Watering Can Upgrade */}
          <div className="bg-white border border-[#634832]/15 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FDF8F1] border border-[#634832]/15 flex items-center justify-center text-2xl text-[#5A7D6C] shadow-inner">
                <Droplets className="w-6 h-6 text-[#5A7D6C]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold font-serif text-[#634832] text-base">Watering Can</h3>
                  <span className="text-xs bg-[#5A7D6C]/10 text-[#5A7D6C] px-2.5 py-0.5 rounded-full font-sans font-bold border border-[#5A7D6C]/20">
                    Tier {upgrades.wateringCanLevel}: {curWaterCan?.name}
                  </span>
                </div>
                <p className="text-xs text-[#2C2C2C]/70 mt-1 font-sans">
                  {nextWaterCan
                    ? `Next: ${nextWaterCan.name} (${nextWaterCan.desc})`
                    : 'Max level reached! You can water 3x3 tiles at once.'}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              {nextWaterCan ? (
                <button
                  onClick={() => {
                    soundManager.playHarvest();
                    onUpgrade('wateringCan');
                  }}
                  disabled={coins < nextWaterCan.cost || isLoading}
                  className="w-full sm:w-auto px-4 py-2 bg-[#5A7D6C] hover:bg-[#4d6b5c] disabled:opacity-40 disabled:hover:bg-[#5A7D6C] active:scale-95 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition shadow-sm cursor-pointer flex items-center gap-1.5 justify-center"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Upgrade ({nextWaterCan.cost}g)</span>
                </button>
              ) : (
                <span className="flex items-center gap-1 text-[#5A7D6C] text-xs font-bold font-sans bg-[#5A7D6C]/10 px-3 py-1.5 rounded-xl border border-[#5A7D6C]/20">
                  <Check className="w-4 h-4" /> Max Tier
                </span>
              )}
            </div>
          </div>

          {/* 2. Backpack Expansion */}
          <div className="bg-white border border-[#634832]/15 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FDF8F1] border border-[#634832]/15 flex items-center justify-center text-2xl text-[#D97757] shadow-inner">
                <Backpack className="w-6 h-6 text-[#D97757]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold font-serif text-[#634832] text-base">Backpack Expansion</h3>
                  <span className="text-xs bg-[#D97757]/10 text-[#D97757] px-2.5 py-0.5 rounded-full font-sans font-bold border border-[#D97757]/20">
                    Tier {upgrades.backpackLevel}: {curBag?.slots} Slots
                  </span>
                </div>
                <p className="text-xs text-[#2C2C2C]/70 mt-1 font-sans">
                  {nextBag
                    ? `Next: ${nextBag.name} (${nextBag.slots} item slots)`
                    : 'Max backpack size reached (20 slots)!'}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              {nextBag ? (
                <button
                  onClick={() => {
                    soundManager.playHarvest();
                    onUpgrade('backpack');
                  }}
                  disabled={coins < nextBag.cost || isLoading}
                  className="w-full sm:w-auto px-4 py-2 bg-[#D97757] hover:bg-[#c66849] disabled:opacity-40 disabled:hover:bg-[#D97757] active:scale-95 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition shadow-sm cursor-pointer flex items-center gap-1.5 justify-center"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Upgrade ({nextBag.cost}g)</span>
                </button>
              ) : (
                <span className="flex items-center gap-1 text-[#5A7D6C] text-xs font-bold font-sans bg-[#5A7D6C]/10 px-3 py-1.5 rounded-xl border border-[#5A7D6C]/20">
                  <Check className="w-4 h-4" /> Max Tier
                </span>
              )}
            </div>
          </div>

          {/* 3. Swift Boots (Movement Speed) */}
          <div className="bg-white border border-[#634832]/15 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FDF8F1] border border-[#634832]/15 flex items-center justify-center text-2xl text-[#634832] shadow-inner">
                <Footprints className="w-6 h-6 text-[#634832]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold font-serif text-[#634832] text-base">Boots & Movement Speed</h3>
                  <span className="text-xs bg-[#634832]/10 text-[#634832] px-2.5 py-0.5 rounded-full font-sans font-bold border border-[#634832]/20">
                    Tier {upgrades.moveSpeedLevel}: {curBoots?.name}
                  </span>
                </div>
                <p className="text-xs text-[#2C2C2C]/70 mt-1 font-sans">
                  {nextBoots
                    ? `Next: ${nextBoots.name} (${nextBoots.desc})`
                    : 'Max movement speed unlocked! Zoom across the farm.'}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              {nextBoots ? (
                <button
                  onClick={() => {
                    soundManager.playHarvest();
                    onUpgrade('moveSpeed');
                  }}
                  disabled={coins < nextBoots.cost || isLoading}
                  className="w-full sm:w-auto px-4 py-2 bg-[#634832] hover:bg-[#4e3827] disabled:opacity-40 disabled:hover:bg-[#634832] active:scale-95 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition shadow-sm cursor-pointer flex items-center gap-1.5 justify-center"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Upgrade ({nextBoots.cost}g)</span>
                </button>
              ) : (
                <span className="flex items-center gap-1 text-[#5A7D6C] text-xs font-bold font-sans bg-[#5A7D6C]/10 px-3 py-1.5 rounded-xl border border-[#5A7D6C]/20">
                  <Check className="w-4 h-4" /> Max Tier
                </span>
              )}
            </div>
          </div>

          {/* 4. Auto-Sprinkler Kit */}
          <div className="bg-white border border-[#634832]/15 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FDF8F1] border border-[#634832]/15 flex items-center justify-center text-2xl text-[#5A7D6C] shadow-inner">
                <Zap className="w-6 h-6 text-[#5A7D6C]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold font-serif text-[#634832] text-base">Auto-Sprinkler Irrigation</h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-sans font-bold ${
                    upgrades.hasAutoSprinklers
                      ? 'bg-[#5A7D6C]/10 text-[#5A7D6C] border-[#5A7D6C]/20'
                      : 'bg-[#634832]/10 text-[#634832]/60 border-[#634832]/20'
                  }`}>
                    {upgrades.hasAutoSprinklers ? 'Active' : 'Uninstalled'}
                  </span>
                </div>
                <p className="text-xs text-[#2C2C2C]/70 mt-1 font-sans">
                  {sprinklerConfig.desc}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              {!upgrades.hasAutoSprinklers ? (
                <button
                  onClick={() => {
                    soundManager.playHarvest();
                    onUpgrade('sprinklers');
                  }}
                  disabled={coins < sprinklerConfig.cost || isLoading}
                  className="w-full sm:w-auto px-4 py-2 bg-[#5A7D6C] hover:bg-[#4d6b5c] disabled:opacity-40 disabled:hover:bg-[#5A7D6C] active:scale-95 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition shadow-sm cursor-pointer flex items-center gap-1.5 justify-center"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Install ({sprinklerConfig.cost}g)</span>
                </button>
              ) : (
                <span className="flex items-center gap-1 text-[#5A7D6C] text-xs font-bold font-sans bg-[#5A7D6C]/10 px-3 py-1.5 rounded-xl border border-[#5A7D6C]/20">
                  <Check className="w-4 h-4" /> Installed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F4ECE0] px-6 py-3.5 border-t border-[#634832]/20 flex items-center justify-between text-xs text-[#634832]/80 font-sans">
          <span className="italic font-serif">Earn coins by planting and shipping ripe harvest!</span>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-2 bg-[#634832] hover:bg-[#4e3827] text-white rounded-xl font-bold uppercase tracking-wider text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

