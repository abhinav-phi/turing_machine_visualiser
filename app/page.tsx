'use client';
import Image from "next/image";
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TuringMachine, MachineConfig, MachineSnapshot } from './lib/turingEngine';
import { EXAMPLES, getExampleByName } from './lib/examples';
import TapeVisualization from './components/TapeVisualization';
import PlaybackControls from './components/PlaybackControls';
import TransitionEditor from './components/TransitionEditor';
import ComparativeView from './components/ComparativeView';
import StatePanel from './components/StatePanel';
import ExampleSelector from './components/ExampleSelector';
import EducationalPanel from './components/EducationalPanel';
import StepExplanation from './components/StepExplanation';
import ThemeToggle from './components/ThemeToggle';
import Tooltip from './components/Tooltip';
import LoadingSkeleton from './components/LoadingSkeleton';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import ShortcutsModal from './components/ShortcutsModal';

// Estimate max steps for progress bar (heuristic: 120 steps shown as 100%)
const PROGRESS_MAX_STEPS = 120;

export default function Home() {
  const [config, setConfig] = useState<MachineConfig>(EXAMPLES[0]);
  const [currentExample, setCurrentExample] = useState<string>(EXAMPLES[0].name);
  const [machine, setMachine] = useState<TuringMachine>(() => new TuringMachine(EXAMPLES[0]));
  const [snapshot, setSnapshot] = useState<MachineSnapshot>(() => new TuringMachine(EXAMPLES[0]).getSnapshot());
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(400);
  const [writtenCells, setWrittenCells] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const machineRef = useRef<TuringMachine>(machine);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    machineRef.current = machine;
  }, [machine]);

  useEffect(() => {
    if (snapshot.status !== 'running' && isPlaying) {
      setIsPlaying(false);
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    }
  }, [snapshot.status, isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        const m = machineRef.current;
        const result = m.step();
        if (result) {
          setSnapshot({ ...result });
          if (result.lastTransition) {
            const newWritten = new Set<string>();
            result.lastTransition.writeSymbols.forEach((_, i) => {
              if (result.lastTransition!.writeSymbols[i] !== '*') {
                const prevSnap = m.getHistory()[m.getHistory().length - 2];
                if (prevSnap) {
                  newWritten.add(`${i}-${prevSnap.headPositions[i]}`);
                }
              }
            });
            setWrittenCells(newWritten);
            setTimeout(() => setWrittenCells(new Set()), 400);
          }
        }
        if (m.getStatus() !== 'running') {
          setIsPlaying(false);
          if (playIntervalRef.current) {
            clearInterval(playIntervalRef.current);
            playIntervalRef.current = null;
          }
        }
      }, speed);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    };
  }, [isPlaying, speed]);

  const handleStep = useCallback(() => {
    const result = machine.step();
    if (result) {
      setSnapshot({ ...result });
      if (result.lastTransition) {
        const newWritten = new Set<string>();
        result.lastTransition.writeSymbols.forEach((_, i) => {
          if (result.lastTransition!.writeSymbols[i] !== '*') {
            const hist = machine.getHistory();
            const prevSnap = hist[hist.length - 2];
            if (prevSnap) {
              newWritten.add(`${i}-${prevSnap.headPositions[i]}`);
            }
          }
        });
        setWrittenCells(newWritten);
        setTimeout(() => setWrittenCells(new Set()), 400);
      }
    }
  }, [machine]);

  const handleStepBack = useCallback(() => {
    const result = machine.stepBack();
    if (result) {
      setSnapshot({ ...result });
      setWrittenCells(new Set());
    }
  }, [machine]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    machine.reset();
    setSnapshot(machine.getSnapshot());
    setWrittenCells(new Set());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [machine]);

  const handleExport = useCallback(async () => {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const appEl = document.querySelector('.app-grid') as HTMLElement;
      if (!appEl) return;
      const canvas = await html2canvas(appEl, {
        backgroundColor: '#f7f9fb',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `turing-machine-${config.name.replace(/\s+/g, '-').toLowerCase()}-step${snapshot.step}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('Export failed. Please try again.');
    }
  }, [config.name, snapshot.step]);

  const handlePlay = useCallback(() => {
    if (machine.getStatus() === 'running') {
      setIsPlaying(true);
    }
  }, [machine]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) handlePause();
    else handlePlay();
  }, [isPlaying, handlePlay, handlePause]);

  const handleExampleSelect = useCallback((name: string) => {
    setIsPlaying(false);
    setCurrentExample(name);
    const example = getExampleByName(name);
    if (example) {
      const newConfig = { ...example };
      setConfig(newConfig);
      const newMachine = new TuringMachine(newConfig);
      setMachine(newMachine);
      machineRef.current = newMachine;
      setSnapshot(newMachine.getSnapshot());
      setWrittenCells(new Set());
    }
  }, []);

  const handleConfigChange = useCallback((newConfig: MachineConfig) => {
    setIsPlaying(false);
    setConfig(newConfig);
    setCurrentExample('');
    const newMachine = new TuringMachine(newConfig);
    setMachine(newMachine);
    machineRef.current = newMachine;
    setSnapshot(newMachine.getSnapshot());
    setWrittenCells(new Set());
  }, []);

  const toggleShortcutsModal = useCallback(() => {
    setShowShortcutsModal(prev => !prev);
  }, []);

  const canStep = snapshot.status === 'running';
  const canStepBack = machine.getHistory().length > 1;

  // Progress bar calculation
  const progressPct = Math.min(100, (snapshot.step / PROGRESS_MAX_STEPS) * 100);

  if (!isLoaded) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <KeyboardShortcuts
        onPlayPause={handlePlayPause}
        onStepForward={handleStep}
        onStepBack={handleStepBack}
        onReset={handleReset}
        onToggleHelp={toggleShortcutsModal}
      />

      <ShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      <div className="app-grid app-enter">
        {/* ===== Header ===== */}
        <header className="app-header">
          <div className="header-top">
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '11px',
                background: 'linear-gradient(135deg, #0ea5e9, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '19px',
                boxShadow: '0 3px 10px rgba(14, 165, 233, 0.3)',
                flexShrink: 0,
              }}>
                🔬
              </div> */}
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '11px',
                background: 'linear-gradient(135deg, #0ea5e9, #7c3aed)',
                padding: '4px',
                boxShadow: '0 3px 10px rgba(14, 165, 233, 0.3)',
              }}>
                <Image
                  src="/logo.jpg"
                  alt="Logo"
                  width={30}
                  height={30}
                  style={{ borderRadius: '8px', objectFit: "cover" }}
                />
              </div>
              <div>
                <h1 style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  margin: 0,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}>
                  Multi-Tape Turing Machine
                </h1>
                <p style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  margin: 0,
                  fontWeight: 500,
                }}>
                  Interactive computational model simulator
                </p>
              </div>

              {/* Nav links (desktop) */}
              <nav style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginLeft: '16px',
              }} className="desktop-nav">
                <span style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0ea5e9',
                  background: 'rgba(14, 165, 233, 0.08)',
                  borderBottom: '2px solid #0ea5e9',
                  cursor: 'default',
                }}>
                  Simulate
                </span>
              </nav>
            </div>

            {/* Actions */}
            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <ExampleSelector
                currentExample={currentExample}
                onSelect={handleExampleSelect}
              />

              <div style={{ width: '1px', height: '24px', background: 'var(--border-glass)' }} />

              <Tooltip text="Compare multi-tape vs single-tape efficiency">
                <button
                  className={`btn ${showComparison ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setShowComparison(!showComparison)}
                >
                  📊 Compare
                </button>
              </Tooltip>
              <Tooltip text="Export current state as PNG">
                <button className="btn btn-secondary" onClick={handleExport}>
                  📷 Export
                </button>
              </Tooltip>
              <Tooltip text="Keyboard shortcuts (?)">
                <button
                  className="btn btn-secondary btn-icon"
                  onClick={toggleShortcutsModal}
                >
                  ⌨️
                </button>
              </Tooltip>
              <ThemeToggle />
            </div>
          </div>

          {/* Progress bar */}
          <div className="header-progress">
            <div className="progress-label">
              <span className="progress-label-text">Execution Progress</span>
              <span className="progress-step-text">
                Step {snapshot.step} / {PROGRESS_MAX_STEPS}+
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </header>

        {/* ===== Main Content ===== */}
        <main className="main-area">
          {/* Example description */}
          {currentExample && (
            <div className="glass-card" style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}>
              <span style={{ fontSize: '16px', marginTop: '1px', flexShrink: 0 }}>💡</span>
              <div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '2px',
                }}>
                  {config.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.55,
                }}>
                  {config.description}
                </div>
              </div>
            </div>
          )}

          {/* Tape Visualization */}
          <div className="glass-card" style={{ padding: '14px 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '14px', paddingRight: '14px', marginBottom: '4px' }}>
              <div className="section-title" style={{ margin: 0 }}>
                <span className="icon">📼</span>
                Tape Execution Visualizer
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{
                  padding: '3px 8px',
                  background: 'rgba(226, 232, 240, 0.7)',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                }}>
                  K = {config.numTapes}
                </span>
                <span style={{
                  padding: '3px 8px',
                  background: snapshot.status === 'running'
                    ? 'rgba(14, 165, 233, 0.1)'
                    : snapshot.status === 'accepted'
                    ? 'rgba(5, 150, 105, 0.1)'
                    : 'rgba(186, 26, 26, 0.1)',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: snapshot.status === 'running'
                    ? '#0ea5e9'
                    : snapshot.status === 'accepted'
                    ? 'var(--accent-emerald)'
                    : 'var(--accent-rose)',
                  animation: snapshot.status === 'running' ? 'pulse 2s ease-in-out infinite' : undefined,
                }}>
                  {snapshot.status.toUpperCase()}
                </span>
              </div>
            </div>
            <TapeVisualization
              tapes={snapshot.tapes}
              headPositions={snapshot.headPositions}
              numTapes={config.numTapes}
              writtenCells={writtenCells}
              blankSymbol={config.blankSymbol}
            />
          </div>

          {/* Step Explanation Panel */}
          <StepExplanation
            snapshot={snapshot}
            numTapes={config.numTapes}
          />

          {/* Comparative View */}
          {showComparison && (
            <ComparativeView
              config={config}
              multiTapeSteps={snapshot.step}
              status={snapshot.status}
            />
          )}

          {/* Educational Panel */}
          <EducationalPanel />
        </main>

        {/* ===== Sidebar ===== */}
        <aside className="sidebar">
          <TransitionEditor
            config={config}
            onConfigChange={handleConfigChange}
            activeTransition={snapshot.lastTransition}
          />
          <StatePanel
            currentState={snapshot.state}
            status={snapshot.status}
            history={machine.getHistory()}
            allStates={config.states}
            acceptStates={config.acceptStates}
            rejectStates={config.rejectStates}
          />
        </aside>

        {/* ===== Bottom Bar (Playback Controls) ===== */}
        <div className="bottom-bar">
          <PlaybackControls
            isPlaying={isPlaying}
            canStep={canStep}
            canStepBack={canStepBack}
            speed={speed}
            stepCount={snapshot.step}
            currentState={snapshot.state}
            status={snapshot.status}
            onPlay={handlePlay}
            onPause={handlePause}
            onStep={handleStep}
            onStepBack={handleStepBack}
            onReset={handleReset}
            onSpeedChange={setSpeed}
          />
        </div>
      </div>
    </>
  );
}