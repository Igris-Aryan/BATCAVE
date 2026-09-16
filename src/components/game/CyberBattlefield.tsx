import React from 'react';
import { SubstationNode } from '../../types/game';
import {
  Server,
  Zap,
  Shield,
  ShieldAlert,
  Flame,
  Activity,
  Cpu,
  Radio,
  Crosshair,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface CyberBattlefieldProps {
  substations: SubstationNode[];
  selectedSubstationId: string;
  onSelectSubstation: (id: string) => void;
  isAttacking: boolean;
  lastVerdict?: {
    isAttack: boolean;
    confidence: string;
    substationId: string;
    damageDealt: number;
    shieldBlocked: boolean;
  } | null;
}

export const CyberBattlefield: React.FC<CyberBattlefieldProps> = ({
  substations,
  selectedSubstationId,
  onSelectSubstation,
  isAttacking,
  lastVerdict,
}) => {
  return (
    <div className="bg-[#030e06] border border-emerald-500/40 rounded-xl p-5 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden font-mono matrix-grid-bg">
      {/* Dynamic Laser Strike Animation during attack */}
      {isAttacking && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
          <div className="w-full h-1 bg-red-500 animate-ping opacity-75 shadow-[0_0_20px_#ef4444]" />
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-12">
            <span className="text-xs font-bold text-red-400 bg-black/80 px-2 py-1 rounded border border-red-500 animate-bounce">
              ⚡ INJECTING TELEMETRY STREAM...
            </span>
          </div>
        </div>
      )}

      {/* Battlefield Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-900/40 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h2 className="text-xs sm:text-sm font-bold text-emerald-200 matrix-glow uppercase tracking-wider">
            // SMART GRID TOPOLOGY // LIVE POWER INFRASTRUCTURE
          </h2>
        </div>
        <span className="text-[10px] text-emerald-500 font-mono">
          CLICK NODE TO SELECT TARGET // 4 NODES SYNCED
        </span>
      </div>

      {/* 3-Column Arena Layout: Hacker Console -> AI Classifier -> Grid Substations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left (3 Cols): Hacker Console / Injection Origin */}
        <div className="lg:col-span-3 bg-[#020b04] border border-red-900/60 rounded-lg p-3.5 space-y-2 relative shadow-[0_0_10px_rgba(239,68,68,0.15)]">
          <div className="flex items-center justify-between border-b border-red-900/40 pb-2">
            <span className="text-[11px] font-bold text-red-400 flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-red-500" />
              ATTACK TERMINAL
            </span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </div>

          <div className="text-[11px] space-y-1 text-emerald-400/90 font-mono">
            <p className="flex justify-between">
              <span className="text-emerald-600">ORIGIN:</span>
              <span className="text-red-400 font-bold">10.0.84.219 (SPOOFED)</span>
            </p>
            <p className="flex justify-between">
              <span className="text-emerald-600">INJECTOR:</span>
              <span className="text-emerald-300">SCADA-EXPLOIT v3</span>
            </p>
            <p className="flex justify-between">
              <span className="text-emerald-600">TARGET:</span>
              <span className="text-yellow-300 font-bold">
                {substations.find((s) => s.id === selectedSubstationId)?.name.split('(')[0] || 'NODE-01'}
              </span>
            </p>
          </div>

          <div className="pt-1">
            <div className="text-[9px] uppercase tracking-wider text-red-400/80 bg-red-950/40 border border-red-800/60 p-1.5 rounded text-center">
              READY FOR PACKET INJECTION
            </div>
          </div>
        </div>

        {/* Center (3 Cols): AI Defense Engine & Model Radar */}
        <div className="lg:col-span-3 bg-[#020b04] border border-emerald-500/50 rounded-lg p-3.5 text-center space-y-2 relative shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-300 matrix-glow">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>AI CLASSIFIER CORE</span>
          </div>

          {/* Animated Radar Pulse Circle */}
          <div className="relative w-20 h-20 mx-auto rounded-full border border-emerald-500/40 flex items-center justify-center overflow-hidden bg-[#031407]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.2)_0%,transparent_70%)] animate-pulse" />
            <div className="w-12 h-12 rounded-full border border-emerald-400/60 flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            {/* Spinning Radar Sweep */}
            <div className="absolute w-full h-0.5 bg-linear-to-r from-transparent via-emerald-400 to-transparent top-1/2 -translate-y-1/2 animate-spin origin-center opacity-80" />
          </div>

          <div className="text-[10px] text-emerald-400 space-y-0.5">
            <div className="text-emerald-300 font-bold">RANDOM FOREST ENSEMBLE</div>
            <div className="text-emerald-500">ACCURACY: 98.6% &bull; CIC-IDS2017</div>
          </div>

          {/* Last Verdict Feedback Banner */}
          {lastVerdict && (
            <div
              className={`p-1.5 rounded text-[10px] font-bold border transition-all ${
                lastVerdict.shieldBlocked
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  : 'bg-red-950/80 border-red-500 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
              }`}
            >
              {lastVerdict.shieldBlocked
                ? `🛡️ AI DEFENSE BLOCKED (${lastVerdict.confidence})`
                : `💥 BREACH! -${lastVerdict.damageDealt} HP TO NODE!`}
            </div>
          )}
        </div>

        {/* Right (6 Cols): 4 Grid Substations Map */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {substations.map((sub) => {
            const isSelected = sub.id === selectedSubstationId;
            const isBreached = sub.hp <= 0;
            const isCritical = sub.hp < 40 && !isBreached;

            return (
              <div
                key={sub.id}
                onClick={() => onSelectSubstation(sub.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all relative ${
                  isSelected
                    ? 'border-emerald-400 bg-[#06200d] shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400'
                    : isBreached
                    ? 'border-red-900/60 bg-[#120404] opacity-75'
                    : 'border-emerald-900/60 bg-[#020b04] hover:border-emerald-600 hover:bg-[#041608]'
                }`}
              >
                {/* Node Top Row */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-emerald-300 font-mono truncate">
                    {sub.code}
                  </span>
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase border ${
                      isBreached
                        ? 'bg-red-950 text-red-300 border-red-700 animate-pulse'
                        : isCritical
                        ? 'bg-amber-950 text-amber-300 border-amber-700'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                    }`}
                  >
                    {isBreached ? 'OFFLINE' : isCritical ? 'CRITICAL' : 'ONLINE'}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-emerald-100 mb-2 truncate">
                  {sub.name}
                </h4>

                {/* Substation Health Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-emerald-400">
                    <span>BREAKER HP:</span>
                    <span
                      className={`font-bold ${
                        isBreached ? 'text-red-500' : isCritical ? 'text-amber-400' : 'text-emerald-300'
                      }`}
                    >
                      {sub.hp}/{sub.maxHp} HP
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#020703] border border-emerald-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isBreached
                          ? 'bg-red-600'
                          : isCritical
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(0, (sub.hp / sub.maxHp) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Protocol & Power Specs */}
                <div className="mt-2 pt-1.5 border-t border-emerald-900/40 flex items-center justify-between text-[10px] text-emerald-500">
                  <span>Port: {sub.port}</span>
                  <span className="text-emerald-300 font-bold">{sub.powerOutputMW} MW</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
