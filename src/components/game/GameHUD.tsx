import React from 'react';
import { GameMode, PlayerStats } from '../../types/game';
import { sound } from '../../utils/soundFX';
import {
  ShieldAlert,
  Flame,
  Volume2,
  VolumeX,
  RotateCcw,
  Trophy,
  Zap,
  Activity,
  Radio,
  Sliders,
} from 'lucide-react';

interface GameHUDProps {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  playerStats: PlayerStats;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onResetGrid: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  gameMode,
  setGameMode,
  playerStats,
  soundEnabled,
  setSoundEnabled,
  onResetGrid,
}) => {
  const toggleSound = () => {
    const next = !soundEnabled;
    sound.enabled = next;
    setSoundEnabled(next);
    if (next) {
      sound.playLaser();
    }
  };

  const isGridCritical = playerStats.gridHealth <= 40;
  const xpPercent = Math.min(100, Math.round((playerStats.xp / playerStats.xpToNextLevel) * 100));

  return (
    <div className="bg-[#030e06] border border-emerald-500/40 rounded-xl p-4 shadow-[0_0_20px_rgba(16,185,129,0.15)] space-y-4 font-mono">
      {/* Top Bar: Player Identity, Level, Score & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-emerald-900/50 pb-3">
        {/* Left: Player Badge & Level */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#020b04] border border-emerald-500/70 flex items-center justify-center text-emerald-300 font-black text-sm shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            L{playerStats.level}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-300 tracking-wider matrix-glow">
                {playerStats.rankTitle}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/60 text-emerald-300">
                LVL {playerStats.level}
              </span>
            </div>
            {/* XP Progress Bar */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-32 sm:w-44 h-2 bg-[#020703] border border-emerald-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-emerald-400">
                {playerStats.xp}/{playerStats.xpToNextLevel} XP
              </span>
            </div>
          </div>
        </div>

        {/* Center: Score & Combo Streak */}
        <div className="flex items-center gap-4 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-[#020b04] border border-emerald-800/70 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <div>
              <span className="text-[10px] text-emerald-500 block leading-none">SCORE</span>
              <span className="text-sm font-bold text-yellow-300 font-mono">
                {playerStats.score.toLocaleString()} PTS
              </span>
            </div>
          </div>

          {playerStats.combo > 1 && (
            <div className="px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-600/70 flex items-center gap-1.5 animate-pulse">
              <Flame className="w-4 h-4 text-red-400" />
              <span className="text-xs font-black text-red-300">
                x{playerStats.combo} COMBO
              </span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Game SFX' : 'Enable Game SFX'}
            className="p-2 rounded-lg bg-[#020b04] border border-emerald-800 hover:border-emerald-500 text-emerald-300 hover:bg-[#061d0d] transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-emerald-700" />}
          </button>

          {/* Reset Grid */}
          <button
            onClick={onResetGrid}
            title="Reboot grid nodes and repair power substations"
            className="p-2 rounded-lg bg-[#020b04] border border-emerald-800 hover:border-red-500 text-emerald-400 hover:text-red-300 hover:bg-[#150707] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-emerald-800/80 bg-[#020b04] p-1 gap-1">
          <button
            onClick={() => {
              setGameMode('RED_TEAM');
              if (soundEnabled) sound.playLaser();
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 cursor-pointer ${
              gameMode === 'RED_TEAM'
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'text-red-400/80 hover:text-red-300 hover:bg-[#150505]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>RED TEAM // INVASION</span>
          </button>

          <button
            onClick={() => {
              setGameMode('BLUE_TEAM');
              if (soundEnabled) sound.playShieldBlock();
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 cursor-pointer ${
              gameMode === 'BLUE_TEAM'
                ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                : 'text-blue-400/80 hover:text-blue-300 hover:bg-[#050f1a]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>BLUE TEAM // DEFENDER</span>
          </button>

          <button
            onClick={() => {
              setGameMode('SANDBOX');
              if (soundEnabled) sound.playLaser();
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 cursor-pointer ${
              gameMode === 'SANDBOX'
                ? 'bg-emerald-600 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'text-emerald-400 hover:text-emerald-200 hover:bg-[#051a0c]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>EXPLOIT LAB // FREE SANDBOX</span>
          </button>
        </div>

        {/* Global Grid Stability Meter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>GRID STABILITY:</span>
          </div>

          <div className="flex-1 sm:w-36 h-4 bg-[#020703] border border-emerald-800 rounded overflow-hidden relative">
            <div
              className={`h-full transition-all duration-500 ${
                isGridCritical ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'
              }`}
              style={{ width: `${playerStats.gridHealth}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white drop-shadow-sm">
              {playerStats.gridHealth}% {isGridCritical ? 'BLACKOUT DANGER' : 'ONLINE'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span>{playerStats.megawattsOnline.toLocaleString()} MW</span>
          </div>
        </div>
      </div>
    </div>
  );
};
