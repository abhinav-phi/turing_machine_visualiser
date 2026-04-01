'use client';

import React, { useEffect, useRef } from 'react';

interface TapeVisualizationProps {
  tapes: string[][];
  headPositions: number[];
  numTapes: number;
  writtenCells?: Set<string>;
  blankSymbol?: string;
}

export default function TapeVisualization({
  tapes,
  headPositions,
  numTapes,
  writtenCells,
  blankSymbol = '_',
}: TapeVisualizationProps) {
  const tapeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevHeadPositions = useRef<number[]>([...headPositions]);

  const moveDirections = headPositions.map((pos, i) => {
    const prev = prevHeadPositions.current[i] ?? pos;
    if (pos > prev) return 'right';
    if (pos < prev) return 'left';
    return 'none';
  });

  useEffect(() => {
    prevHeadPositions.current = [...headPositions];
  }, [headPositions]);

  useEffect(() => {
    headPositions.forEach((pos, tapeIdx) => {
      const container = tapeRefs.current[tapeIdx];
      if (container) {
        const cellWidth = 58; // cell-size + gap
        const scrollTarget = pos * cellWidth - container.clientWidth / 2 + cellWidth / 2;
        container.scrollTo({ left: scrollTarget, behavior: 'smooth' });
      }
    });
  }, [headPositions]);

  const tapeNames = ['INPUT', 'WORK', 'OUTPUT', 'AUX1', 'AUX2'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {Array.from({ length: numTapes }).map((_, tapeIdx) => {
        const tape = tapes[tapeIdx] || [];
        const headPos = headPositions[tapeIdx] ?? 0;
        const moveDir = moveDirections[tapeIdx];
        const tapeName = tapeNames[tapeIdx] ?? `TAPE_${tapeIdx + 1}`;

        return (
          <div key={tapeIdx}>
            <div className="tape-label">
              <div className="tape-label-left">
                <span className="tape-num">{tapeIdx + 1}</span>
                <span>TAPE_{String(tapeIdx + 1).padStart(2, '0')} ({tapeName})</span>
              </div>
              <span className="tape-pos-badge">POS: {String(headPos).padStart(2, '0')}</span>
            </div>
            <div
              className="tape-container"
              ref={(el) => { tapeRefs.current[tapeIdx] = el; }}
            >
              {tape.map((symbol, cellIdx) => {
                const isActive = cellIdx === headPos;
                const isWritten = writtenCells?.has(`${tapeIdx}-${cellIdx}`);
                const isBlank = symbol === blankSymbol;

                let dirClass = '';
                if (isActive && moveDir === 'right') dirClass = ' head-move-right';
                else if (isActive && moveDir === 'left') dirClass = ' head-move-left';

                return (
                  <div
                    key={cellIdx}
                    className={`tape-cell${isActive ? ' active' : ''}${isWritten ? ' written' : ''}${isBlank ? ' blank-cell' : ''}${dirClass}`}
                  >
                    {symbol}
                    {isActive && (
                      <span className="head-indicator">▲</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}