export interface SubstationNode {
  id: string;
  name: string;
  code: string;
  protocol: string;
  port: number;
  hp: number;
  maxHp: number;
  powerOutputMW: number;
  status: 'ONLINE' | 'UNDER_ATTACK' | 'BREACHED' | 'ISOLATED';
  shieldIntegrity: number; // 0-100
  defenseMultiplier: number;
}

export type GameMode = 'RED_TEAM' | 'BLUE_TEAM' | 'SANDBOX';

export interface PlayerStats {
  rankTitle: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  score: number;
  gridHealth: number; // 0 - 100%
  megawattsOnline: number;
  attacksLaunched: number;
  attacksBlocked: number;
  substationsBreached: number;
  streak: number;
  combo: number;
}

export interface WaveIncident {
  id: string;
  title: string;
  originIP: string;
  targetNodeId: string;
  targetPort: number;
  protocolName: string;
  flowPacketsSec: number;
  synFlags: number;
  flowDuration: number;
  fwdPackets: number;
  isRealAttack: boolean;
  attackCategory: 'DoS' | 'DDoS' | 'Brute Force' | 'BENIGN';
  hint: string;
  timeLimitSec: number;
}

export interface RedTeamMission {
  id: string;
  title: string;
  objective: string;
  targetNodeId: string;
  recommendedVector: string;
  rewardXp: number;
  rewardScore: number;
  hint: string;
  isCompleted: boolean;
}

export interface GameAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}
