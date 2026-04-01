'use client';

import React, { useEffect, useRef } from 'react';

interface TapeVisualizationProps {
  tapes: string[][];
  headPositions: number[];
  numTapes: number;
  writtenCells?: Set<string>; // "tapeIndex-cellIndex"
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

  // Compute movement direction per tape
  const moveDirections = headPositions.map((pos, i) => {
    const prev = prevHeadPositions.current[i] ?? pos;
    if (pos > prev) return 'right';
    if (pos < prev) return 'left';
    return 'none';
  });

  // Update prevHeadPositions after render
  useEffect(() => {
    prevHeadPositions.current = [...headPositions];
  }, [headPositions]);

  // Auto-scroll to keep head centered
  useEffect(() => {
    headPositions.forEach((pos, tapeIdx) => {
      const container = tapeRefs.current[tapeIdx];
      if (container) {
        const cellWidth = 50; // cell-size + gap
        const scrollTarget = pos * cellWidth - container.clientWidth / 2 + cellWidth / 2;
        container.scrollTo({ left: scrollTarget, behavior: 'smooth' });
      }
    });
  }, [headPositions]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {Array.from({ length: numTapes }).map((_, tapeIdx) => {
        const tape = tapes[tapeIdx] || [];
        const headPos = headPositions[tapeIdx] ?? 0;
        const moveDir = moveDirections[tapeIdx];

        return (
          <div key={tapeIdx}>
            <div className="tape-label">
              <span className="tape-num">{tapeIdx + 1}</span>
              Tape {tapeIdx + 1}
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
