'use client';

import React from 'react';
import { EXAMPLES } from '../lib/examples';

interface ExampleSelectorProps {
  currentExample: string;
  onSelect: (name: string) => void;
}

export default function ExampleSelector({
  currentExample,
  onSelect,
}: ExampleSelectorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <label style={{
        fontSize: '13px',
        color: 'var(--text-secondary)',
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}>
        Load Example:
      </label>
      <select
        className="input-field"
        value={currentExample}
        onChange={(e) => onSelect(e.target.value)}
        style={{ maxWidth: '220px' }}
      >
        <option value="">— Custom —</option>
        {EXAMPLES.map(ex => (
          <option key={ex.name} value={ex.name}>
            {ex.name} ({ex.numTapes} tapes)
          </option>
        ))}
      </select>
    </div>
  );
}
