import React, { useState } from 'react';
import { NavigationPage } from './types';
import { Sidebar } from './components/Sidebar';
import { OverviewView } from './components/OverviewView';
import { DetectionEngineView } from './components/DetectionEngineView';
import { AttackSimulatorView } from './components/AttackSimulatorView';
import { MatrixBackground } from './components/MatrixBackground';
import { Menu, Zap, Crosshair, Terminal, Eye, EyeOff } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('📊 Overview & EDA');
  const [artifactsLoaded, setArtifactsLoaded] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [matrixRainEnabled, setMatrixRainEnabled] = useState<boolean>(true);

  return (
    <div className="min-h-screen bg-[#020703] text-emerald-100 flex relative selection:bg-emerald-500 selection:text-black font-mono">
      {/* Matrix Rain Ambient Canvas */}
      <MatrixBackground enabled={matrixRainEnabled} />

      {/* Streamlit Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        artifactsLoaded={artifactsLoaded}
        onToggleArtifacts={setArtifactsLoaded}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen relative z-10">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#020904]/90 backdrop-blur-md border-b border-emerald-500/25 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-emerald-400 hover:text-emerald-200 hover:bg-[#061e0c] transition-colors border border-emerald-800/60"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest hidden sm:inline matrix-glow">
                SCADA // GRID_IDS_ACTIVE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Matrix Rain Toggle */}
            <button
              onClick={() => setMatrixRainEnabled(!matrixRainEnabled)}
              title={matrixRainEnabled ? 'Disable Matrix Rain animation' : 'Enable Matrix Rain animation'}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#031207] hover:bg-[#07240e] border border-emerald-800/60 text-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer font-mono"
            >
              {matrixRainEnabled ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden md:inline">Rain ON</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden md:inline">Rain OFF</span>
                </>
              )}
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-md bg-[#04140a] border border-emerald-500/40 text-emerald-300 text-xs font-medium">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>CIC-IDS2017 RF KERNEL</span>
            </div>

            <button
              onClick={() => setCurrentPage('🎯 Self-Attack Simulator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-mono ${
                currentPage === '🎯 Self-Attack Simulator'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-red-950/60 border border-red-700/70 text-red-300 hover:bg-red-900/60'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>&gt; Attack Sim</span>
            </button>

            <button
              onClick={() => {
                setCurrentPage(
                  currentPage === '📊 Overview & EDA'
                    ? '⚡ Live Traffic Detection Engine'
                    : '📊 Overview & EDA'
                );
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#031207] hover:bg-[#06200d] border border-emerald-700/60 text-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer font-mono shadow-[0_0_8px_rgba(16,185,129,0.15)]"
            >
              {currentPage === '📊 Overview & EDA' ? (
                <>&gt; Detection Engine ⚡</>
              ) : (
                <>&gt; Overview &amp; EDA 📊</>
              )}
            </button>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentPage === '📊 Overview & EDA' && <OverviewView />}
          {currentPage === '⚡ Live Traffic Detection Engine' && (
            <DetectionEngineView
              artifactsLoaded={artifactsLoaded}
              onEnableArtifacts={() => setArtifactsLoaded(true)}
            />
          )}
          {currentPage === '🎯 Self-Attack Simulator' && <AttackSimulatorView />}
        </main>

        {/* Footer */}
        <footer className="border-t border-emerald-900/40 bg-[#020703]/80 py-4 px-4 sm:px-8 text-center text-xs text-emerald-600 font-mono">
          <p>
            [SYSTEM_OK] SMART GRID CYBERATTACK DETECTION AI &bull; CIC-IDS2017 &bull; RANDOM FOREST ENSEMBLE CLASSIFIER
          </p>
        </footer>
      </div>
    </div>
  );
}
