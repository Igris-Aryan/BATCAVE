import React, { useState, useRef } from 'react';
import { TrafficRecord, PredictionResultRecord } from '../types';
import { INITIAL_SAMPLE_TRAFFIC, CIC_IDS2017_FEATURE_COLUMNS } from '../data/sampleData';
import { parseCSV, processBatchInference, generateCSV } from '../utils/mlEngine';
import { MetricCard } from './MetricCard';
import {
  Upload,
  FileSpreadsheet,
  Play,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  Search,
  RefreshCw,
  FileText,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

interface DetectionEngineViewProps {
  artifactsLoaded: boolean;
  onEnableArtifacts: () => void;
}

export const DetectionEngineView: React.FC<DetectionEngineViewProps> = ({
  artifactsLoaded,
  onEnableArtifacts,
}) => {
  const [uploadedData, setUploadedData] = useState<TrafficRecord[] | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [results, setResults] = useState<PredictionResultRecord[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'ATTACK' | 'NORMAL'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResults(null);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setErrorMessage('The uploaded CSV file is empty or formatted incorrectly.');
          setUploadedData(null);
          return;
        }
        setUploadedData(parsed);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setErrorMessage(`Error parsing CSV file: ${message}`);
        setUploadedData(null);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the uploaded CSV file.');
      setUploadedData(null);
    };
    reader.readAsText(file);
  };

  // Load sample dataset
  const handleLoadSample = () => {
    setFileName('test_traffic.csv (Sample Grid Data)');
    setUploadedData(INITIAL_SAMPLE_TRAFFIC);
    setResults(null);
    setErrorMessage(null);
  };

  // Download sample test_traffic.csv
  const handleDownloadSample = () => {
    const csvContent = generateCSV(INITIAL_SAMPLE_TRAFFIC);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'test_traffic.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Run threat analysis
  const handleRunAnalysis = () => {
    if (!uploadedData || uploadedData.length === 0) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    // Simulate preprocessing & AI inference time matching st.spinner
    setTimeout(() => {
      try {
        const processed = processBatchInference(uploadedData, CIC_IDS2017_FEATURE_COLUMNS);
        setResults(processed);
        setCurrentPage(1);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMessage(`Error processing inference file: ${msg}`);
      } finally {
        setIsAnalyzing(false);
      }
    }, 900);
  };

  // Export processed results with prediction columns
  const handleDownloadResults = () => {
    if (!results) return;
    const csvContent = generateCSV(results);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `classified_${fileName || 'traffic_results.csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered results
  const filteredResults = (results || []).filter((row) => {
    if (filterType === 'ATTACK' && !row._isAttack) return false;
    if (filterType === 'NORMAL' && row._isAttack) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const idMatch = String(row.id || '').toLowerCase().includes(term);
      const portMatch = String(row['Destination Port'] || '').includes(term);
      const catMatch = String(row['Attack Category'] || '').toLowerCase().includes(term);
      return idMatch || portMatch || catMatch;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredResults.length / pageSize) || 1;
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const attacksFlagged = results?.filter((r) => r._isAttack).length ?? 0;
  const totalProcessed = results?.length ?? 0;

  return (
    <div className="space-y-8 animate-fadeIn font-mono">
      {/* Matrix Main Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#04140a] border border-emerald-500/40 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>INFERENCE_PIPELINE // BATCH_PROCESSING</span>
        </div>
        <h1
          id="detection-title"
          className="text-2xl sm:text-4xl font-black text-emerald-300 tracking-tight leading-tight flex items-center gap-3 matrix-glow"
        >
          <span className="text-emerald-400">&gt;</span>
          <span>DETECTION ENGINE &amp; BATCH PROCESSING</span>
        </h1>
        <p className="text-xs sm:text-sm text-emerald-400/80 mt-2 font-mono">
          Upload SCADA/Modbus CSV traffic file (<code className="text-emerald-300 bg-[#020b04] border border-emerald-700/60 px-1.5 py-0.5 rounded font-mono text-xs">test_traffic.csv</code>) matching CIC-IDS2017 features to execute batch inference.
        </p>
      </div>

      <hr className="border-emerald-900/40" />

      {/* Model Missing Warning Condition (Matches Streamlit if model is None or scaler is None) */}
      {!artifactsLoaded ? (
        <div
          id="missing-artifacts-warning"
          className="rounded-xl bg-red-950/30 border border-red-800/70 p-6 text-red-200 shadow-xl matrix-grid-bg"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-7 h-7 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-3">
              <h3 className="font-bold text-base text-red-300 matrix-glow">
                // SYSTEM ALERT: MODEL ARTIFACTS OFFLINE
              </h3>
              <p className="text-xs text-red-200/90 leading-relaxed font-mono">
                ⚠️ Trained model or scaler artifacts missing from the <code className="bg-red-900/60 text-red-200 px-1.5 py-0.5 rounded font-mono font-semibold border border-red-700">models/</code> folder. The dashboard is running in visual mode. Re-engage the ML pipeline to restore live file inference.
              </p>
              <div className="pt-2">
                <button
                  onClick={onEnableArtifacts}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-bold shadow-lg shadow-emerald-500/30 transition-colors inline-flex items-center gap-2 cursor-pointer font-mono"
                >
                  <RefreshCw className="w-4 h-4" />
                  &gt; ENGAGE MODEL KERNEL (best_cyber_model.pkl)
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Upload Section */}
          <div className="bg-[#041208]/90 rounded-xl border border-emerald-500/25 p-6 shadow-lg space-y-4 matrix-grid-bg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-xs font-bold text-emerald-200 flex items-center gap-2 uppercase tracking-wider">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                // INGEST TEST TRAFFIC CSV FILE
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-[#020b04] text-emerald-300 border border-emerald-600/60 hover:bg-emerald-950/60 transition-colors flex items-center gap-1.5 cursor-pointer font-mono shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  Load Sample test_traffic.csv
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  title="Download standard test_traffic.csv template"
                  className="px-3 py-1.5 text-xs font-medium rounded text-emerald-400/80 hover:text-emerald-200 border border-emerald-900/60 hover:bg-[#031407] transition-colors flex items-center gap-1.5 cursor-pointer font-mono"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Template
                </button>
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-500/30 hover:border-emerald-400 rounded-xl p-8 text-center cursor-pointer transition-all bg-[#020804]/70 hover:bg-emerald-950/20 group matrix-border-glow"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <Upload className="w-10 h-10 mx-auto text-emerald-600 group-hover:text-emerald-400 transition-colors mb-3" />
              <p className="text-xs sm:text-sm font-bold text-emerald-300 group-hover:text-emerald-200">
                {fileName ? (
                  <span className="text-emerald-400 matrix-glow">SELECTED: {fileName}</span>
                ) : (
                  '&gt; CLICK TO BROWSE OR DRAG &amp; DROP TRAFFIC CSV FILE HERE'
                )}
              </p>
              <p className="text-[11px] text-emerald-600 mt-1 font-mono">
                [PARSES: Flow Duration, Fwd Packets, SYN Flags, Flow IAT, Port 502 telemetry]
              </p>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/70 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Raw Uploaded Preview */}
          {uploadedData && uploadedData.length > 0 && (
            <div className="bg-[#041208]/90 rounded-xl border border-emerald-500/25 p-6 shadow-lg space-y-4 matrix-grid-bg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-emerald-200 matrix-glow">// RAW TELEMETRY PREVIEW [HEAD]:</h3>
                  <p className="text-xs text-emerald-500/80">
                    Displaying first 5 records of {uploadedData.length} captured grid packets
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-[#020b04] text-emerald-400 px-2.5 py-1 rounded border border-emerald-800/60">
                  {Object.keys(uploadedData[0]).length} Schema Features
                </span>
              </div>

              <div className="overflow-x-auto border border-emerald-900/60 rounded-lg">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#020b04] text-emerald-300 border-b border-emerald-800/60 font-bold">
                    <tr>
                      {Object.keys(uploadedData[0])
                        .slice(0, 8)
                        .map((col) => (
                          <th key={col} className="py-2.5 px-3 font-semibold whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-950 bg-[#030e06]">
                    {uploadedData.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#071d0e]">
                        {Object.keys(uploadedData[0])
                          .slice(0, 8)
                          .map((col) => (
                            <td key={col} className="py-2 px-3 text-emerald-300/90 whitespace-nowrap">
                              {typeof row[col] === 'number'
                                ? Number(row[col]).toLocaleString(undefined, { maximumFractionDigits: 2 })
                                : String(row[col] ?? '')}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Primary Action Button */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  id="run-threat-analysis-btn"
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-black rounded-lg font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      EXECUTING NEURAL INFERENCE...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      &gt; RUN THREAT ANALYSIS
                    </>
                  )}
                </button>
                {results && (
                  <button
                    onClick={handleDownloadResults}
                    className="px-4 py-3 bg-[#020b04] hover:bg-[#041708] border border-emerald-700/60 text-emerald-300 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer font-mono shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    Export Classified Results (.csv)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Spinner feedback matching st.spinner */}
          {isAnalyzing && (
            <div className="rounded-xl border border-emerald-500/40 bg-[#031207]/90 p-6 text-center space-y-3 matrix-grid-bg">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-sm font-bold text-emerald-200 matrix-glow">
                // COMPUTING RANDOM FOREST INFERENCE...
              </p>
              <p className="text-xs text-emerald-400/80">
                Aligning CIC-IDS2017 feature vector, executing scaler transform, evaluating ensemble decision trees.
              </p>
            </div>
          )}

          {/* Inference Results Section */}
          {results && !isAnalyzing && (
            <div className="space-y-6">
              {/* Success Banner */}
              <div
                id="inference-success-alert"
                className="rounded-xl bg-emerald-950/60 border border-emerald-500/60 p-4 text-emerald-200 flex items-center gap-3 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-bold text-xs matrix-glow uppercase tracking-wider">
                  [SUCCESS] INFERENCE PIPELINE EXECUTED WITH ZERO ERRORS.
                </span>
              </div>

              {/* Two Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricCard
                  id="metric-processed-rows"
                  label="Total Flows Processed"
                  value={totalProcessed}
                  delta="100% INGESTED"
                  deltaColor="neutral"
                />
                <MetricCard
                  id="metric-flagged-attacks"
                  label="Malicious Flows Flagged"
                  value={attacksFlagged}
                  delta={attacksFlagged > 0 ? 'ANOMALY DETECTED' : 'GRID SECURE'}
                  deltaColor="inverse"
                />
              </div>

              {/* Results DataFrame with Interactive Search and Filters */}
              <div className="bg-[#041208]/90 rounded-xl border border-emerald-500/25 p-6 shadow-lg space-y-4 matrix-grid-bg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-emerald-200 matrix-glow">
                      // CLASSIFIED INFERENCE TELEMETRY
                    </h3>
                    <p className="text-xs text-emerald-500/80">
                      Model predictions, confidence thresholds, and packet metadata
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-emerald-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search port, flow ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-emerald-800/60 bg-[#020b04] text-emerald-200 placeholder-emerald-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 w-44 sm:w-52 font-mono"
                      />
                    </div>

                    {/* Filter Buttons */}
                    <div className="inline-flex rounded-lg border border-emerald-800/60 p-0.5 bg-[#020b04]">
                      <button
                        onClick={() => setFilterType('ALL')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                          filterType === 'ALL'
                            ? 'bg-emerald-950 text-emerald-200 border border-emerald-600/60 shadow-xs'
                            : 'text-emerald-500 hover:text-emerald-300'
                        }`}
                      >
                        All ({results.length})
                      </button>
                      <button
                        onClick={() => setFilterType('ATTACK')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                          filterType === 'ATTACK'
                            ? 'bg-red-950 text-red-200 border border-red-600/60 shadow-xs'
                            : 'text-red-400 hover:text-red-300'
                        }`}
                      >
                        🚨 Attacks ({attacksFlagged})
                      </button>
                      <button
                        onClick={() => setFilterType('NORMAL')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                          filterType === 'NORMAL'
                            ? 'bg-emerald-950 text-emerald-200 border border-emerald-500/60 shadow-xs'
                            : 'text-emerald-400 hover:text-emerald-300'
                        }`}
                      >
                        ✅ Normal ({results.length - attacksFlagged})
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-emerald-900/60 rounded-lg">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#020b04] text-emerald-300 border-b border-emerald-800/60 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3 whitespace-nowrap">Flow ID</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Prediction Result</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Threat Confidence</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Classification</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Dest Port</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Flow Duration</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Fwd Pkts</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Bwd Pkts</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Packets/s</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">SYN Flags</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-950 bg-[#030e06]">
                      {paginatedResults.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="text-center py-8 text-emerald-700">
                            No records match the current filter.
                          </td>
                        </tr>
                      ) : (
                        paginatedResults.map((row, idx) => (
                          <tr
                            key={idx}
                            className={`transition-colors ${
                              row._isAttack ? 'bg-red-950/20 hover:bg-red-950/40' : 'hover:bg-[#071d0e]'
                            }`}
                          >
                            <td className="py-2 px-3 font-mono text-emerald-400 font-bold">
                              {row.id}
                            </td>
                            <td className="py-2 px-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                                  row._isAttack
                                    ? 'bg-red-950/90 text-red-300 border border-red-700/80 shadow-[0_0_8px_rgba(239,68,68,0.25)]'
                                    : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/70 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                                }`}
                              >
                                {row['Prediction Result']}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-emerald-200">
                              {row['Threat Confidence Score']}
                            </td>
                            <td className="py-2 px-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  row['Attack Category'] === 'DoS'
                                    ? 'bg-red-950/60 text-red-300 border-red-800'
                                    : row['Attack Category'] === 'DDoS'
                                    ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                                    : row['Attack Category'] === 'Brute Force'
                                    ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                                    : 'bg-emerald-950/50 text-emerald-400 border-emerald-800'
                                }`}
                              >
                                {row['Attack Category']}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono text-emerald-300">
                              {row['Destination Port']}
                            </td>
                            <td className="py-2 px-3 font-mono text-emerald-500">
                              {Number(row['Flow Duration']).toLocaleString()} μs
                            </td>
                            <td className="py-2 px-3 font-mono text-emerald-300">
                              {row['Total Fwd Packets']}
                            </td>
                            <td className="py-2 px-3 font-mono text-emerald-300">
                              {row['Total Backward Packets']}
                            </td>
                            <td className="py-2 px-3 font-mono text-emerald-300">
                              {Number(row['Flow Packets/s']).toLocaleString(undefined, {
                                maximumFractionDigits: 1,
                              })}
                            </td>
                            <td className="py-2 px-3 font-mono text-emerald-300">
                              {row['SYN Flag Count']}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between text-xs text-emerald-400/80 pt-2">
                    <div>
                      Showing {(currentPage - 1) * pageSize + 1} to{' '}
                      {Math.min(currentPage * pageSize, filteredResults.length)} of{' '}
                      {filteredResults.length} flows
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-2.5 py-1 rounded border border-emerald-800/60 bg-[#020b04] text-emerald-300 hover:bg-[#051a0d] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        &lt; Prev
                      </button>
                      <span className="font-medium px-2 text-emerald-300">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-2.5 py-1 rounded border border-emerald-800/60 bg-[#020b04] text-emerald-300 hover:bg-[#051a0d] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Next &gt;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
