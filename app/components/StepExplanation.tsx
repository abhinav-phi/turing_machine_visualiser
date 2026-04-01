'use client';

import React from 'react';
import { MachineSnapshot } from '../lib/turingEngine';

interface StepExplanationProps {
  snapshot: MachineSnapshot;
  numTapes: number;
}

function directionName(d: string): string {
  switch (d) {
    case 'L': return 'Left';
    case 'R': return 'Right';
    case 'S': return 'Stay';
    default: return d;
  }
}

function generateActionSummary(snapshot: MachineSnapshot, numTapes: number): string {
  const t = snapshot.lastTransition;
  if (!t) return '';

  // Build a concise one-line summary
  const writtenParts: string[] = [];
  t.writeSymbols.forEach((sym, i) => {
    if (sym !== '*' && sym !== t.readSymbols[i]) {
      writtenParts.push(`'${sym}' to Tape ${i + 1}`);
    }
  });

  if (writtenParts.length > 0) {
    const readParts = t.readSymbols.map((sym, i) =>
      `'${sym}' from Tape ${i + 1}`
    ).join(', ');
    return `Reading ${readParts}, writing ${writtenParts.join(' and ')}`;
  }

  // If nothing written differently, describe the movement
  const moveParts: string[] = [];
  t.directions.forEach((d, i) => {
    if (d !== 'S') moveParts.push(`Tape ${i + 1} ${directionName(d)}`);
  });

  if (moveParts.length > 0) {
    return `Scanning: moving ${moveParts.join(', ')}`;
  }

  return `Processing in state ${t.fromState}`;
}

export default function StepExplanation({ snapshot, numTapes }: StepExplanationProps) {
  const { step, lastTransition, status } = snapshot;

  if (step === 0 && !lastTransition) {
    return (
      <div className="glass-card" style={{ padding: '16px' }}>
        <div className="section-title">
          <span className="icon">📖</span>
          Step Explanation
        </div>
        <div style={{
          fontSize: '13px',
          color: 'var(--text-muted)',
          lineHeight: 1.7,
          padding: '8px 12px',
          background: 'rgba(226, 232, 240, 0.5)',
          borderRadius: '10px',
          textAlign: 'center',
        }}>
          Press <strong style={{ color: 'var(--text-secondary)' }}>Step</strong> or <strong style={{ color: 'var(--text-secondary)' }}>Play</strong> to begin. Each step will be explained here.
        </div>
      </div>
    );
  }

  // Build explanation text
  const t = lastTransition;
  let readLine = '';
  let writeLine = '';
  let moveLine = '';
  let transLine = '';

  if (t) {
    const readParts = t.readSymbols.map((sym, i) =>
      `'${sym}' from Tape ${i + 1}`
    );
    readLine = `Reading ${readParts.join(' and ')}.`;

    const writeParts: string[] = [];
    t.writeSymbols.forEach((sym, i) => {
      if (sym !== '*') {
        writeParts.push(`'${sym}' on Tape ${i + 1}`);
      }
    });
    writeLine = writeParts.length > 0
      ? `Writing ${writeParts.join(' and ')}.`
      : 'No symbols written (unchanged).';

    const moveParts = t.directions.map((d, i) =>
      `${directionName(d)} (Tape ${i + 1})`
    );
    moveLine = `Moving heads: ${moveParts.join(', ')}.`;
    transLine = `Transition: (${t.fromState} → ${t.toState})`;
  }

  // Current action summary
  const actionSummary = generateActionSummary(snapshot, numTapes);

  // Status message
  let statusMsg = '';
  if (status === 'accepted') statusMsg = '✅ Machine has ACCEPTED the input.';
  else if (status === 'rejected') statusMsg = '❌ Machine has REJECTED the input.';
  else if (status === 'halted') statusMsg = '⏹ Machine has HALTED (no matching transition).';

  return (
    <div className="glass-card" style={{ padding: '16px' }}>
      <div className="section-title">
        <span className="icon">📖</span>
        Step Explanation
      </div>

      {/* Feature 2: Current Action Summary */}
      {actionSummary && (
        <div style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--accent-emerald)',
          padding: '8px 14px',
          marginBottom: '8px',
          background: 'rgba(0, 184, 148, 0.08)',
          borderRadius: '8px',
          border: '1px solid rgba(0, 184, 148, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '14px' }}>⚡</span>
          Current Action: {actionSummary}
        </div>
      )}

      <div style={{
        fontSize: '13px',
        color: 'var(--text-secondary)',
        lineHeight: 1.8,
        padding: '10px 14px',
        background: 'rgba(226, 232, 240, 0.5)',
        borderRadius: '10px',
      }}>
        <div style={{
          fontWeight: 700,
          color: 'var(--accent-cyan)',
          marginBottom: '6px',
          fontSize: '14px',
        }}>
          Step {step}:
        </div>
        {t && (
          <>
            <div>{readLine}</div>
            <div>{writeLine}</div>
            <div>{moveLine}</div>
            <div style={{
              color: 'var(--accent-violet)',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              marginTop: '4px',
            }}>
              {transLine}
            </div>
          </>
        )}
        {statusMsg && (
          <div style={{
            marginTop: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            background: status === 'accepted'
              ? 'rgba(5, 150, 105, 0.08)'
              : status === 'rejected'
                ? 'rgba(225, 29, 72, 0.08)'
                : 'rgba(217, 119, 6, 0.08)',
            fontWeight: 600,
            color: status === 'accepted'
              ? 'var(--accent-emerald)'
              : status === 'rejected'
                ? 'var(--accent-rose)'
                : 'var(--accent-amber)',
          }}>
            {statusMsg}
          </div>
        )}
      </div>
    </div>
  );
}
