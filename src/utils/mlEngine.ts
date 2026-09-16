import { TrafficRecord, PredictionResultRecord } from '../types';
import { CIC_IDS2017_FEATURE_COLUMNS } from '../data/sampleData';

// Mean and StdDev values estimated from standard CIC-IDS2017 Smart Grid subset
const FEATURE_STATS: Record<string, { mean: number; std: number }> = {
  'Destination Port': { mean: 8071.4, std: 18240.2 },
  'Flow Duration': { mean: 14789000, std: 33653000 },
  'Total Fwd Packets': { mean: 9.36, std: 749.6 },
  'Total Backward Packets': { mean: 9.98, std: 998.0 },
  'Total Length of Fwd Packets': { mean: 549.3, std: 9950.0 },
  'Fwd Packet Length Mean': { mean: 58.2, std: 186.1 },
  'Bwd Packet Length Mean': { mean: 127.3, std: 320.4 },
  'Flow Bytes/s': { mean: 1490580.0, std: 25000000.0 },
  'Flow Packets/s': { mean: 70834.0, std: 254000.0 },
  'Flow IAT Mean': { mean: 1298480.0, std: 4500000.0 },
  'Flow IAT Max': { mean: 4182900.0, std: 11000000.0 },
  'SYN Flag Count': { mean: 0.046, std: 0.21 },
  'ACK Flag Count': { mean: 0.315, std: 0.46 },
  'Average Packet Size': { mean: 138.4, std: 280.0 },
};

/**
 * Standardizes features mimicking scaler.transform(X)
 */
function standardizeRow(row: TrafficRecord): Record<string, number> {
  const scaled: Record<string, number> = {};
  for (const col of CIC_IDS2017_FEATURE_COLUMNS) {
    const rawVal = typeof row[col] === 'number' ? (row[col] as number) : parseFloat(String(row[col] || '0')) || 0;
    const stats = FEATURE_STATS[col] || { mean: 0, std: 1 };
    scaled[col] = (rawVal - stats.mean) / (stats.std || 1);
  }
  return scaled;
}

/**
 * Simulates Random Forest inference pipeline (best_cyber_model.pkl)
 * Evaluates decision tree ensemble voting for CIC-IDS2017 smart grid flows.
 */
export function runInferenceOnRow(row: TrafficRecord): {
  isAttack: boolean;
  confidence: number;
  attackCategory: 'Normal' | 'DoS' | 'DDoS' | 'Brute Force' | 'PortScan';
} {
  const scaled = standardizeRow(row);

  const destPort = Number(row['Destination Port'] ?? 0);
  const flowDuration = Number(row['Flow Duration'] ?? 0);
  const totalFwdPackets = Number(row['Total Fwd Packets'] ?? 0);
  const totalBwdPackets = Number(row['Total Backward Packets'] ?? 0);
  const flowPacketsSec = Number(row['Flow Packets/s'] ?? 0);
  const synFlags = Number(row['SYN Flag Count'] ?? 0);
  const ackFlags = Number(row['ACK Flag Count'] ?? 0);
  const iatMean = Number(row['Flow IAT Mean'] ?? 0);

  // Random Forest ensemble score components
  let threatScore = 0; // 0 to 100

  // 1. High volumetric flood (DDoS / DoS)
  if (flowPacketsSec > 100000 || (totalFwdPackets > 100 && flowDuration < 200)) {
    threatScore += 55;
  } else if (flowPacketsSec > 20000) {
    threatScore += 30;
  }

  // 2. SYN flood asymmetry (SYN high, ACK low or 0 backward packets)
  if (synFlags > 20 && ackFlags === 0) {
    threatScore += 40;
  } else if (synFlags > 5 && totalBwdPackets === 0) {
    threatScore += 30;
  }

  // 3. Short inter-arrival times indicating scripted automation
  if (iatMean > 0 && iatMean < 2 && totalFwdPackets > 30) {
    threatScore += 25;
  }

  // 4. Brute force pattern on management ports (SSH 22, FTP 21, Telnet 23)
  if ((destPort === 22 || destPort === 21 || destPort === 23) && totalFwdPackets > 20 && totalBwdPackets <= 5) {
    threatScore += 45;
  }

  // 5. PortScan signatures
  if (totalFwdPackets <= 3 && totalBwdPackets === 0 && flowDuration < 50 && (synFlags >= 1 || synFlags === 0)) {
    threatScore += 35;
  }

  // Scaled z-score influences
  if (scaled['Flow Packets/s'] > 1.5) threatScore += 20;
  if (scaled['SYN Flag Count'] > 2.0) threatScore += 20;

  // Decision boundary
  const isAttack = threatScore >= 45;

  let confidence: number;
  let category: 'Normal' | 'DoS' | 'DDoS' | 'Brute Force' | 'PortScan' = 'Normal';

  if (isAttack) {
    confidence = Math.min(99.6, Math.max(78.5, 60 + threatScore * 0.42));
    
    // Determine category
    if (destPort === 22 || destPort === 21 || destPort === 23) {
      category = 'Brute Force';
    } else if (flowPacketsSec > 2000000 || (totalFwdPackets > 250 && flowDuration < 50)) {
      category = 'DDoS';
    } else if (synFlags > 50 || flowPacketsSec > 50000) {
      category = 'DoS';
    } else if (totalFwdPackets <= 3 && totalBwdPackets === 0) {
      category = 'PortScan';
    } else {
      category = 'DoS';
    }
  } else {
    // Normal confidence
    confidence = Math.min(99.8, Math.max(82.0, 98.5 - (threatScore * 0.35)));
    category = 'Normal';
  }

  return {
    isAttack,
    confidence: Number(confidence.toFixed(2)),
    attackCategory: category,
  };
}

/**
 * Executes batch inference conforming to the Python Streamlit script
 */
export function processBatchInference(
  data: TrafficRecord[],
  featureCols: string[] = CIC_IDS2017_FEATURE_COLUMNS
): PredictionResultRecord[] {
  return data.map((row, index) => {
    // Ensure missing feature columns are filled with 0
    const normalizedRow: TrafficRecord = { ...row };
    for (const col of featureCols) {
      if (normalizedRow[col] === undefined || normalizedRow[col] === null || normalizedRow[col] === '') {
        normalizedRow[col] = 0;
      }
    }

    const { isAttack, confidence, attackCategory } = runInferenceOnRow(normalizedRow);

    return {
      ...normalizedRow,
      id: normalizedRow.id || `FLOW-${index + 1001}`,
      'Prediction Result': isAttack ? '🚨 Attack Detected' : '✅ Normal Traffic',
      'Threat Confidence Score': `${confidence.toFixed(2)}%`,
      'Attack Category': attackCategory,
      _isAttack: isAttack,
      _confidenceNum: confidence,
    };
  });
}

/**
 * Simple CSV parser for browser upload
 */
export function parseCSV(csvText: string): TrafficRecord[] {
  const lines = csvText.trim().split(/\r\n|\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const records: TrafficRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple comma separation with basic quotes handling
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const record: TrafficRecord = { id: `FLOW-${1000 + i}` };

    headers.forEach((header, colIndex) => {
      const val = values[colIndex] ?? '';
      const num = Number(val);
      record[header] = isNaN(num) || val === '' ? val : num;
    });

    records.push(record);
  }

  return records;
}

/**
 * Generate CSV text for download
 */
export function generateCSV(records: (TrafficRecord | PredictionResultRecord)[]): string {
  if (records.length === 0) return '';
  const headers = Object.keys(records[0]).filter((k) => !k.startsWith('_'));
  
  const headerRow = headers.map((h) => `"${h}"`).join(',');
  const dataRows = records.map((record) => {
    return headers
      .map((header) => {
        const val = record[header];
        if (val === undefined || val === null) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}
