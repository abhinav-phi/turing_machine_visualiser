'use client';

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

  // Fade-in after mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // Keep machineRef in sync
  useEffect(() => {
    machineRef.current = machine;
  }, [machine]);

  // Stop playback when status changes from running
  useEffect(() => {
    if (snapshot.status !== 'running' && isPlaying) {
      setIsPlaying(false);
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    }
  }, [snapshot.status, isPlaying]);

  // Handle play/pause
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
        backgroundColor: '#f5f7fb',
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
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
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

  // Show skeleton while loading
  if (!isLoaded) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        onPlayPause={handlePlayPause}
        onStepForward={handleStep}
        onStepBack={handleStepBack}
        onReset={handleReset}
        onToggleHelp={toggleShortcutsModal}
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      <div className="app-grid app-enter">
        {/* ===== Header ===== */}
        <header className="app-header glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(8, 145, 178, 0.25)',
            }}>
              🔬
            </div>
            <div>
              <h1 style={{
                fontSize: '18px',
                fontWeight: 700,
                margin: 0,
                background: 'linear-gradient(90deg, var(--text-primary), var(--accent-cyan))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Multi-Tape Turing Machine
              </h1>
              <p style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                margin: 0,
              }}>
                Interactive computational model simulator
              </p>
            </div>
          </div>

          <div className="header-actions">
            <ExampleSelector
              currentExample={currentExample}
              onSelect={handleExampleSelect}
            />
            <Tooltip text="Compare multi-tape vs single-tape efficiency">
              <button
                className={`btn ${showComparison ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setShowComparison(!showComparison)}
                style={{ fontSize: '13px' }}
              >
                📊 Compare
              </button>
            </Tooltip>
            <Tooltip text="Export current state as PNG image">
              <button
                className="btn btn-secondary"
                onClick={handleExport}
                style={{ fontSize: '13px' }}
              >
                📷 Export
              </button>
            </Tooltip>
            <Tooltip text="Keyboard shortcuts (?)">
              <button
                className="btn btn-secondary btn-icon"
                onClick={toggleShortcutsModal}
                style={{ fontSize: '15px', fontWeight: 700 }}
              >
                ⌨️
              </button>
            </Tooltip>
            <ThemeToggle />
          </div>
        </header>

        {/* ===== Main Content (Tapes + Comparison) ===== */}
        <main className="main-area">
          {/* Example description */}
          {currentExample && (
            <div className="glass-card" style={{
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}>
              <span style={{ fontSize: '18px', marginTop: '1px' }}>💡</span>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '2px',
                }}>
                  {config.name}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}>
                  {config.description}
                </div>
              </div>
            </div>
          )}

          {/* Tape Visualization */}
          <div className="glass-card" style={{ padding: '16px 8px' }}>
            <div className="section-title" style={{ paddingLeft: '12px' }}>
              <span className="icon">📼</span>
              Tape Visualization
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

        {/* ===== Sidebar (Editor + State) ===== */}
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
