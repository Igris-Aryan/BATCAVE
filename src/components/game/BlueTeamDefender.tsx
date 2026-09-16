import React, { useState, useEffect } from 'react';
import { WaveIncident, SubstationNode } from '../../types/game';
import { sound } from '../../utils/soundFX';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  Radio,
  RotateCcw,
  Trophy,
} from 'lucide-react';

interface BlueTeamDefenderProps {
  waves: WaveIncident[];
  substations: SubstationNode[];
  onDefendResult: (incident: WaveIncident, action: 'BLOCK' | 'ALLOW' | 'ISOLATE') => void;
  onRestartWaves: () => void;
}

export const BlueTeamDefender: React.FC<BlueTeamDefenderProps> = ({
  waves,
  substations,
  onDefendResult,
  onRestartWaves,
}) => {
  const [currentWaveIndex, setCurrentWaveIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [lastFeedback, setLastFeedback] = useState<{
    correct: boolean;
    title: string;
    details: string;
    scoreEarned: number;
  } | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const currentIncident = waves[currentWaveIndex];

  // Timer countdown
  useEffect(() => {
    if (isGameOver || !currentIncident) return;
    setTimeLeft(currentIncident.timeLimitSec);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired -> auto default allow
          handleAction('ALLOW');
          return currentIncident.timeLimitSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentWaveIndex, isGameOver]);

  const handleAction = (action: 'BLOCK' | 'ALLOW' | 'ISOLATE') => {
    if (!currentIncident || isGameOver) return;

    let correct = false;
    let title = '';
    let details = '';
    let scoreEarned = 0;

    if (action === 'BLOCK') {
      if (currentIncident.isRealAttack) {
        correct = true;
        title = '🛡️ THREAT NEUTRALIZED! [CORRECT BLOCK]';
        details = `The AI Random Forest model intercepted ${currentIncident.attackCategory} attack targeting Port ${currentIncident.targetPort}.`;
        scoreEarned = 250;
        sound.playShieldBlock();
      } else {
        correct = false;
        title = '⚠️ FALSE POSITIVE! [BLOCKED BENIGN SENSOR]';
        details = 'You blocked legitimate smart meter polling telemetry. City power frequency disrupted!';
        scoreEarned = -50;
        sound.playAlarm();
      }
    } else if (action === 'ALLOW') {
      if (!currentIncident.isRealAttack) {
        correct = true;
        title = '✅ LEGITIMATE FLOW VERIFIED! [CLEAN PASS]';
        details = 'Normal telemetry authorized. Smart grid voltage regulators remain in perfect balance.';
        scoreEarned = 150;
        sound.playSuccess();
      } else {
        correct = false;
        title = '💥 CRITICAL BREACH! [UNCHECKED ATTACK]';
        details = `Malicious ${currentIncident.attackCategory} payload bypassed defenses! Substation breaker tripped!`;
        scoreEarned = -100;
        sound.playExplosion();
      }
    } else if (action === 'ISOLATE') {
      correct = true;
      title = '⚡ CIRCUIT ISOLATED! [CONTAINMENT]';
      details = 'Substation isolated from grid bus. Attack stopped but power rerouting penalty incurred.';
      scoreEarned = 100;
      sound.playLaser();
    }

    setLastFeedback({ correct, title, details, scoreEarned });
    onDefendResult(currentIncident, action);

    if (currentWaveIndex + 1 < waves.length) {
      setCurrentWaveIndex((prev) => prev + 1);
    } else {
      setIsGameOver(true);
      sound.playSuccess();
    }
  };

  const handleReset = () => {
    setCurrentWaveIndex(0);
    setTimeLeft(15);
    setLastFeedback(null);
    setIsGameOver(false);
    onRestartWaves();
  };

  const targetSub = substations.find((s) => s.id === currentIncident?.targetNodeId);

  return (
    <div className="space-y-6 font-mono">
      {/* Blue Team Header */}
      <div className="bg-[#030e06] border border-blue-500/40 rounded-xl p-5 shadow-[0_0_15px_rgba(59,130,246,0.15)] space-y-3 matrix-grid-bg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-900/40 pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-300 matrix-glow">
                // BLUE TEAM // POWER GRID DEFENDER &bull; INCIDENT RESPONSE
              </h3>
              <p className="text-[11px] text-blue-400/80">
                Inspect incoming network traffic flows in real-time. Block cyber attacks and allow legitimate SCADA telemetry.
              </p>
            </div>
          </div>

          {!isGameOver && currentIncident && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-blue-300">
                INCIDENT {currentWaveIndex + 1} OF {waves.length}
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-950/80 border border-blue-600 text-blue-300 font-bold text-xs">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{timeLeft}s REMAINING</span>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Alert Banner */}
        {lastFeedback && (
          <div
            className={`p-3 rounded-lg border text-xs font-mono transition-all animate-fadeIn ${
              lastFeedback.correct
                ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'bg-red-950/70 border-red-500 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1">
              <span>{lastFeedback.title}</span>
              <span>{lastFeedback.scoreEarned > 0 ? `+${lastFeedback.scoreEarned}` : lastFeedback.scoreEarned} PTS</span>
            </div>
            <p className="text-[11px] opacity-90">{lastFeedback.details}</p>
          </div>
        )}

        {/* Active Wave Incident Details */}
        {!isGameOver && currentIncident ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Left 8 Cols: Incoming Packet Telemetry Radar */}
            <div className="lg:col-span-8 bg-[#020b04] border border-blue-900/60 rounded-xl p-4 space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-blue-900/40 pb-2">
                <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
                  {currentIncident.title}
                </span>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                  ORIGIN: {currentIncident.originIP}
                </span>
              </div>

              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded bg-[#031108] border border-emerald-900/60">
                  <span className="text-[10px] text-emerald-500 block">TARGET SUBSTATION:</span>
                  <span className="text-xs font-bold text-emerald-200 truncate block mt-0.5">
                    {targetSub?.name.split('(')[0] || 'Substation'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Port {currentIncident.targetPort}</span>
                </div>

                <div className="p-2.5 rounded bg-[#031108] border border-emerald-900/60">
                  <span className="text-[10px] text-emerald-500 block">PROTOCOL:</span>
                  <span className="text-xs font-bold text-emerald-200 block mt-0.5">
                    {currentIncident.protocolName}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">TCP / SCADA</span>
                </div>

                <div className="p-2.5 rounded bg-[#031108] border border-emerald-900/60">
                  <span className="text-[10px] text-emerald-500 block">FLOW PACKETS/S:</span>
                  <span
                    className={`text-xs font-bold block mt-0.5 font-mono ${
                      currentIncident.flowPacketsSec > 20000 ? 'text-red-400' : 'text-emerald-300'
                    }`}
                  >
                    {Number(currentIncident.flowPacketsSec).toLocaleString()} /s
                  </span>
                  <span className="text-[10px] text-emerald-500">
                    {currentIncident.flowPacketsSec > 20000 ? '⚠️ VOLUMETRIC SPIKE' : 'NORMAL RANGE'}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-[#031108] border border-emerald-900/60">
                  <span className="text-[10px] text-emerald-500 block">SYN FLAG COUNT:</span>
                  <span
                    className={`text-xs font-bold block mt-0.5 font-mono ${
                      currentIncident.synFlags > 20 ? 'text-amber-400' : 'text-emerald-300'
                    }`}
                  >
                    {currentIncident.synFlags} FLAGS
                  </span>
                  <span className="text-[10px] text-emerald-500">
                    {currentIncident.synFlags > 20 ? '⚠️ ABNORMAL SYN' : 'STANDARD HANDSHAKE'}
                  </span>
                </div>
              </div>

              {/* Analyst Intel / Hint */}
              <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/60 text-xs text-blue-200/90 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-blue-300 block">INTEL DISPATCH:</span>
                  <span className="text-[11px] leading-relaxed">{currentIncident.hint}</span>
                </div>
              </div>

              {/* 3 Response Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  onClick={() => handleAction('BLOCK')}
                  className="px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-mono"
                >
                  <ShieldAlert className="w-4 h-4" />
                  &gt; DEPLOY AI SHIELD (BLOCK)
                </button>

                <button
                  onClick={() => handleAction('ALLOW')}
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-black rounded-lg font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-mono"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  &gt; AUTHORIZE (ALLOW)
                </button>

                <button
                  onClick={() => handleAction('ISOLATE')}
                  className="px-4 py-3 bg-[#031407] hover:bg-[#06240d] border border-emerald-600/70 text-emerald-300 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-mono"
                >
                  <Zap className="w-4 h-4 text-yellow-400" />
                  &gt; ISOLATE NODE
                </button>
              </div>
            </div>

            {/* Right 4 Cols: Grid Defense Status Card */}
            <div className="lg:col-span-4 bg-[#020b04] border border-blue-900/60 rounded-xl p-4 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 border-b border-blue-900/40 pb-2 mb-3">
                  // SUBSTATION DEFENSE STATUS
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-emerald-400">
                    <span>Target Node:</span>
                    <span className="font-bold text-emerald-200">{targetSub?.name.split('(')[0]}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Node Health:</span>
                    <span className="font-mono font-bold text-emerald-300">{targetSub?.hp}% HP</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Power Delivery:</span>
                    <span className="font-mono text-yellow-400">{targetSub?.powerOutputMW} MW</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Classifier Engine:</span>
                    <span className="text-emerald-300">Random Forest (98.6%)</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded bg-blue-950/40 border border-blue-800 text-[10px] text-blue-300 font-mono text-center">
                DECIDE BEFORE TIMER RUNS OUT TO PREVENT CASCADE BLACKOUT
              </div>
            </div>
          </div>
        ) : (
          /* Game Over / Wave Complete Screen */
          <div className="p-8 text-center space-y-4 bg-[#020b04] border border-emerald-500/40 rounded-xl">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto animate-bounce" />
            <h3 className="text-xl font-black text-emerald-300 matrix-glow">
              // ALL DEFENSE WAVES COMPLETED!
            </h3>
            <p className="text-xs text-emerald-400 max-w-md mx-auto">
              You evaluated all Smart Grid cyber incident telemetry streams. The city power grid has survived the simulated adversary assault!
            </p>
            <div className="pt-2">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-emerald-500/30 transition-all inline-flex items-center gap-2 cursor-pointer font-mono"
              >
                <RotateCcw className="w-4 h-4" />
                &gt; REPLAY DEFENSE CAMPAIGN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
