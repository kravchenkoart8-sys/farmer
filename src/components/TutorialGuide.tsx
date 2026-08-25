import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface TutorialGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const TutorialGuide: React.FC<TutorialGuideProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to Sproutwood Valley!',
      badge: 'Welcome, Farmer!',
      icon: '🌱',
      desc: 'You have inherited a cozy patch of fertile countryside. Follow these simple steps to build a flourishing organic farm!',
      tip: 'Walk around using WASD or Arrow keys on keyboard, or with the on-screen touch D-Pad on mobile devices.',
    },
    {
      title: 'Step 1: Till the Soil',
      badge: 'Prepare Ground',
      icon: '⛏️',
      desc: 'Select the Farmer Hoe (Slot 1). Walk up to grassy or dirt tiles and press SPACE or click on them to till the ground into rich planting soil.',
      tip: 'You can also use your Hoe or Scythe to clear rocks, weeds, and tree stumps to make room for more crops!',
    },
    {
      title: 'Step 2: Plant Seeds & Water Daily',
      badge: 'Nurture Crops',
      icon: '💧',
      desc: 'Select Seeds from your hotbar (e.g. Turnips or Carrots) and click a tilled tile to plant. Next, switch to your Watering Can (Slot 2) and water your crops every day!',
      tip: 'Crops need moisture to grow! Rainy days will water your entire farm automatically.',
    },
    {
      title: 'Step 3: Harvest, Sell & Upgrade!',
      badge: 'Reap Profits',
      icon: '🏪',
      desc: 'When crops sparkle and are fully grown, harvest them with your Scythe or Hands. Visit Barnaby\'s Shop to sell your harvest, buy better seeds, and upgrade your watering can and backpack!',
      tip: 'Ready for tomorrow? Click the "Sleep" button in the top bar to advance the day and see your crops grow.',
    },
  ];

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;

  const handleNext = () => {
    soundManager.playClick();
    if (isLast) {
      onComplete();
      onClose();
    } else {
      setStep(s => s + 1);
    }
  };

  const handlePrev = () => {
    soundManager.playClick();
    setStep(s => Math.max(0, s - 1));
  };

  return (
    <div
      id="tutorial-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C2C2C]/60 backdrop-blur-xs p-3 sm:p-4 animate-fade-in"
    >
      <div
        id="tutorial-modal-card"
        className="relative w-full max-w-lg bg-[#FDF8F1] border-2 border-[#634832]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-in"
      >
        {/* Top Header */}
        <div className="bg-[#F4ECE0] px-6 py-5 border-b border-[#634832]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D97757] text-white flex items-center justify-center text-2xl shadow-sm">
              {currentStep.icon}
            </div>
            <div>
              <span className="text-[10px] font-bold font-sans uppercase tracking-widest text-[#D97757]">
                {currentStep.badge} ({step + 1}/{steps.length})
              </span>
              <h2 className="text-lg font-bold font-serif text-[#634832] mt-0.5 leading-tight">
                {currentStep.title}
              </h2>
            </div>
          </div>

          <button
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
        <div className="p-6 space-y-4 font-sans">
          <p className="text-sm text-[#2C2C2C] leading-relaxed font-serif">
            {currentStep.desc}
          </p>

          <div className="bg-[#F4ECE0] border border-[#634832]/15 p-4 rounded-2xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#D97757] shrink-0 mt-0.5" />
            <p className="text-xs text-[#634832] leading-normal font-sans">
              <strong className="text-[#634832] font-bold">Farmer Pro-Tip:</strong> {currentStep.tip}
            </p>
          </div>

          {/* Step Progress Indicators */}
          <div className="flex justify-center gap-1.5 pt-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === step ? 'w-6 bg-[#D97757]' : 'w-2 bg-[#634832]/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="bg-[#F4ECE0] px-6 py-4 border-t border-[#634832]/20 flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className="px-4 py-2 bg-white hover:bg-[#E8DCC4] disabled:opacity-30 active:scale-95 text-[#634832] border border-[#634832]/20 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-[#D97757] hover:bg-[#c66849] active:scale-95 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md cursor-pointer flex items-center gap-2"
          >
            <span>{isLast ? "Let's Start Farming!" : 'Next Step'}</span>
            {isLast ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

