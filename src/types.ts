export interface TrafficRecord {
  id?: string | number;
  'Destination Port'?: number;
  'Flow Duration'?: number;
  'Total Fwd Packets'?: number;
  'Total Backward Packets'?: number;
  'Total Length of Fwd Packets'?: number;
  'Fwd Packet Length Mean'?: number;
  'Bwd Packet Length Mean'?: number;
  'Flow Bytes/s'?: number;
  'Flow Packets/s'?: number;
  'Flow IAT Mean'?: number;
  'Flow IAT Max'?: number;
  'SYN Flag Count'?: number;
  'ACK Flag Count'?: number;
  'Average Packet Size'?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface PredictionResultRecord extends TrafficRecord {
  'Prediction Result': '🚨 Attack Detected' | '✅ Normal Traffic';
  'Threat Confidence Score': string;
  'Attack Category'?: 'Normal' | 'DoS' | 'DDoS' | 'Brute Force' | 'PortScan';
  _isAttack: boolean;
  _confidenceNum: number;
}

export type NavigationPage = 
  | '📊 Overview & EDA' 
  | '⚡ Live Traffic Detection Engine'
  | '🎯 Self-Attack Simulator';

export interface ArtifactStatus {
  isLoaded: boolean;
  modelName: string;
  scalerName: string;
  featureCount: number;
}
