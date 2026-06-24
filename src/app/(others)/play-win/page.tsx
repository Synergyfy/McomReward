"use client";

import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

const challenges = [
  { id: 1, title: "Play 3 games of Ball Drop", reward: "+200 pts", progress: 66, current: 2, total: 3 },
  { id: 2, title: "Scratch 1 Card", reward: "+100 pts", progress: 100, current: 1, total: 1 },
  { id: 3, title: "Refer a friend to join a game", reward: "+500 pts", progress: 0, current: 0, total: 1 }
];

const competitions = [
  { name: "Weekend Sprint", timeLeft: "2d left", type: "emoji_events" },
  { name: "Team Battle", timeLeft: "Join Now", type: "groups" }
];

const wheelPrizes = [
  "100 Points",
  "Free Coffee",
  "Try Again",
  "1,000 Points",
  "10% Cashback",
  "500 Points"
];

export default function PlayWinRewards() {
  const [spinning, setSpinning] = useState(false);
  const [prizeResult, setPrizeResult] = useState<string | null>(null);
  const [scratchRevealed, setScratchRevealed] = useState(false);
  const [ballMultiplier, setBallMultiplier] = useState<number | null>(null);
  const [ballDropping, setBallDropping] = useState(false);

  const controls = useAnimation();

  const handleSpin = async () => {
    if (spinning) return;
    setSpinning(true);
    setPrizeResult(null);

    // Random prize sector (0-5)
    const prizeIndex = Math.floor(Math.random() * wheelPrizes.length);
    // Number of full rotations (e.g. 5-10) + target degree
    const degreesPerPrize = 360 / wheelPrizes.length;
    const targetDeg = 360 * 5 + (wheelPrizes.length - prizeIndex) * degreesPerPrize - (degreesPerPrize / 2);
    await controls.start({
      rotate: targetDeg,
      transition: { duration: 4, ease: [0.1, 0.8, 0.25, 1] }
    });

    setSpinning(false);
    setPrizeResult(wheelPrizes[prizeIndex]);
  };

  const handleDropBall = () => {
    if (ballDropping) return;
    setBallDropping(true);
    setBallMultiplier(null);

    setTimeout(() => {
      const multipliers = [2, 5, 10, 25, 50];
      const randomMult = multipliers[Math.floor(Math.random() * multipliers.length)];
      setBallMultiplier(randomMult);
      setBallDropping(false);
    }, 2000);
  };

  const handleScratch = () => {
    setScratchRevealed(true);
  };

  const handleResetScratch = () => {
    setScratchRevealed(false);
  };

  return (
    <div className="bg-[#f9fafb] text-gray-800 min-h-screen py-2 sm:py-8 max-w-7xl mx-auto px-2 sm:px-6 space-y-6 sm:space-y-12">
      {/* Header */}
      <header className="flex items-center gap-3 py-2 sm:py-4 border-b border-gray-150">
        <Link href="/participant/market" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-orange-600 active:scale-95 transition-all shadow-sm">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">MCOM Games</p>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Play & Win</h1>
        </div>
      </header>

      {/* Hero Section with Spin Wheel */}
      <section className="relative py-4 sm:py-8 flex flex-col lg:flex-row items-center gap-6 sm:gap-12 overflow-hidden">
        
        {/* Left Content */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-1.5 bg-orange-500/10 text-orange-600 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border border-orange-500/20">
            <span className="material-symbols-outlined text-sm">stars</span>
            <span>DAILY GAMES LIVE</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold font-headline-lg leading-tight tracking-tight text-gray-900">
            Play & Win <br/>
            <span className="text-orange-600">Rewards</span>
          </h1>
          
          <p className="text-sm md:text-base text-gray-500 leading-relaxed max-w-md">
            Experience the thrill of discovery. Play our exclusive gamified experiences daily and <span className="font-bold text-orange-600">Win up to 5,000 pts</span> instantly.
          </p>
          
          <div className="flex flex-wrap gap-3 pt-2">
            <button 
              onClick={handleSpin}
              disabled={spinning}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 disabled:text-gray-400 text-white px-8 py-3.5 rounded-full font-bold text-xs shadow-md shadow-orange-600/10 active:scale-95 transition-all"
            >
              {spinning ? "Spinning..." : "Play Now"}
            </button>
            <button className="border border-gray-300 text-gray-600 px-8 py-3.5 rounded-full font-bold text-xs hover:bg-gray-50 transition active:scale-95">
              View Leaderboard
            </button>
          </div>
        </div>

        {/* Right Content: Interactive Conic Conical Spin Wheel */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative">
          
          {/* Wheel Frame */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-[10px] border-white shadow-2xl overflow-hidden flex items-center justify-center bg-white">
            
            <motion.div 
              animate={controls}
              initial={{ rotate: 0 }}
              style={{ originX: 0.5, originY: 0.5 }}
              className="absolute inset-0 w-full h-full rounded-full"
            >
              {/* Conic sections via pure conic gradient - using premium dark/orange palette */}
              <div 
                className="w-full h-full rounded-full"
                style={{ 
                  background: 'conic-gradient(from 0deg, #f54900 0deg 60deg, #c03d00 60deg 120deg, #f97316 120deg 180deg, #ea580c 180deg 240deg, #dd6b20 240deg 300deg, #c05621 300deg 360deg)' 
                }} 
              />
              
              {/* Text labels for sectors */}
              {wheelPrizes.map((prize, idx) => {
                const rotation = idx * 60 + 30; // Center text in segment
                return (
                  <div 
                    key={idx}
                    className="absolute top-0 left-0 w-full h-full flex items-start justify-center origin-center py-2"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    <span className="text-[10px] md:text-xs font-bold text-white tracking-tight transform rotate-180 uppercase select-none origin-center pt-8">
                      {prize}
                    </span>
                  </div>
                );
              })}
            </motion.div>

            {/* Inner Center Hub */}
            <div className="w-16 h-16 rounded-full bg-white shadow-xl z-20 flex items-center justify-center border border-gray-150 cursor-pointer" onClick={handleSpin}>
              <span className="text-lg font-bold text-orange-600 select-none">SPIN</span>
            </div>
          </div>

          {/* Needle Indicator */}
          <div className="absolute top-[-8px] z-30">
            <div className="w-6 h-8 bg-orange-600 rounded-b-full shadow-md" />
          </div>

          {/* Floating Result Badge */}
          {prizeResult && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-orange-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-md"
            >
              Result: {prizeResult}!
            </motion.div>
          )}
        </div>
      </section>

      {/* Bento Grid Games & Actions */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 pt-2 sm:pt-6">
        
        {/* Ball Drop cascading multiply challenge */}
        <div className="col-span-1 md:col-span-8 bg-white border border-gray-200 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[300px] shadow-sm">
          <div className="space-y-3 relative z-10 max-w-sm">
            <h2 className="text-2xl font-bold font-headline-lg text-gray-900">Ball Drop</h2>
            <p className="text-xs text-gray-505 leading-relaxed">
              The gravity-defying challenge. Watch the orange spheres cascade and multiply your points.
            </p>
            <div className="pt-2 text-orange-600 font-extrabold text-lg">
              Multiplier up to 50x
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4 relative z-10">
            <button 
              onClick={handleDropBall}
              disabled={ballDropping}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 disabled:text-gray-400 text-white px-6 py-2 rounded-full font-bold text-xs transition active:scale-95 shadow-md shadow-orange-600/10"
            >
              {ballDropping ? "Dropping..." : "Drop Ball"}
            </button>
            {ballMultiplier && (
              <span className="text-orange-600 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold animate-bounce">
                Win Multiplier: {ballMultiplier}x!
              </span>
            )}
          </div>

          {/* Decorative cascading pegs */}
          <div className="absolute right-6 bottom-6 top-6 w-1/3 opacity-20 pointer-events-none flex flex-col justify-around items-center">
            <div className="flex gap-4">
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
            </div>
            <div className="flex gap-6">
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
            </div>
            <div className="flex gap-4">
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
            </div>
            <div className="w-6 h-6 rounded-full border border-orange-600 bg-orange-500/20 animate-ping" />
          </div>
        </div>

        {/* Scratch Cards */}
        <div className="col-span-1 md:col-span-4 bg-white border border-gray-200 rounded-3xl p-8 flex flex-col justify-between min-h-[300px] shadow-sm group">
          <div className="space-y-3">
            <div className="w-10 h-10 bg-orange-500/10 text-orange-600 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Scratch Cards</h2>
            <p className="text-xs text-gray-505 leading-relaxed">
              Reveal hidden treasures. 3 matching symbols win the jackpot.
            </p>
          </div>

          <div 
            onClick={handleScratch}
            className="h-28 bg-gray-50 hover:bg-orange-50/50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer transition-colors relative"
          >
            {scratchRevealed ? (
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-orange-600 tracking-wider">
                  🔥 🔥 🔥
                </div>
                <p className="text-[10px] text-gray-600 font-bold">You Won 1,000 pts!</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleResetScratch(); }}
                  className="text-[9px] text-orange-600 underline uppercase hover:text-orange-500"
                >
                  Reset Card
                </button>
              </div>
            ) : (
              <div className="text-center space-y-1">
                <span className="material-symbols-outlined text-gray-400 text-2xl group-hover:scale-105 transition-transform">gesture</span>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scratch Here</p>
              </div>
            )}
          </div>
        </div>

        {/* Competitions */}
        <div className="col-span-1 md:col-span-5 bg-orange-500/10 border border-orange-500/20 rounded-3xl p-8 flex flex-col justify-between min-h-[300px]">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Competitions</h2>
            <div className="space-y-2">
              {competitions.map((comp, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex gap-2.5 items-center">
                    <span className="material-symbols-outlined text-orange-600 text-lg">{comp.type}</span>
                    <span className="font-bold text-xs text-gray-800">{comp.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">{comp.timeLeft}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 space-y-1">
            <span className="text-3xl font-extrabold text-orange-600 tracking-tight">1M PTS</span>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Prize Pool</p>
          </div>
        </div>

        {/* Daily Challenges */}
        <div className="col-span-1 md:col-span-7 bg-white border border-gray-200 rounded-3xl p-8 flex flex-col justify-between min-h-[300px] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Daily Challenges</h2>
              <p className="text-xs text-gray-505 mt-0.5">Complete tasks to unlock bonus spins.</p>
            </div>
            <span className="bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-500/20">
              2/3 Done
            </span>
          </div>

          <div className="space-y-4 pt-4">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>{challenge.title}</span>
                  <span className="text-orange-600">{challenge.reward}</span>
                </div>
                <div className="relative">
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-600 rounded-full transition-all" 
                      style={{ width: `${challenge.progress}%` }} 
                    />
                  </div>
                  <span className="absolute top-3 right-0 text-[10px] text-gray-400 font-bold">
                    {challenge.current}/{challenge.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* BottomNavBar Section */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-white border-t border-gray-150 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] rounded-t-xl md:hidden">
        <Link href="/participant" className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]">home</span>
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </Link>
        <Link href="/participant/market" className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]">storefront</span>
          <span className="text-[10px] font-bold mt-0.5">Market</span>
        </Link>
        <Link href="/participant/wallet" className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          <span className="text-[10px] font-bold mt-0.5">Wallet</span>
        </Link>
        <Link href="/play-win" className="flex flex-col items-center justify-center bg-orange-100 text-orange-600 rounded-full px-4 py-1 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>casino</span>
          <span className="text-[10px] font-bold mt-0.5">Games</span>
        </Link>
        <Link href="/participant/settings" className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]">person</span>
          <span className="text-[10px] font-bold mt-0.5">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
