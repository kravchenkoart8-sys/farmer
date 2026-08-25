import React, { useState } from 'react';
import { X, Volume2, VolumeX, RotateCcw, HelpCircle, Keyboard, Smartphone, AlertTriangle } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetGame: () => void;
  onOpenTutorial: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  onResetGame,
  onOpenTutorial,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      id="settings-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C2C2C]/60 backdrop-blur-xs p-3 sm:p-4"
    >
      <div
        id="settings-modal-card"
        className="relative w-full max-w-md bg-[#FDF8F1] border-2 border-[#634832]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-in"
      >
        {/* Header */}
        <div className="bg-[#F4ECE0] px-6 py-4 border-b border-[#634832]/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⚙️</span>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-[#D97757]">
                Preferences
              </span>
              <h2 className="text-lg font-bold font-serif text-[#634832] leading-tight">Settings & Controls</h2>
            </div>
          </div>
          <button
            id="btn-close-settings"
            onClick={() => {
              soundManager.playClick();
              setShowConfirmReset(false);
              onClose();
            }}
            className="p-2 rounded-xl bg-white hover:bg-[#E8DCC4] text-[#634832] border border-[#634832]/20 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-[#2C2C2C] text-xs sm:text-sm font-sans">
          {/* Sound Toggle */}
          <div className="bg-white p-4 rounded-2xl border border-[#634832]/15 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#FDF8F1] border border-[#634832]/15 rounded-xl text-[#D97757]">
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-[#634832] font-serif text-sm">Synthesized Audio FX</p>
                <p className="text-[11px] text-[#634832]/70 font-sans">Procedural Web Audio soundscapes</p>
              </div>
            </div>
            <button
              id="btn-toggle-sound-settings"
              onClick={onToggleSound}
              className={`px-4 py-1.5 rounded-xl font-bold uppercase tracking-wider text-xs transition cursor-pointer shadow-sm ${
                soundEnabled
                  ? 'bg-[#5A7D6C] text-white'
                  : 'bg-[#F4ECE0] text-[#634832] border border-[#634832]/20'
              }`}
            >
              {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Controls Quick Reference */}
          <div className="bg-[#F4ECE0]/70 p-4 rounded-2xl border border-[#634832]/15 space-y-2.5">
            <h3 className="font-bold font-serif text-[#634832] flex items-center gap-1.5 text-sm">
              <Keyboard className="w-4 h-4 text-[#D97757]" />
              Keyboard & Desktop Controls
            </h3>
            <ul className="space-y-1 text-[#634832]/80 text-xs">
              <li>• <span className="text-[#634832] font-bold">WASD / Arrow Keys</span>: Walk and navigate</li>
              <li>• <span className="text-[#634832] font-bold">Spacebar / E / Enter / Click Tile</span>: Till, water, or harvest</li>
              <li>• <span className="text-[#634832] font-bold">Number Keys 1 to 8</span>: Select hotbar tool</li>
            </ul>

            <h3 className="font-bold font-serif text-[#634832] flex items-center gap-1.5 pt-2 border-t border-[#634832]/15 text-sm">
              <Smartphone className="w-4 h-4 text-[#5A7D6C]" />
              Mobile & Touch Controls
            </h3>
            <p className="text-[#634832]/80 text-xs">
              Use the on-screen touch D-Pad to walk, tap on any farm tile to interact with it, or press the Action Button.
            </p>
          </div>

          {/* Tutorial Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
              onOpenTutorial();
            }}
            className="w-full py-2.5 bg-white hover:bg-[#F4ECE0] text-[#634832] rounded-2xl font-bold uppercase tracking-wider text-xs transition flex items-center justify-center gap-2 border border-[#634832]/20 shadow-sm cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-[#D97757]" />
            <span>Open Farmer's Almanac / Guide</span>
          </button>

          {/* Reset Game Section */}
          {!showConfirmReset ? (
            <button
              id="btn-show-reset-confirm"
              onClick={() => setShowConfirmReset(true)}
              className="w-full py-2 bg-transparent hover:bg-rose-50 text-rose-700 rounded-2xl font-bold transition flex items-center justify-center gap-2 border border-rose-200 cursor-pointer text-xs uppercase tracking-wider"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Game to Day 1...</span>
            </button>
          ) : (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Reset all farm progress?</span>
              </div>
              <p className="text-[11px] text-rose-700">
                This will reset your crops, coins, upgrades, and return to Day 1.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  id="btn-confirm-reset-game"
                  onClick={() => {
                    setShowConfirmReset(false);
                    onResetGame();
                    onClose();
                  }}
                  className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Yes, Reset Farm
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F4ECE0] px-6 py-3 border-t border-[#634832]/20 text-center text-xs text-[#634832]/60 font-serif italic">
          Sproutwood Farm · Handcrafted Cozy Simulation
        </div>
      </div>
    </div>
  );
};

