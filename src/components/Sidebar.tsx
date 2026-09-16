import React from 'react';
import { NavigationPage } from '../types';
import { Radio, Database, Cpu, CheckCircle2, AlertTriangle, X, ShieldAlert, Crosshair } from 'lucide-react';

interface SidebarProps {
  currentPage: NavigationPage;
  onSelectPage: (page: NavigationPage) => void;
  artifactsLoaded: boolean;
  onToggleArtifacts: (loaded: boolean) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  artifactsLoaded,
  onToggleArtifacts,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems: { page: NavigationPage; desc: string; icon: React.ReactNode; tag: string }[] = [
    {
      page: '📊 Overview & EDA',
      desc: 'Dataset metrics & distribution',
      icon: <Radio className="w-4 h-4 text-emerald-400" />,
      tag: 'SYS.EDA',
    },
    {
      page: '⚡ Live Traffic Detection Engine',
      desc: 'CSV file batch inference',
      icon: <Database className="w-4 h-4 text-emerald-400" />,
      tag: 'INFER.BATCH',
    },
    {
      page: '🎯 Self-Attack Simulator',
      desc: 'Gamified Red vs Blue Cyber War',
      icon: <Crosshair className="w-4 h-4 text-red-400" />,
      tag: 'GAME.WAR',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#020704] text-emerald-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } border-r border-emerald-500/20 shadow-2xl font-mono`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-emerald-500/20 flex items-center justify-between bg-[#040e07]/80">
          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <span className="text-xl">⚡</span>
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border border-black rounded-full animate-ping" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-emerald-300 matrix-glow flex items-center gap-1.5">
                SMART-GRID::AI-IDS
              </h1>
              <p className="text-[10px] text-emerald-500/80 font-mono tracking-wider">[CYBER_DEFENSE_MATRIX]</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 text-emerald-500 hover:text-emerald-300 lg:hidden rounded-lg hover:bg-emerald-950/60"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="p-4 flex-1 overflow-y-auto space-y-5">
          <div>
            <div className="text-[10px] font-semibold text-emerald-500/70 uppercase tracking-widest mb-2 px-1 flex items-center justify-between">
              <span>// DIRECTORY_INDEX</span>
              <span className="text-[9px] bg-emerald-950/80 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/60 font-mono">
                [3 NODES]
              </span>
            </div>
            <div className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = currentPage === item.page;
                return (
                  <button
                    key={item.page}
                    id={`nav-btn-${
                      item.page.includes('Overview')
                        ? 'overview'
                        : item.page.includes('Simulator')
                        ? 'simulator'
                        : 'detection'
                    }`}
                    onClick={() => {
                      onSelectPage(item.page);
                      onCloseMobile();
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-mono transition-all group ${
                      isActive
                        ? 'bg-emerald-950/80 text-emerald-200 shadow-lg shadow-emerald-950/50 font-bold border border-emerald-500/60 matrix-border-glow'
                        : 'text-emerald-400/80 hover:bg-[#06180d] hover:text-emerald-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {item.icon}
                        <span className="truncate">{item.page}</span>
                      </span>
                      <span className={`text-[9px] px-1 py-0.2 rounded border ${
                        isActive 
                          ? 'bg-emerald-500 text-black border-emerald-400 font-bold' 
                          : 'text-emerald-600 border-emerald-900/60'
                      }`}>
                        {item.tag}
                      </span>
                    </div>
                    <p
                      className={`text-[10px] mt-1 pl-6 truncate ${
                        isActive ? 'text-emerald-400' : 'text-emerald-600 group-hover:text-emerald-500'
                      }`}
                    >
                      &gt; {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-emerald-900/40" />

          {/* Academic Prototype Module Box (Matches Streamlit sidebar.info) */}
          <div
            id="academic-info-card"
            className="rounded-lg bg-[#04140a]/90 border border-emerald-500/30 p-3.5 text-xs text-emerald-300/90 leading-relaxed shadow-inner matrix-grid-bg"
          >
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>[KERNEL_INFO]</span>
            </div>
            <p className="text-[11px] mb-1.5 text-emerald-300">
              Dataset: <strong className="text-emerald-100">CIC-IDS2017</strong>
            </p>
            <p className="text-[11px] text-emerald-400/80">
              Target Protocol: <span className="text-emerald-300">Modbus/SCADA Flow</span>
            </p>
            <div className="mt-2.5 pt-2 border-t border-emerald-900/50 flex items-center justify-between text-[10px] text-emerald-500 font-mono">
              <span>TARGET PORT: 502</span>
              <span className="text-emerald-400">[ONLINE]</span>
            </div>
          </div>

          {/* Model Artifacts State Switcher */}
          <div className="rounded-lg bg-[#04140a]/90 border border-emerald-500/25 p-3.5 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                ML Artifacts
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  artifactsLoaded
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                    : 'bg-red-950 text-red-300 border border-red-700/60'
                }`}
              >
                {artifactsLoaded ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> [LOADED]
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3" /> [OFFLINE]
                  </>
                )}
              </span>
            </div>
            <p className="text-emerald-400/70 mb-3 text-[10px] leading-normal font-mono">
              {artifactsLoaded
                ? '`best_cyber_model.pkl` + `scaler.pkl` verified.'
                : 'Artifacts offline. Visual simulation fallback engaged.'}
            </p>
            <button
              id="toggle-artifacts-btn"
              onClick={() => onToggleArtifacts(!artifactsLoaded)}
              className="w-full py-1.5 px-2.5 rounded text-[11px] font-mono font-semibold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/60 hover:border-emerald-400 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {artifactsLoaded ? '&gt; SIMULATE OFFLINE' : '&gt; LOAD ARTIFACTS'}
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-emerald-900/40 text-[10px] text-emerald-600 text-center bg-[#020703] font-mono">
          MATRIX AI-IDS &bull; NODE: OPERATIONAL
        </div>
      </aside>
    </>
  );
};
