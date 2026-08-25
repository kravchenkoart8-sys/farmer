import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface MobileControlsProps {
  onActionPress: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onActionPress,
}) => {
  // Simulate keyboard events for D-Pad
  const triggerKey = (key: string, isDown: boolean) => {
    window.dispatchEvent(
      new KeyboardEvent(isDown ? 'keydown' : 'keyup', {
        key,
        code: key,
        bubbles: true,
      })
    );
  };

  return (
    <div
      id="mobile-controls-bar"
      className="md:hidden w-full max-w-lg mx-auto flex items-center justify-between px-4 py-2 select-none z-20 pointer-events-auto"
    >
      {/* Virtual D-Pad */}
      <div className="relative w-28 h-28 bg-[#F4ECE0]/95 backdrop-blur-md rounded-full border-2 border-[#634832]/30 shadow-lg flex items-center justify-center p-1">
        {/* Up */}
        <button
          onTouchStart={e => {
            e.preventDefault();
            triggerKey('w', true);
          }}
          onTouchEnd={e => {
            e.preventDefault();
            triggerKey('w', false);
          }}
          onMouseDown={() => triggerKey('w', true)}
          onMouseUp={() => triggerKey('w', false)}
          className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-xl bg-white active:bg-[#D97757] active:text-white text-[#634832] flex items-center justify-center border border-[#634832]/20 shadow-xs"
        >
          <ArrowUp className="w-4 h-4" />
        </button>

        {/* Down */}
        <button
          onTouchStart={e => {
            e.preventDefault();
            triggerKey('s', true);
          }}
          onTouchEnd={e => {
            e.preventDefault();
            triggerKey('s', false);
          }}
          onMouseDown={() => triggerKey('s', true)}
          onMouseUp={() => triggerKey('s', false)}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-xl bg-white active:bg-[#D97757] active:text-white text-[#634832] flex items-center justify-center border border-[#634832]/20 shadow-xs"
        >
          <ArrowDown className="w-4 h-4" />
        </button>

        {/* Left */}
        <button
          onTouchStart={e => {
            e.preventDefault();
            triggerKey('a', true);
          }}
          onTouchEnd={e => {
            e.preventDefault();
            triggerKey('a', false);
          }}
          onMouseDown={() => triggerKey('a', true)}
          onMouseUp={() => triggerKey('a', false)}
          className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-white active:bg-[#D97757] active:text-white text-[#634832] flex items-center justify-center border border-[#634832]/20 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Right */}
        <button
          onTouchStart={e => {
            e.preventDefault();
            triggerKey('d', true);
          }}
          onTouchEnd={e => {
            e.preventDefault();
            triggerKey('d', false);
          }}
          onMouseDown={() => triggerKey('d', true)}
          onMouseUp={() => triggerKey('d', false)}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-white active:bg-[#D97757] active:text-white text-[#634832] flex items-center justify-center border border-[#634832]/20 shadow-xs"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Center dot */}
        <div className="w-5 h-5 rounded-full bg-[#634832]/20" />
      </div>

      {/* Big Action Button (Interact / Use Selected Tool) */}
      <button
        id="btn-mobile-action"
        onClick={() => {
          onActionPress();
        }}
        className="w-20 h-20 rounded-3xl bg-[#D97757] hover:bg-[#c66849] active:scale-90 text-white font-sans font-bold uppercase tracking-wider text-[11px] flex flex-col items-center justify-center gap-1 shadow-xl border-2 border-white cursor-pointer"
      >
        <Sparkles className="w-6 h-6 text-amber-200" />
        <span>Action</span>
      </button>
    </div>
  );
};

