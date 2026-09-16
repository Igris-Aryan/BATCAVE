import React, { useState } from 'react';
import { TrafficRecord, PredictionResultRecord } from '../types';
import { runInferenceOnRow } from '../utils/mlEngine';
import { sound } from '../utils/soundFX';
import {
  SubstationNode,
  GameMode,
  PlayerStats,
  RedTeamMission,
  WaveIncident,
  GameAchievement,
} from '../types/game';
import {
  INITIAL_SUBSTATIONS,
  INITIAL_MISSIONS,
  BLUE_TEAM_WAVES,
  INITIAL_ACHIEVEMENTS,
} from '../data/gameData';
import { GameHUD } from './game/GameHUD';
import { CyberBattlefield } from './game/CyberBattlefield';
import { RedTeamHacker } from './game/RedTeamHacker';
import { BlueTeamDefender } from './game/BlueTeamDefender';
import {
  Crosshair,
  Flame,
  Activity,
  Terminal,
  Cpu,
  RotateCcw,
  Play,
  Download,
  Trophy,
  CheckCircle2,
  AlertTriangle,
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

const ATTACK_PRESETS: AttackPreset[] = [
  {
    id: 'syn-flood-scada',
    name: 'SYN Flood Exhaustion (Substation RTU)',
    type: 'DoS',
    targetProtocol: 'Modbus / TCP (Port 502)',
    port: 502,
    severity: 'Critical',
    description:
      'Floods smart grid programmable logic controller (PLC) or RTU Modbus port 502 with half-open TCP connections, exhausting circuit breaker telemetry buffers.',
    samplePayload: {
      duration: 120,
      fwdPackets: 280,
      bwdPackets: 0,
      fwdLength: 16800,
      bwdLength: 0,
      synFlags: 280,
      rstFlags: 0,
      flowPacketsSec: 2333333,
      flowBytesSec: 140000000,
      iatMean: 0.42,
    },
  },
  {
    id: 'ddos-volumetric',
    name: 'Distributed Low-Rate Pulsing DDoS',
    type: 'DDoS',
    targetProtocol: 'DNP3 / IEC-60870 (Port 20000)',
    port: 20000,
    severity: 'Critical',
    description:
      'High-velocity pulsing floods from distributed botnet nodes targeting wide-area Phasor Measurement Units (PMU) concentrators.',
    samplePayload: {
      duration: 8500,
      fwdPackets: 520,
      bwdPackets: 4,
      fwdLength: 260000,
      bwdLength: 160,
      synFlags: 45,
      rstFlags: 12,
      flowPacketsSec: 61647,
      flowBytesSec: 30607058,
      iatMean: 16.3,
    },
  },
  {
    id: 'ssh-modbus-bruteforce',
    name: 'Substation Gateway SSH Brute-Force',
    type: 'Brute Force',
    targetProtocol: 'Secure Shell Management (Port 22)',
    port: 22,
    severity: 'High',
    description:
      'Repeated automated credential spray targeting supervisory control gateway terminal servers to gain shell privileges on power grid nodes.',
    samplePayload: {
      duration: 3500000,
      fwdPackets: 18,
      bwdPackets: 16,
      fwdLength: 1240,
      bwdLength: 3200,
      synFlags: 1,
      rstFlags: 0,
      flowPacketsSec: 9.7,
      flowBytesSec: 1268,
      iatMean: 105800,
    },
  },
  {
    id: 'benign-telemetry',
    name: 'Standard SCADA Periodic State Telemetry',
    type: 'BENIGN',
    targetProtocol: 'Modbus Periodic Poll (Port 502)',
    port: 502,
    severity: 'Safe',
    description:
      'Standard benign periodic sensor polling (voltage, bus frequency, phase angle) between smart meters and grid operations centers.',
    samplePayload: {
      duration: 45000,
      fwdPackets: 4,
      bwdPackets: 4,
      fwdLength: 240,
      bwdLength: 384,
      synFlags: 1,
      rstFlags: 0,
      flowPacketsSec: 177.7,
      flowBytesSec: 13866,
      iatMean: 6428,
    },
  },
];

interface SimulationLog {
  id: string;
  timestamp: string;
  targetPort: number;
  vector: string;
  packetsPerSec: number;
  result: 'ATTACK' | 'BENIGN';
  confidence: string;
  category: string;
  details: string;
}

export const AttackSimulatorView: React.FC = () => {
  // Game & Mode State
  const [gameMode, setGameMode] = useState<GameMode>('RED_TEAM');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [substations, setSubstations] = useState<SubstationNode[]>(INITIAL_SUBSTATIONS);
  const [selectedSubstationId, setSelectedSubstationId] = useState<string>('sub-01');
  const [missions, setMissions] = useState<RedTeamMission[]>(INITIAL_MISSIONS);
  const [achievements, setAchievements] = useState<GameAchievement[]>(INITIAL_ACHIEVEMENTS);

  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    rankTitle: 'CYBER SPECIALIST',
    level: 1,
    xp: 0,
    xpToNextLevel: 500,
    score: 0,
    gridHealth: 100,
    megawattsOnline: 2440,
    attacksLaunched: 0,
    attacksBlocked: 0,
    substationsBreached: 0,
    streak: 0,
    combo: 1,
  });

  // Simulator Parameters State
  const [selectedPreset, setSelectedPreset] = useState<AttackPreset>(ATTACK_PRESETS[0]);
  const [customPort, setCustomPort] = useState<number>(ATTACK_PRESETS[0].port);
  const [flowPacketsSec, setFlowPacketsSec] = useState<number>(
    ATTACK_PRESETS[0].samplePayload.flowPacketsSec
  );
  const [synFlags, setSynFlags] = useState<number>(ATTACK_PRESETS[0].samplePayload.synFlags);
  const [flowDuration, setFlowDuration] = useState<number>(
    ATTACK_PRESETS[0].samplePayload.duration
  );
  const [fwdPackets, setFwdPackets] = useState<number>(
    ATTACK_PRESETS[0].samplePayload.fwdPackets
  );
  const [isFiring, setIsFiring] = useState<boolean>(false);
  const [currentTestResult, setCurrentTestResult] = useState<PredictionResultRecord | null>(null);
  const [lastVerdictBanner, setLastVerdictBanner] = useState<{
    isAttack: boolean;
    confidence: string;
    substationId: string;
    damageDealt: number;
    shieldBlocked: boolean;
  } | null>(null);

  const [simulationLogs, setSimulationLogs] = useState<SimulationLog[]>([
    {
      id: 'SIM-001',
      timestamp: '14:23:08',
      targetPort: 502,
      vector: 'SYN Flood Exhaustion',
      packetsPerSec: 2333333,
      result: 'ATTACK',
      confidence: '99.4%',
      category: 'DoS',
      details: 'Modbus PLC port buffer overflow triggered',
    },
    {
      id: 'SIM-000',
      timestamp: '14:22:45',
      targetPort: 502,
      vector: 'Standard SCADA Poll',
      packetsPerSec: 177,
      result: 'BENIGN',
      confidence: '98.8%',
      category: 'BENIGN',
      details: 'Baseline sensor telemetry flow verified normal',
    },
  ]);

  // Unlock Achievement Helper
  const unlockAchievement = (achId: string) => {
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id === achId && !ach.unlocked) {
          sound.playSuccess();
          return { ...ach, unlocked: true };
        }
        return ach;
      })
    );
  };

  // Add XP and handle leveling up
  const awardPlayer = (xpEarned: number, scoreEarned: number) => {
    setPlayerStats((prev) => {
      let newXp = prev.xp + xpEarned;
      let newLevel = prev.level;
      let nextLevelXp = prev.xpToNextLevel;
      let newTitle = prev.rankTitle;

      if (newXp >= nextLevelXp) {
        newLevel += 1;
        newXp -= nextLevelXp;
        nextLevelXp = Math.round(nextLevelXp * 1.5);
        if (newLevel === 2) newTitle = 'GRID INFILTRATOR';
        else if (newLevel === 3) newTitle = 'CYBER WARFARE OPERATOR';
        else if (newLevel >= 4) newTitle = 'ZERO-DAY MASTER';
        sound.playSuccess();
      }

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        xpToNextLevel: nextLevelXp,
        rankTitle: newTitle,
        score: Math.max(0, prev.score + scoreEarned),
        attacksLaunched: prev.attacksLaunched + 1,
      };
    });
  };

  const handleSelectPreset = (preset: AttackPreset) => {
    setSelectedPreset(preset);
    setCustomPort(preset.port);
    setFlowPacketsSec(preset.samplePayload.flowPacketsSec);
    setSynFlags(preset.samplePayload.synFlags);
    setFlowDuration(preset.samplePayload.duration);
    setFwdPackets(preset.samplePayload.fwdPackets);
    setCurrentTestResult(null);
  };

  // Launch Attack Salvo against the selected substation
  const handleLaunchAttack = () => {
    setIsFiring(true);
    setCurrentTestResult(null);
    if (soundEnabled) sound.playLaser();

    // First Blood Achievement
    unlockAchievement('ach-first-blood');

    const injectedRow: TrafficRecord = {
      id: `SIM-${Math.floor(100 + Math.random() * 900)}`,
      'Destination Port': customPort,
      'Flow Duration': flowDuration,
      'Total Fwd Packets': fwdPackets,
      'Total Backward Packets': selectedPreset.samplePayload.bwdPackets,
      'Total Length of Fwd Packets': selectedPreset.samplePayload.fwdLength,
      'Total Length of Bwd Packets': selectedPreset.samplePayload.bwdLength,
      'Fwd Packet Length Max': 1460,
      'Fwd Packet Length Min': 40,
      'Fwd Packet Length Mean': 120,
      'Bwd Packet Length Max': 1460,
      'Bwd Packet Length Min': 0,
      'Bwd Packet Length Mean': 80,
      'Flow Bytes/s': selectedPreset.samplePayload.flowBytesSec,
      'Flow Packets/s': flowPacketsSec,
      'Flow IAT Mean': selectedPreset.samplePayload.iatMean,
      'Flow IAT Std': 12,
      'Flow IAT Max': 100,
      'Flow IAT Min': 1,
      'Fwd IAT Total': flowDuration,
      'Bwd IAT Total': flowDuration,
      'Fwd PSH Flags': 0,
      'Bwd PSH Flags': 0,
      'Fwd URG Flags': 0,
      'Bwd URG Flags': 0,
      'Fwd Header Length': 32,
      'Bwd Header Length': 32,
      'Fwd Packets/s': flowPacketsSec / 2,
      'Bwd Packets/s': 0,
      'Packet Length Min': 40,
      'Packet Length Max': 1460,
      'Packet Length Mean': 110,
      'FIN Flag Count': 0,
      'SYN Flag Count': synFlags,
      'RST Flag Count': selectedPreset.samplePayload.rstFlags,
      'PSH Flag Count': 0,
      'ACK Flag Count': selectedPreset.type === 'BENIGN' ? 4 : 0,
      'URG Flag Count': 0,
      'CWE Flag Count': 0,
      'ECE Flag Count': 0,
      'Down/Up Ratio': 0,
      'Average Packet Size': 115,
      'Subflow Fwd Packets': fwdPackets,
      'Subflow Fwd Bytes': selectedPreset.samplePayload.fwdLength,
      'Init_Win_bytes_forward': 64240,
      'Init_Win_bytes_backward': 0,
      'Active Mean': 0,
      'Idle Mean': 0,
    };

    setTimeout(() => {
      const inference = runInferenceOnRow(injectedRow);
      const isAttack = inference.isAttack;
      const pred: PredictionResultRecord = {
        ...injectedRow,
        id: String(injectedRow.id),
        'Prediction Result': isAttack ? '🚨 Attack Detected' : '✅ Normal Traffic',
        'Threat Confidence Score': `${inference.confidence.toFixed(2)}%`,
        'Attack Category': inference.attackCategory,
        _isAttack: isAttack,
        _confidenceNum: inference.confidence,
      };

      setCurrentTestResult(pred);
      setIsFiring(false);

      // Check for High Confidence Catch Achievement
      if (inference.confidence > 98) {
        unlockAchievement('ach-ai-catch');
      }

      // Check for Stealth Achievement
      if (!isAttack && selectedPreset.type === 'BENIGN') {
        unlockAchievement('ach-stealth');
      }

      // Compute Damage to Substation
      let damage = 0;
      let shieldBlocked = false;

      if (isAttack) {
        // AI detected it!
        shieldBlocked = true;
        if (soundEnabled) sound.playShieldBlock();

        // High volumetric DoS still leaks 15% shock damage past shield buffer
        if (flowPacketsSec > 50000) {
          damage = Math.floor(flowPacketsSec / 100000) + 10;
        }
        awardPlayer(50, 100);
      } else {
        // Bypassed AI!
        shieldBlocked = false;
        if (selectedPreset.type !== 'BENIGN') {
          damage = 35;
          if (soundEnabled) sound.playExplosion();
          awardPlayer(150, 300);
        } else {
          awardPlayer(40, 80);
        }
      }

      // Apply damage to target substation node
      setSubstations((prev) =>
        prev.map((sub) => {
          if (sub.id === selectedSubstationId) {
            const nextHp = Math.max(0, sub.hp - damage);
            if (nextHp < 50) {
              unlockAchievement('ach-sub-breaker');
            }
            return {
              ...sub,
              hp: nextHp,
              status: nextHp <= 0 ? 'BREACHED' : nextHp < 40 ? 'UNDER_ATTACK' : sub.status,
            };
          }
          return sub;
        })
      );

      // Recalculate global grid health
      setSubstations((currentSubs) => {
        const totalHp = currentSubs.reduce((acc, s) => acc + s.hp, 0);
        const maxTotal = currentSubs.length * 100;
        const gridPct = Math.round((totalHp / maxTotal) * 100);
        setPlayerStats((prev) => ({
          ...prev,
          gridHealth: gridPct,
          megawattsOnline: Math.round(2440 * (gridPct / 100)),
        }));
        return currentSubs;
      });

      // Update Red Team Missions status
      setMissions((prev) =>
        prev.map((m) => {
          if (m.id === 'm-01' && !isAttack && selectedPreset.type === 'BENIGN') {
            awardPlayer(m.rewardXp, m.rewardScore);
            return { ...m, isCompleted: true };
          }
          if (m.id === 'm-02' && isAttack && synFlags > 100 && customPort === 502) {
            awardPlayer(m.rewardXp, m.rewardScore);
            return { ...m, isCompleted: true };
          }
          if (m.id === 'm-03' && customPort === 20000 && flowPacketsSec > 30000) {
            awardPlayer(m.rewardXp, m.rewardScore);
            return { ...m, isCompleted: true };
          }
          return m;
        })
      );

      // Set banner verdict
      setLastVerdictBanner({
        isAttack,
        confidence: pred['Threat Confidence Score'],
        substationId: selectedSubstationId,
        damageDealt: damage,
        shieldBlocked,
      });

      // Append to simulation logs
      const newLog: SimulationLog = {
        id: String(injectedRow.id),
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        targetPort: customPort,
        vector: selectedPreset.name,
        packetsPerSec: flowPacketsSec,
        result: pred._isAttack ? 'ATTACK' : 'BENIGN',
        confidence: pred['Threat Confidence Score'],
        category: pred['Attack Category'],
        details: `${selectedPreset.targetProtocol} • ${synFlags} SYN Flags`,
      };
      setSimulationLogs((prev) => [newLog, ...prev.slice(0, 14)]);
    }, 600);
  };

  // Blue team defender callback
  const handleBlueTeamResult = (
    incident: WaveIncident,
    action: 'BLOCK' | 'ALLOW' | 'ISOLATE'
  ) => {
    if (action === 'BLOCK') {
      if (incident.isRealAttack) {
        awardPlayer(80, 250);
        setPlayerStats((prev) => ({
          ...prev,
          attacksBlocked: prev.attacksBlocked + 1,
          combo: prev.combo + 1,
        }));
        unlockAchievement('ach-grid-hero');
      } else {
        // False positive
        setPlayerStats((prev) => ({
          ...prev,
          combo: 1,
          gridHealth: Math.max(0, prev.gridHealth - 10),
        }));
      }
    } else if (action === 'ALLOW') {
      if (!incident.isRealAttack) {
        awardPlayer(50, 150);
        setPlayerStats((prev) => ({
          ...prev,
          combo: prev.combo + 1,
        }));
      } else {
        // Breach! Damage substation
        setSubstations((prev) =>
          prev.map((s) => {
            if (s.id === incident.targetNodeId) {
              const newHp = Math.max(0, s.hp - 25);
              return { ...s, hp: newHp, status: newHp <= 0 ? 'BREACHED' : 'UNDER_ATTACK' };
            }
            return s;
          })
        );
        setPlayerStats((prev) => ({
          ...prev,
          combo: 1,
          gridHealth: Math.max(0, prev.gridHealth - 20),
        }));
      }
    }
  };

  // Reboot power grid and repair substations
  const handleResetGrid = () => {
    setSubstations(INITIAL_SUBSTATIONS);
    setPlayerStats((prev) => ({
      ...prev,
      gridHealth: 100,
      megawattsOnline: 2440,
    }));
    sound.playSuccess();
  };

  // Export audit logs to CSV
  const handleExportCSV = () => {
    const headers = ['ID,Timestamp,Injected Vector,Port,PacketsPerSec,Classification,Verdict,Confidence\n'];
    const rows = simulationLogs.map(
      (l) => `"${l.id}","${l.timestamp}","${l.vector}",${l.targetPort},${l.packetsPerSec},"${l.category}","${l.result}","${l.confidence}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartgrid-sim-audit-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-mono">
      {/* Header Banner */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#04140a] border border-red-500/40 text-red-400 text-xs font-semibold uppercase tracking-wider mb-2 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
          <Crosshair className="w-3.5 h-3.5 text-red-400" />
          <span>CYBER_GRID_WAR // SMART_GRID_ATTACK_SIMULATOR</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-red-400 tracking-tight leading-tight flex items-center gap-3 matrix-glow">
          <span className="text-red-500">&gt;</span>
          <span>ATTACK SIM &amp; GRID CYBER WARFARE</span>
        </h1>
        <p className="text-xs sm:text-sm text-emerald-400/80 mt-1 font-mono">
          Play as Red Team Hacker infiltrating SCADA substations or Blue Team Defender protecting the city power grid with Random Forest AI defense.
        </p>
      </div>

      {/* TOP GAME HUD BAR */}
      <GameHUD
        gameMode={gameMode}
        setGameMode={setGameMode}
        playerStats={playerStats}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onResetGrid={handleResetGrid}
      />

      {/* VISUAL CYBER BATTLEFIELD MAP */}
      <CyberBattlefield
        substations={substations}
        selectedSubstationId={selectedSubstationId}
        onSelectSubstation={setSelectedSubstationId}
        isAttacking={isFiring}
        lastVerdict={lastVerdictBanner}
      />

      {/* DYNAMIC MODE VIEW CONTENT */}
      {gameMode === 'RED_TEAM' && (
        <RedTeamHacker
          substations={substations}
          selectedSubstationId={selectedSubstationId}
          onSelectSubstation={setSelectedSubstationId}
          missions={missions}
          presets={ATTACK_PRESETS}
          selectedPreset={selectedPreset}
          onSelectPreset={handleSelectPreset}
          customPort={customPort}
          setCustomPort={setCustomPort}
          flowPacketsSec={flowPacketsSec}
          setFlowPacketsSec={setFlowPacketsSec}
          synFlags={synFlags}
          setSynFlags={setSynFlags}
          fwdPackets={fwdPackets}
          setFwdPackets={setFwdPackets}
          flowDuration={flowDuration}
          setFlowDuration={setFlowDuration}
          isFiring={isFiring}
          onLaunchAttack={handleLaunchAttack}
          onResetParams={() => handleSelectPreset(selectedPreset)}
        />
      )}

      {gameMode === 'BLUE_TEAM' && (
        <BlueTeamDefender
          waves={BLUE_TEAM_WAVES}
          substations={substations}
          onDefendResult={handleBlueTeamResult}
          onRestartWaves={() => {}}
        />
      )}

      {gameMode === 'SANDBOX' && (
        <div className="space-y-6">
          {/* Preset Selection Grid */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2 matrix-glow">
              <Flame className="w-4 h-4 text-red-400" />
              // SELECT ADVERSARIAL VECTOR PRESET
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {ATTACK_PRESETS.map((preset) => {
                const isSelected = selectedPreset.id === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between font-mono ${
                      isSelected
                        ? 'bg-[#06180b] border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.3)] ring-1 ring-red-500/60'
                        : 'bg-[#030e06]/90 border-emerald-900/50 hover:border-emerald-500/50 hover:bg-[#05160a]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${
                            preset.severity === 'Critical'
                              ? 'bg-red-950/80 text-red-300 border-red-700/80'
                              : preset.severity === 'High'
                              ? 'bg-amber-950/80 text-amber-300 border-amber-700/80'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                          }`}
                        >
                          {preset.severity}
                        </span>
                        <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                          {preset.type}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-emerald-100 mb-1.5 leading-snug">
                        {preset.name}
                      </h3>
                      <p className="text-[11px] text-emerald-500/90 line-clamp-2 leading-relaxed font-sans">
                        {preset.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-emerald-900/40 flex items-center justify-between text-[11px] font-mono text-emerald-400/80">
                      <span>PORT: {preset.port}</span>
                      <span className="text-emerald-300 font-bold">{preset.targetProtocol.split(' ')[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simulator Control Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#041208]/90 rounded-xl border border-emerald-500/25 p-6 shadow-lg space-y-6 matrix-grid-bg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-200 flex items-center gap-2 matrix-glow">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  // CUSTOM TELEMETRY VECTOR SYNTHESIZER
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 bg-[#020b04] px-2.5 py-1 rounded border border-emerald-800/60">
                  {selectedPreset.name}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-emerald-300 flex justify-between">
                    <span>&gt; Destination SCADA Port:</span>
                    <span className="font-mono text-emerald-400 font-bold">{customPort}</span>
                  </label>
                  <input
                    type="number"
                    value={customPort}
                    onChange={(e) => setCustomPort(Number(e.target.value))}
                    className="w-full bg-[#020904] border border-emerald-800/60 rounded px-3 py-2 text-emerald-200 font-mono focus:border-emerald-400 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-emerald-600 font-mono">
                    Modbus: 502, DNP3: 20000, SSH: 22, IEC: 104
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-emerald-300 flex justify-between">
                    <span>&gt; Flow Packets / Second:</span>
                    <span className="font-mono text-red-400 font-bold">
                      {Number(flowPacketsSec).toLocaleString()}
                    </span>
                  </label>
                  <input
                    type="number"
                    value={flowPacketsSec}
                    onChange={(e) => setFlowPacketsSec(Number(e.target.value))}
                    className="w-full bg-[#020904] border border-emerald-800/60 rounded px-3 py-2 text-emerald-200 font-mono focus:border-emerald-400 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-emerald-600 font-mono">
                    Exhaustion threshold &gt; 50,000/s
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-emerald-300 flex justify-between">
                    <span>&gt; SYN Flag Count:</span>
                    <span className="font-mono text-amber-400 font-bold">{synFlags} flags</span>
                  </label>
                  <input
                    type="number"
                    value={synFlags}
                    onChange={(e) => setSynFlags(Number(e.target.value))}
                    className="w-full bg-[#020904] border border-emerald-800/60 rounded px-3 py-2 text-emerald-200 font-mono focus:border-emerald-400 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-emerald-600 font-mono">
                    Elevated SYN triggers DoS classifier
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-emerald-300 flex justify-between">
                    <span>&gt; Forward Packets:</span>
                    <span className="font-mono text-emerald-400 font-bold">{fwdPackets}</span>
                  </label>
                  <input
                    type="number"
                    value={fwdPackets}
                    onChange={(e) => setFwdPackets(Number(e.target.value))}
                    className="w-full bg-[#020904] border border-emerald-800/60 rounded px-3 py-2 text-emerald-200 font-mono focus:border-emerald-400 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-emerald-600 font-mono">
                    Forward frames inside flow window
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleLaunchAttack}
                  disabled={isFiring}
                  className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-500 disabled:bg-red-950 text-white rounded font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed font-mono"
                >
                  {isFiring ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin text-white" />
                      TRANSMITTING INJECTION...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      &gt; INJECT INTO MODEL PIPELINE
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleSelectPreset(selectedPreset)}
                  className="w-full sm:w-auto px-4 py-3.5 bg-[#020b04] hover:bg-[#041708] border border-emerald-800/60 text-emerald-300 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-mono"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </div>

            {/* Inference Result Card */}
            <div className="bg-[#041208]/90 rounded-xl border border-emerald-500/25 p-6 shadow-lg flex flex-col justify-between matrix-grid-bg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-2 matrix-glow">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    // REAL-TIME VERDICT
                  </h3>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>

                {currentTestResult ? (
                  <div className="space-y-4 animate-fadeIn">
                    <div
                      className={`p-4 rounded-xl border text-center ${
                        currentTestResult._isAttack
                          ? 'bg-red-950/60 border-red-600/80 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                          : 'bg-emerald-950/60 border-emerald-600/80 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">
                        CLASSIFIER PREDICTION
                      </div>
                      <div className="text-xl sm:text-2xl font-black tracking-tight matrix-glow">
                        {currentTestResult['Prediction Result']}
                      </div>
                      <div className="text-xs mt-1 font-mono">
                        Category: <strong>{currentTestResult['Attack Category']}</strong>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-emerald-900/40">
                        <span className="text-emerald-500">Confidence Score:</span>
                        <span className="font-mono font-bold text-emerald-200">
                          {currentTestResult['Threat Confidence Score']}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-emerald-900/40">
                        <span className="text-emerald-500">Target Port:</span>
                        <span className="font-mono text-emerald-200">{currentTestResult['Destination Port']}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-emerald-900/40">
                        <span className="text-emerald-500">Packet Rate:</span>
                        <span className="font-mono text-emerald-200">
                          {Number(currentTestResult['Flow Packets/s']).toLocaleString()} /s
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 border border-dashed border-emerald-900/60 rounded-xl flex flex-col items-center justify-center text-center p-4 text-emerald-600">
                    <Crosshair className="w-8 h-8 mb-2 text-emerald-700" />
                    <p className="text-xs font-bold text-emerald-500">AWAITING INJECTION</p>
                    <p className="text-[10px] text-emerald-700 mt-1 font-mono">
                      Click "&gt; INJECT INTO MODEL" to test responses.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-900/40 text-[10px] text-emerald-600 flex items-center justify-between">
                <span>KERNEL: Random Forest</span>
                <span className="font-mono text-emerald-400 font-bold">ACCURACY 98.6%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACHIEVEMENTS / BADGES ROW */}
      <div className="bg-[#030e06] border border-emerald-500/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-200 matrix-glow">
              // CYBER WARFARE ACHIEVEMENTS &amp; BADGES
            </h3>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">
            {achievements.filter((a) => a.unlocked).length} OF {achievements.length} UNLOCKED
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-2.5 rounded-lg border text-xs transition-all ${
                ach.unlocked
                  ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-[#020703] border-emerald-950/60 text-emerald-700 opacity-60'
              }`}
            >
              <div className="text-lg mb-1">{ach.icon}</div>
              <div className="font-bold text-[11px] truncate">{ach.title}</div>
              <p className="text-[9px] mt-0.5 line-clamp-2 leading-tight opacity-80">{ach.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ADVERSARIAL SIMULATION AUDIT LOGS TABLE */}
      <div className="bg-[#041208]/90 rounded-xl border border-emerald-500/25 p-6 shadow-lg space-y-4 matrix-grid-bg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-emerald-200 flex items-center gap-2 matrix-glow">
              <Activity className="w-4 h-4 text-emerald-400" />
              // ADVERSARIAL SIMULATION AUDIT LOG
            </h3>
            <p className="text-xs text-emerald-500/80">
              Audit trail of injected test cases and AI model verdict history
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded bg-[#020b04] hover:bg-[#061d0d] border border-emerald-700 text-emerald-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer font-mono"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Export CSV
            </button>
            <span className="text-[10px] text-emerald-400 font-mono bg-[#020b04] px-2.5 py-1 rounded border border-emerald-800/60">
              {simulationLogs.length} Records
            </span>
          </div>
        </div>

        <div className="overflow-x-auto border border-emerald-900/60 rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#020b04] text-emerald-300 border-b border-emerald-800/60 font-semibold">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">ID</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Time</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Injected Vector</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Port</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Packets/s</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Classification</th>
                <th className="py-2.5 px-3 whitespace-nowrap">AI Verdict</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950 bg-[#030e06]">
              {simulationLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#071d0e] transition-colors">
                  <td className="py-2 px-3 text-emerald-400 font-bold">{log.id}</td>
                  <td className="py-2 px-3 text-emerald-500">{log.timestamp}</td>
                  <td className="py-2 px-3 text-emerald-200 font-medium">{log.vector}</td>
                  <td className="py-2 px-3 text-emerald-400 font-bold">{log.targetPort}</td>
                  <td className="py-2 px-3 text-emerald-300">
                    {Number(log.packetsPerSec).toLocaleString()}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                        log.category === 'DoS'
                          ? 'bg-red-950/60 text-red-300 border-red-800'
                          : log.category === 'DDoS'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                          : log.category === 'Brute Force'
                          ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                          : 'bg-emerald-950/50 text-emerald-400 border-emerald-800'
                      }`}
                    >
                      {log.category}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.result === 'ATTACK'
                          ? 'bg-red-950/90 text-red-300 border border-red-700/80 shadow-[0_0_8px_rgba(239,68,68,0.25)]'
                          : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/70 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                      }`}
                    >
                      {log.result === 'ATTACK' ? '🚨 ATTACK' : '✅ BENIGN'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-emerald-200 font-bold">{log.confidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
