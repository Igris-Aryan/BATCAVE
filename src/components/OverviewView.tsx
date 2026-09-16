import React, { useState } from 'react';
import { MetricCard } from './MetricCard';
import { CATEGORY_DISTRIBUTION, EDA_METRICS } from '../data/sampleData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { Shield, Zap, Activity, Info, BarChart3, Layers, Lock, Radio, Terminal, Server } from 'lucide-react';

export const OverviewView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'visualizations' | 'signatures' | 'features'>('visualizations');

  // Matrix green palette for visualizations
  const barColors = ['#10b981', '#34d399', '#059669', '#6ee7b7'];

  // Random Forest Feature Importance for CIC-IDS2017 Smart Grid Detection
  const featureImportances = [
    { feature: 'Flow Packets/s', importance: 0.245, category: 'Flow Dynamics' },
    { feature: 'SYN Flag Count', importance: 0.198, category: 'Flags & State' },
    { feature: 'Flow Duration', importance: 0.162, category: 'Temporal' },
    { feature: 'Destination Port', importance: 0.134, category: 'Protocol & Port' },
    { feature: 'Total Length of Fwd Packets', importance: 0.105, category: 'Volume' },
    { feature: 'Average Packet Size', importance: 0.086, category: 'Packet Size' },
    { feature: 'Flow IAT Mean', importance: 0.070, category: 'Inter-Arrival' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn font-mono">
      {/* Matrix Main Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#04140a] border border-emerald-500/40 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>CIC-IDS2017 // SMART_GRID_MATRIX_KERNEL</span>
        </div>
        <h1
          id="main-title"
          className="text-2xl sm:text-4xl font-black text-emerald-300 tracking-tight leading-tight flex items-center gap-3 matrix-glow"
        >
          <span className="text-emerald-400">&gt;</span>
          <span>SMART GRID CYBERATTACK DETECTION AI</span>
        </h1>
        <p id="sub-title" className="text-sm sm:text-base text-emerald-400/80 mt-2 font-mono">
          Network intrusion telemetry analysis via Random Forest classifier &amp; real-time anomaly inference.
        </p>
      </div>

      <hr className="border-emerald-900/40" />

      {/* 4 Metrics Row (Matches st.columns(4)) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          id="metric-total-traffic"
          label="Total Traffic Analyzed"
          value={EDA_METRICS.totalAnalyzed}
          delta={EDA_METRICS.totalAnalyzedDelta}
          deltaColor="normal"
        />
        <MetricCard
          id="metric-normal-traffic"
          label="Normal Grid Traffic"
          value={EDA_METRICS.normalTraffic}
          delta={EDA_METRICS.normalDelta}
          deltaColor="neutral"
        />
        <MetricCard
          id="metric-threats-detected"
          label="Threats Detected"
          value={EDA_METRICS.threatsDetected}
          delta={EDA_METRICS.threatsDelta}
          deltaColor="inverse"
        />
        <MetricCard
          id="metric-model-engine"
          label="Active Model Engine"
          value={EDA_METRICS.activeModel}
          delta={EDA_METRICS.modelDelta}
          deltaColor="normal"
        />
      </div>

      <hr className="border-emerald-900/40" />

      {/* Tabs Navigation for In-depth EDA */}
      <div className="flex items-center gap-2 border-b border-emerald-900/50 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('visualizations')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'visualizations'
              ? 'bg-[#051a0d] text-emerald-200 border-t-2 border-x border-emerald-500/60 shadow-[0_-2px_10px_rgba(16,185,129,0.2)]'
              : 'text-emerald-500/70 hover:text-emerald-300 hover:bg-[#031107]'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          [TRAFFIC DISTRIBUTION VISUALIZATIONS]
        </button>
        <button
          onClick={() => setActiveTab('signatures')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'signatures'
              ? 'bg-[#051a0d] text-emerald-200 border-t-2 border-x border-emerald-500/60 shadow-[0_-2px_10px_rgba(16,185,129,0.2)]'
              : 'text-emerald-500/70 hover:text-emerald-300 hover:bg-[#031107]'
          }`}
        >
          <Shield className="w-4 h-4 text-emerald-400" />
          [SMART GRID THREAT TAXONOMY]
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'features'
              ? 'bg-[#051a0d] text-emerald-200 border-t-2 border-x border-emerald-500/60 shadow-[0_-2px_10px_rgba(16,185,129,0.2)]'
              : 'text-emerald-500/70 hover:text-emerald-300 hover:bg-[#031107]'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          [RANDOM FOREST FEATURE IMPORTANCE]
        </button>
      </div>

      {activeTab === 'visualizations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-emerald-200 flex items-center gap-2 matrix-glow">
              <Activity className="w-5 h-5 text-emerald-400" />
              // TELEMETRY FLOW DISTRIBUTION
            </h2>
            <span className="text-xs text-emerald-400/80 bg-[#031207] px-3 py-1 rounded border border-emerald-800/60">
              REF: CIC-IDS2017 DATASET SPLIT
            </span>
          </div>

          {/* c1 and c2 Columns (Matches st.columns(2)) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* c1: Bar Chart (sns.barplot) */}
            <div className="bg-[#041208]/90 rounded-xl border border-emerald-500/25 p-5 shadow-lg flex flex-col matrix-grid-bg">
              <div className="mb-4">
                <h3 className="font-bold text-emerald-200 text-sm">
                  &gt; Flow Distribution Across Attack Classes
                </h3>
                <p className="text-xs text-emerald-500/80">
                  Packet Flow count per classified category in smart grid dataset
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={CATEGORY_DISTRIBUTION}
                    margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
                  >
                    <XAxis
                      dataKey="category"
                      stroke="#10b981"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#064e3b' }}
                    />
                    <YAxis
                      stroke="#10b981"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#064e3b' }}
                      tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                      label={{
                        value: 'Flow Count',
                        angle: -90,
                        position: 'insideLeft',
                        offset: 0,
                        style: { fontSize: 10, fill: '#34d399', fontFamily: 'monospace' },
                      }}
                    />
                    <Tooltip
                      cursor={{ fill: '#064e3b', opacity: 0.3 }}
                      formatter={(val: number | string | undefined) => [
                        typeof val === 'number' ? `${val.toLocaleString()} flows` : `${val}`,
                        'Flow Count',
                      ]}
                      contentStyle={{
                        backgroundColor: '#020b04',
                        borderRadius: '6px',
                        border: '1px solid #10b981',
                        color: '#a7f3d0',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {CATEGORY_DISTRIBUTION.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={barColors[index % barColors.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-900/40 flex items-center justify-around text-xs text-emerald-300">
                {CATEGORY_DISTRIBUTION.map((cat, idx) => (
                  <div key={cat.category} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-xs"
                      style={{ backgroundColor: barColors[idx % barColors.length] }}
                    />
                    <span>
                      {cat.category}: <strong className="text-emerald-100">{cat.count.toLocaleString()}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* c2: Pie Chart (ax.pie) */}
            <div className="bg-[#041208]/90 rounded-xl border border-emerald-500/25 p-5 shadow-lg flex flex-col matrix-grid-bg">
              <div className="mb-4">
                <h3 className="font-bold text-emerald-200 text-sm">
                  &gt; Proportional Threat Share Breakdown
                </h3>
                <p className="text-xs text-emerald-500/80">
                  Relative percentage breakdown of benign baseline vs attack vectors
                </p>
              </div>

              <div className="h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={CATEGORY_DISTRIBUTION}
                      dataKey="share"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      paddingAngle={3}
                      stroke="#020703"
                      strokeWidth={2}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                      labelLine={{ stroke: '#059669' }}
                    >
                      {CATEGORY_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${entry.category}`} fill={barColors[index % barColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number | string | undefined) => [
                        `${val}%`,
                        'Threat Share',
                      ]}
                      contentStyle={{
                        backgroundColor: '#020b04',
                        borderRadius: '6px',
                        border: '1px solid #10b981',
                        color: '#a7f3d0',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value: string) => (
                        <span className="text-xs text-emerald-300 font-mono">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-900/40 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {CATEGORY_DISTRIBUTION.map((cat, idx) => (
                  <div
                    key={cat.category}
                    className="p-2 rounded bg-[#020b04] border border-emerald-900/60 text-center"
                  >
                    <div className="font-bold font-mono" style={{ color: barColors[idx % barColors.length] }}>
                      {cat.share}%
                    </div>
                    <div className="text-emerald-500 text-[10px]">{cat.category}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'signatures' && (
        <div className="bg-[#041208]/90 rounded-xl border border-emerald-500/25 p-6 space-y-6 shadow-lg matrix-grid-bg">
          <div>
            <h3 className="text-base font-bold text-emerald-200 matrix-glow">
              // SMART GRID CRITICAL INFRASTRUCTURE ATTACK SIGNATURES
            </h3>
            <p className="text-xs text-emerald-400/80 mt-1">
              Operational cyber vulnerabilities detected across SCADA, Modbus, DNP3, and IEC-60870 industrial protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-red-500/40 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
                <Shield className="w-4 h-4 text-red-400" />
                <span>[DoS / Volumetric Flood]</span>
              </div>
              <p className="text-xs text-red-300/80 leading-relaxed mb-3">
                Floods substation Remote Terminal Units (RTUs) or Phasor Measurement Units (PMUs)
                with excessive SYN packets, causing buffer exhaustion and loss of grid telemetry.
              </p>
              <div className="text-[11px] bg-black/80 p-2.5 rounded border border-red-800/60 space-y-1 font-mono text-red-300">
                <div>Flow Packets/s: &gt; 100,000</div>
                <div>SYN/ACK Ratio: Infinite (0 ACKs)</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>[DDoS Distributed Overload]</span>
              </div>
              <p className="text-xs text-amber-300/80 leading-relaxed mb-3">
                Coordinated botnet attacks swarming grid Energy Management System (EMS) gateways
                with spoofed IP addresses to disrupt automatic generation control (AGC).
              </p>
              <div className="text-[11px] bg-black/80 p-2.5 rounded border border-amber-800/60 space-y-1 font-mono text-amber-300">
                <div>Flow Duration: &lt; 50ms (microburst)</div>
                <div>Total Fwd Packets: Multi-source</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>[Brute Force Credential Attack]</span>
              </div>
              <p className="text-xs text-emerald-300/80 leading-relaxed mb-3">
                Repeated authentication attempts on grid substation gateway interfaces (SSH port 22,
                Telnet port 23, Modbus port 502) seeking unauthorized actuator control.
              </p>
              <div className="text-[11px] bg-black/80 p-2.5 rounded border border-emerald-800/60 space-y-1 font-mono text-emerald-300">
                <div>Port: 22, 21, 23, 502</div>
                <div>Flow IAT Mean: Low Variance</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'features' && (
        <div className="bg-[#041208]/90 rounded-xl border border-emerald-500/25 p-6 space-y-4 shadow-lg matrix-grid-bg">
          <div>
            <h3 className="text-base font-bold text-emerald-200 matrix-glow">
              // RANDOM FOREST GINI FEATURE IMPORTANCE
            </h3>
            <p className="text-xs text-emerald-400/80 mt-1">
              Top predictive network telemetry variables utilized by <code className="text-emerald-300 bg-[#020b04] border border-emerald-700/60 px-1.5 py-0.5 rounded font-mono">best_cyber_model.pkl</code>.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {featureImportances.map((item) => (
              <div key={item.feature} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-emerald-200">&gt; {item.feature}</span>
                  <span className="font-mono text-emerald-400">
                    {(item.importance * 100).toFixed(1)}% ({item.category})
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#020703] rounded-full overflow-hidden border border-emerald-900/60">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                    style={{ width: `${(item.importance / 0.25) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
