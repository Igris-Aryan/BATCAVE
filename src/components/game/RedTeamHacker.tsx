import React from 'react';
import { SubstationNode, RedTeamMission } from '../../types/game';
import {
  Flame,
  Crosshair,
  Zap,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Shield,
  Target,
  Trophy,
} from 'lucide-react';

interface AttackPreset {
  id: string;
  name: string;
  type: 'DoS' | 'DDoS' | 'Brute Force' | 'BENIGN';
  targetProtocol: string;
  port: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Safe';
  description: string;
  samplePayload: {
    duration: number;
    fwdPackets: number;
    bwdPackets: number;
    fwdLength: number;
    bwdLength: number;
    synFlags: number;
    rstFlags: number;
    flowPacketsSec: number;
    flowBytesSec: number;
    iatMean: number;
  };
}

interface RedTeamHackerProps {
  substations: SubstationNode[];
  selectedSubstationId: string;
  onSelectSubstation: (id: string) => void;
  missions: RedTeamMission[];
  presets: AttackPreset[];
  selectedPreset: AttackPreset;
  onSelectPreset: (preset: AttackPreset) => void;
  customPort: number;
  setCustomPort: (port: number) => void;
  flowPacketsSec: number;
  setFlowPacketsSec: (rate: number) => void;
  synFlags: number;
  setSynFlags: (flags: number) => void;
  fwdPackets: number;
  setFwdPackets: (pkts: number) => void;
  flowDuration: number;
  setFlowDuration: (duration: number) => void;
  isFiring: boolean;
  onLaunchAttack: () => void;
  onResetParams: () => void;
}

export const RedTeamHacker: React.FC<RedTeamHackerProps> = ({
  substations,
  selectedSubstationId,
  onSelectSubstation,
  missions,
  presets,
  selectedPreset,
  onSelectPreset,
  customPort,
  setCustomPort,
  flowPacketsSec,
  setFlowPacketsSec,
  synFlags,
  setSynFlags,
  fwdPackets,
  setFwdPackets,
  flowDuration,
  setFlowDuration,
  isFiring,
  onLaunchAttack,
  onResetParams,
}) => {
  // Exploit Assessment calculation
  const isHighRate = flowPacketsSec > 20000;
  const isHighSyn = synFlags > 50;
  const estimatedDetectionRisk = isHighRate || isHighSyn ? '98.8% (CRITICAL ALERT)' : '14.2% (STEALTH)';
  const estimatedDamage = isHighRate ? Math.min(60, Math.floor(flowPacketsSec / 40000) + 20) : 5;

  return (
    <div className="space-y-6 font-mono">
      {/* Red Team Missions Bar */}
      <div className="bg-[#030e06] border border-red-500/40 rounded-xl p-4 shadow-[0_0_15px_rgba(239,68,68,0.15)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-red-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-300 matrix-glow">
              // RED TEAM CAMPAIGN MISSIONS (OBJECTIVES &amp; XP)
            </h3>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">
            {missions.filter((m) => m.isCompleted).length} of {missions.length} COMPLETED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {missions.map((mission) => (
            <div
              key={mission.id}
              className={`p-3 rounded-lg border text-xs transition-all ${
                mission.isCompleted
                  ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300'
                  : 'bg-[#020b04] border-red-950/60 text-red-200/90'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase text-red-400">
                  {mission.title.split(':')[0]}
                </span>
                {mission.isCompleted ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900 border border-emerald-500 font-bold text-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> DONE
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950 border border-red-800 font-bold text-red-400">
                    +{mission.rewardXp} XP
                  </span>
                )}
              </div>
              <h4 className="font-bold text-emerald-100 text-[11px] mb-1 leading-snug">
                {mission.title.split(':')[1] || mission.title}
              </h4>
              <p className="text-[10px] text-emerald-500/80 line-clamp-2 leading-relaxed">
                {mission.objective}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Target Substation Quick Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
          <Target className="w-4 h-4 text-red-400" />
          // 1. SELECT TARGET POWER GRID SUBSTATION
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {substations.map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                onSelectSubstation(sub.id);
                setCustomPort(sub.port);
              }}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                sub.id === selectedSubstationId
                  ? 'border-red-500 bg-[#09180c] shadow-[0_0_12px_rgba(239,68,68,0.3)] ring-1 ring-red-500'
                  : 'border-emerald-900/60 bg-[#020b04] hover:border-emerald-600 hover:bg-[#041608]'
              }`}
            >
              <div className="text-[10px] text-emerald-400 font-mono">{sub.code}</div>
              <div className="text-xs font-bold text-emerald-100 truncate">{sub.name.split('(')[0]}</div>
              <div className="text-[10px] text-emerald-500 mt-1 flex justify-between">
                <span>HP: {sub.hp}%</span>
                <span>Port {sub.port}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Attack Vector Presets */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
          <Flame className="w-4 h-4 text-red-400" />
          // 2. CHOOSE ADVERSARIAL VECTOR PRESET
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#08180c] border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)] ring-1 ring-red-500'
                    : 'bg-[#020b04] border-emerald-900/60 hover:border-emerald-600 hover:bg-[#041608]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                        preset.severity === 'Critical'
                          ? 'bg-red-950 text-red-300 border-red-700'
                          : preset.severity === 'High'
                          ? 'bg-amber-950 text-amber-300 border-amber-700'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      }`}
                    >
                      {preset.severity}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">{preset.type}</span>
                  </div>
                  <h4 className="text-xs font-bold text-emerald-100 mb-1 leading-snug">
                    {preset.name}
                  </h4>
                  <p className="text-[10px] text-emerald-500 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-emerald-900/40 text-[10px] flex justify-between text-emerald-400 font-mono">
                  <span>Port: {preset.port}</span>
                  <span>{preset.targetProtocol.split(' ')[0]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exploit Tuner & Exploit Assessment Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Telemetry Controls */}
        <div className="lg:col-span-8 bg-[#030e06] border border-emerald-500/40 rounded-xl p-5 shadow-lg space-y-4 matrix-grid-bg">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-2 matrix-glow">
              <Sliders className="w-4 h-4 text-emerald-400" />
              // 3. FINE-TUNE INJECTION TELEMETRY
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-[#020b04] px-2 py-0.5 rounded border border-emerald-800">
              VECTOR: {selectedPreset.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-emerald-300">
                <span>&gt; Destination SCADA Port:</span>
                <span className="font-mono text-emerald-400">{customPort}</span>
              </div>
              <input
                type="number"
                value={customPort}
                onChange={(e) => setCustomPort(Number(e.target.value))}
                className="w-full bg-[#020904] border border-emerald-800/80 rounded px-3 py-1.5 text-emerald-200 font-mono focus:border-emerald-400 focus:outline-hidden"
              />
              <p className="text-[10px] text-emerald-600">Modbus: 502, DNP3: 20000, SSH: 22, IEC: 104</p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-emerald-300">
                <span>&gt; Flow Packets / Second:</span>
                <span className="font-mono text-red-400 font-bold">
                  {Number(flowPacketsSec).toLocaleString()}
                </span>
              </div>
              <input
                type="number"
                value={flowPacketsSec}
                onChange={(e) => setFlowPacketsSec(Number(e.target.value))}
                className="w-full bg-[#020904] border border-emerald-800/80 rounded px-3 py-1.5 text-emerald-200 font-mono focus:border-emerald-400 focus:outline-hidden"
              />
              <p className="text-[10px] text-emerald-600">Benign &lt; 500/s &bull; DoS Exhaustion &gt; 50,000/s</p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-emerald-300">
                <span>&gt; SYN Flag Count:</span>
                <span className="font-mono text-amber-400 font-bold">{synFlags} Flags</span>
              </div>
              <input
                type="number"
                value={synFlags}
                onChange={(e) => setSynFlags(Number(e.target.value))}
                className="w-full bg-[#020904] border border-emerald-800/80 rounded px-3 py-1.5 text-emerald-200 font-mono focus:border-emerald-400 focus:outline-hidden"
              />
              <p className="text-[10px] text-emerald-600">High SYN without ACK handshakes triggers DoS classifier</p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-emerald-300">
                <span>&gt; Forward Packets:</span>
                <span className="font-mono text-emerald-400 font-bold">{fwdPackets}</span>
              </div>
              <input
                type="number"
                value={fwdPackets}
                onChange={(e) => setFwdPackets(Number(e.target.value))}
                className="w-full bg-[#020904] border border-emerald-800/80 rounded px-3 py-1.5 text-emerald-200 font-mono focus:border-emerald-400 focus:outline-hidden"
              />
              <p className="text-[10px] text-emerald-600">Total forward frames in capture window</p>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onLaunchAttack}
              disabled={isFiring}
              className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-950 text-white rounded font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed font-mono"
            >
              {isFiring ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  INJECTING ATTACK SALVO...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  &gt; FIRE ATTACK SALVO AT SUBSTATION
                </>
              )}
            </button>
            <button
              onClick={onResetParams}
              className="w-full sm:w-auto px-4 py-3 bg-[#020b04] hover:bg-[#041708] border border-emerald-800/60 text-emerald-300 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-mono"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Parameters
            </button>
          </div>
        </div>

        {/* Right: Exploit Pre-Flight Assessment Gauge */}
        <div className="lg:col-span-4 bg-[#030e06] border border-emerald-500/40 rounded-xl p-5 shadow-lg flex flex-col justify-between matrix-grid-bg">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-2 mb-3 matrix-glow">
              <Activity className="w-4 h-4 text-emerald-400" />
              // EXPLOIT IMPACT ASSESSMENT
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#020b04] border border-emerald-900/60 space-y-1.5">
                <span className="text-[10px] text-emerald-500 block">PROJECTED DAMAGE:</span>
                <div className="text-lg font-black text-red-400 font-mono">
                  ~{estimatedDamage} HP BREAKER LOSS
                </div>
                <div className="w-full h-1.5 bg-[#020703] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all"
                    style={{ width: `${Math.min(100, estimatedDamage * 2)}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#020b04] border border-emerald-900/60 space-y-1.5">
                <span className="text-[10px] text-emerald-500 block">AI DETECTION PROBABILITY:</span>
                <div
                  className={`text-base font-black font-mono ${
                    isHighRate || isHighSyn ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {estimatedDetectionRisk}
                </div>
                <p className="text-[10px] text-emerald-600">
                  {isHighRate || isHighSyn
                    ? 'AI Random Forest classifier will easily recognize this volumetric signature.'
                    : 'Stealth parameters may slip through as normal grid sensor traffic.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-900/40 text-[10px] text-emerald-500 flex justify-between">
            <span>TARGET: {substations.find((s) => s.id === selectedSubstationId)?.name.split(' ')[0]}</span>
            <span className="text-emerald-300 font-bold">READY TO INJECT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
