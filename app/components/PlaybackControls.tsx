'use client';

import React from 'react';
import Tooltip from './Tooltip';

interface PlaybackControlsProps {
  isPlaying: boolean;
  canStep: boolean;
  canStepBack: boolean;
  speed: number;
  stepCount: number;
  currentState: string;
  status: 'running' | 'accepted' | 'rejected' | 'halted';
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onStepBack: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export default function PlaybackControls({
  isPlaying,
  canStep,
  canStepBack,
  speed,
  stepCount,
  currentState,
  status,
  onPlay,
  onPause,
  onStep,
  onStepBack,
  onReset,
  onSpeedChange,
}: PlaybackControlsProps) {
  const statusClass = `status-${status}`;

  return (
    <div className="glass-card" style={{ padding: '16px 24px' }}>
      <div className="playback-wrapper">
        {/* Playback buttons */}
        <div className="playback-buttons">
          <Tooltip text="Reset to initial state (R)">
            <button
              className="btn btn-secondary btn-icon"
              onClick={onReset}
              title="Reset"
            >
              ⏮
            </button>
          </Tooltip>
          <Tooltip text="Step backward (←)">
            <button
              className="btn btn-secondary btn-icon"
              onClick={onStepBack}
              disabled={!canStepBack}
              title="Step Back"
            >
              ◀
            </button>
          </Tooltip>
          {isPlaying ? (
            <Tooltip text="Pause simulation (Space)">
              <button
                className="btn btn-primary"
                onClick={onPause}
                style={{ minWidth: '80px' }}
              >
                ⏸ Pause
              </button>
            </Tooltip>
          ) : (
            <Tooltip text="Play simulation (Space)">
              <button
                className="btn btn-primary"
                onClick={onPlay}
                disabled={!canStep}
                style={{ minWidth: '80px' }}
              >
                ▶ Play
              </button>
            </Tooltip>
          )}
          <Tooltip text="Step forward (→)">
            <button
              className="btn btn-secondary btn-icon"
              onClick={onStep}
              disabled={!canStep}
              title="Step Forward"
            >
              ▶
            </button>
          </Tooltip>
        </div>

        {/* Speed control */}
        <Tooltip text="Adjust simulation speed" position="bottom">
          <div className="playback-speed">
            <span style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}>
              🐢
            </span>
            <input
              type="range"
              min="50"
              max="2000"
              step="50"
              value={2050 - speed}
              onChange={(e) => onSpeedChange(2050 - parseInt(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}>
              🐇
            </span>
            <span style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              minWidth: '50px',
            }}>
              {speed}ms
            </span>
          </div>
        </Tooltip>

        {/* Status display */}
        <div className="playback-status">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '4px',
          }}>
            <div style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Step
            </div>
            <div style={{
              fontSize: '22px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-cyan)',
            }}>
              {stepCount}
            </div>
          </div>

          <div style={{
            width: '1px',
            height: '36px',
            background: 'var(--border-glass)',
          }} />

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '4px',
          }}>
            <div style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              State
            </div>
            <div style={{
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
            }}>
              {currentState}
            </div>
          </div>

          <Tooltip text={`Machine status: ${status}`}>
            <span className={`status-badge ${statusClass}`}>
              <span
                className="pulse-dot"
                style={{
                  background:
                    status === 'running'
                      ? 'var(--accent-cyan)'
                      : status === 'accepted'
                        ? 'var(--accent-emerald)'
                        : status === 'rejected'
                          ? 'var(--accent-rose)'
                          : 'var(--accent-amber)',
                }}
              />
              {status}
            </span>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
