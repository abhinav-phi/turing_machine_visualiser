import { MachineConfig } from './turingEngine';

// ===== Pre-loaded Example Configurations =====

export const EXAMPLES: MachineConfig[] = [
  // ========== 1. STRING COPY (2 tapes) ==========
  {
    name: 'String Copy',
    description:
      'Copies the input string from Tape 1 to Tape 2. Demonstrates the basic power of multi-tape machines: reading from one tape while writing to another simultaneously.',
    numTapes: 2,
    states: ['q0', 'q1', 'qAccept'],
    alphabet: ['0', '1', '_'],
    blankSymbol: '_',
    initialState: 'q0',
    acceptStates: ['qAccept'],
    rejectStates: [],
    transitions: [
      // q0: read from tape 1, write to tape 2
      {
        fromState: 'q0',
        readSymbols: ['0', '_'],
        toState: 'q0',
        writeSymbols: ['0', '0'],
        directions: ['R', 'R'],
      },
      {
        fromState: 'q0',
        readSymbols: ['1', '_'],
        toState: 'q0',
        writeSymbols: ['1', '1'],
        directions: ['R', 'R'],
      },
      // When tape 1 is blank, we're done — rewind
      {
        fromState: 'q0',
        readSymbols: ['_', '_'],
        toState: 'q1',
        writeSymbols: ['_', '_'],
        directions: ['L', 'L'],
      },
      // q1: rewind both tapes
      {
        fromState: 'q1',
        readSymbols: ['0', '0'],
        toState: 'q1',
        writeSymbols: ['0', '0'],
        directions: ['L', 'L'],
      },
      {
        fromState: 'q1',
        readSymbols: ['1', '1'],
        toState: 'q1',
        writeSymbols: ['1', '1'],
        directions: ['L', 'L'],
      },
      {
        fromState: 'q1',
        readSymbols: ['_', '_'],
        toState: 'qAccept',
        writeSymbols: ['_', '_'],
        directions: ['R', 'R'],
      },
    ],
    initialTapes: [
      ['1', '0', '1', '1', '0'],
      [],
    ],
  },

  // ========== 2. BINARY ADDITION (3 tapes) ==========
  {
    name: 'Binary Addition',
    description:
      'Adds two binary numbers from Tape 1 and Tape 2, writing the result to Tape 3. Shows how multiple tapes allow parallel data access without shuffling.',
    numTapes: 3,
    states: ['qStart', 'qAdd0', 'qAdd1', 'qCarry', 'qDone', 'qAccept'],
    alphabet: ['0', '1', '_'],
    blankSymbol: '_',
    initialState: 'qStart',
    acceptStates: ['qAccept'],
    rejectStates: [],
    transitions: [
      // qStart: move all heads to rightmost digit first
      {
        fromState: 'qStart',
        readSymbols: ['0', '*', '_'],
        toState: 'qStart',
        writeSymbols: ['0', '*', '_'],
        directions: ['R', 'S', 'S'],
      },
      {
        fromState: 'qStart',
        readSymbols: ['1', '*', '_'],
        toState: 'qStart',
        writeSymbols: ['1', '*', '_'],
        directions: ['R', 'S', 'S'],
      },
      {
        fromState: 'qStart',
        readSymbols: ['_', '*', '_'],
        toState: 'qAdd0',
        writeSymbols: ['_', '*', '_'],
        directions: ['L', 'S', 'S'],
      },
      // qAdd0: no carry — add digits
      // 0+0=0
      {
        fromState: 'qAdd0',
        readSymbols: ['0', '0', '_'],
        toState: 'qAdd0',
        writeSymbols: ['0', '0', '0'],
        directions: ['L', 'L', 'L'],
      },
      // 0+1=1
      {
        fromState: 'qAdd0',
        readSymbols: ['0', '1', '_'],
        toState: 'qAdd0',
        writeSymbols: ['0', '1', '1'],
        directions: ['L', 'L', 'L'],
      },
      // 1+0=1
      {
        fromState: 'qAdd0',
        readSymbols: ['1', '0', '_'],
        toState: 'qAdd0',
        writeSymbols: ['1', '0', '1'],
        directions: ['L', 'L', 'L'],
      },
      // 1+1=0, carry
      {
        fromState: 'qAdd0',
        readSymbols: ['1', '1', '_'],
        toState: 'qAdd1',
        writeSymbols: ['1', '1', '0'],
        directions: ['L', 'L', 'L'],
      },
      // one operand exhausted
      {
        fromState: 'qAdd0',
        readSymbols: ['_', '0', '_'],
        toState: 'qAdd0',
        writeSymbols: ['_', '0', '0'],
        directions: ['S', 'L', 'L'],
      },
      {
        fromState: 'qAdd0',
        readSymbols: ['_', '1', '_'],
        toState: 'qAdd0',
        writeSymbols: ['_', '1', '1'],
        directions: ['S', 'L', 'L'],
      },
      {
        fromState: 'qAdd0',
        readSymbols: ['0', '_', '_'],
        toState: 'qAdd0',
        writeSymbols: ['0', '_', '0'],
        directions: ['L', 'S', 'L'],
      },
      {
        fromState: 'qAdd0',
        readSymbols: ['1', '_', '_'],
        toState: 'qAdd0',
        writeSymbols: ['1', '_', '1'],
        directions: ['L', 'S', 'L'],
      },
      // both done, no carry
      {
        fromState: 'qAdd0',
        readSymbols: ['_', '_', '_'],
        toState: 'qDone',
        writeSymbols: ['_', '_', '_'],
        directions: ['S', 'S', 'R'],
      },

      // qAdd1: carry = 1
      // 0+0+1=1
      {
        fromState: 'qAdd1',
        readSymbols: ['0', '0', '_'],
        toState: 'qAdd0',
        writeSymbols: ['0', '0', '1'],
        directions: ['L', 'L', 'L'],
      },
      // 0+1+1=0, carry
      {
        fromState: 'qAdd1',
        readSymbols: ['0', '1', '_'],
        toState: 'qAdd1',
        writeSymbols: ['0', '1', '0'],
        directions: ['L', 'L', 'L'],
      },
      // 1+0+1=0, carry
      {
        fromState: 'qAdd1',
        readSymbols: ['1', '0', '_'],
        toState: 'qAdd1',
        writeSymbols: ['1', '0', '0'],
        directions: ['L', 'L', 'L'],
      },
      // 1+1+1=1, carry
      {
        fromState: 'qAdd1',
        readSymbols: ['1', '1', '_'],
        toState: 'qAdd1',
        writeSymbols: ['1', '1', '1'],
        directions: ['L', 'L', 'L'],
      },
      // one operand exhausted with carry
      {
        fromState: 'qAdd1',
        readSymbols: ['_', '0', '_'],
        toState: 'qAdd0',
        writeSymbols: ['_', '0', '1'],
        directions: ['S', 'L', 'L'],
      },
      {
        fromState: 'qAdd1',
        readSymbols: ['_', '1', '_'],
        toState: 'qAdd1',
        writeSymbols: ['_', '1', '0'],
        directions: ['S', 'L', 'L'],
      },
      {
        fromState: 'qAdd1',
        readSymbols: ['0', '_', '_'],
        toState: 'qAdd0',
        writeSymbols: ['0', '_', '1'],
        directions: ['L', 'S', 'L'],
      },
      {
        fromState: 'qAdd1',
        readSymbols: ['1', '_', '_'],
        toState: 'qAdd1',
        writeSymbols: ['1', '_', '0'],
        directions: ['L', 'S', 'L'],
      },
      // both done, carry remains
      {
        fromState: 'qAdd1',
        readSymbols: ['_', '_', '_'],
        toState: 'qDone',
        writeSymbols: ['_', '_', '1'],
        directions: ['S', 'S', 'R'],
      },

      // qDone: accept
      {
        fromState: 'qDone',
        readSymbols: ['*', '*', '*'],
        toState: 'qAccept',
        writeSymbols: ['*', '*', '*'],
        directions: ['S', 'S', 'S'],
      },
    ],
    initialTapes: [
      ['1', '0', '1', '1'],  // 11 in decimal
      ['1', '1', '0'],        // 6 in decimal
      [],                      // result tape
    ],
  },

  // ========== 3. PALINDROME CHECKER (2 tapes) ==========
  {
    name: 'Palindrome Checker',
    description:
      'Checks if the input string on Tape 1 is a palindrome by copying it in reverse to Tape 2, then comparing. A single-tape machine would need many back-and-forth sweeps.',
    numTapes: 2,
    states: ['qCopy', 'qRewind1', 'qRewind2', 'qCompare', 'qAccept', 'qReject'],
    alphabet: ['a', 'b', '_'],
    blankSymbol: '_',
    initialState: 'qCopy',
    acceptStates: ['qAccept'],
    rejectStates: ['qReject'],
    transitions: [
      // qCopy: move tape 1 head to end while counting
      {
        fromState: 'qCopy',
        readSymbols: ['a', '_'],
        toState: 'qCopy',
        writeSymbols: ['a', '_'],
        directions: ['R', 'S'],
      },
      {
        fromState: 'qCopy',
        readSymbols: ['b', '_'],
        toState: 'qCopy',
        writeSymbols: ['b', '_'],
        directions: ['R', 'S'],
      },
      // end of input: start reverse copy
      {
        fromState: 'qCopy',
        readSymbols: ['_', '_'],
        toState: 'qRewind1',
        writeSymbols: ['_', '_'],
        directions: ['L', 'S'],
      },
      // qRewind1: copy tape 1 in reverse to tape 2
      {
        fromState: 'qRewind1',
        readSymbols: ['a', '_'],
        toState: 'qRewind1',
        writeSymbols: ['a', 'a'],
        directions: ['L', 'R'],
      },
      {
        fromState: 'qRewind1',
        readSymbols: ['b', '_'],
        toState: 'qRewind1',
        writeSymbols: ['b', 'b'],
        directions: ['L', 'R'],
      },
      // reached beginning of tape 1
      {
        fromState: 'qRewind1',
        readSymbols: ['_', '_'],
        toState: 'qRewind2',
        writeSymbols: ['_', '_'],
        directions: ['R', 'L'],
      },
      // qRewind2: rewind tape 2 head to start
      {
        fromState: 'qRewind2',
        readSymbols: ['*', 'a'],
        toState: 'qRewind2',
        writeSymbols: ['*', 'a'],
        directions: ['S', 'L'],
      },
      {
        fromState: 'qRewind2',
        readSymbols: ['*', 'b'],
        toState: 'qRewind2',
        writeSymbols: ['*', 'b'],
        directions: ['S', 'L'],
      },
      {
        fromState: 'qRewind2',
        readSymbols: ['*', '_'],
        toState: 'qCompare',
        writeSymbols: ['*', '_'],
        directions: ['S', 'R'],
      },
      // qCompare: compare tape 1 (forward) with tape 2 (forward = reverse of original)
      {
        fromState: 'qCompare',
        readSymbols: ['a', 'a'],
        toState: 'qCompare',
        writeSymbols: ['a', 'a'],
        directions: ['R', 'R'],
      },
      {
        fromState: 'qCompare',
        readSymbols: ['b', 'b'],
        toState: 'qCompare',
        writeSymbols: ['b', 'b'],
        directions: ['R', 'R'],
      },
      // mismatch
      {
        fromState: 'qCompare',
        readSymbols: ['a', 'b'],
        toState: 'qReject',
        writeSymbols: ['a', 'b'],
        directions: ['S', 'S'],
      },
      {
        fromState: 'qCompare',
        readSymbols: ['b', 'a'],
        toState: 'qReject',
        writeSymbols: ['b', 'a'],
        directions: ['S', 'S'],
      },
      // both done — palindrome!
      {
        fromState: 'qCompare',
        readSymbols: ['_', '_'],
        toState: 'qAccept',
        writeSymbols: ['_', '_'],
        directions: ['S', 'S'],
      },
    ],
    initialTapes: [
      ['a', 'b', 'b', 'a'],
      [],
    ],
  },

  // ========== 4. STRING REVERSAL (2 tapes) ==========
  {
    name: 'String Reversal',
    description:
      'Reverses the input string from Tape 1 onto Tape 2. First moves to the end of Tape 1, then copies characters backwards to Tape 2, demonstrating efficient data rearrangement with two tapes.',
    numTapes: 2,
    states: ['qRight', 'qCopyRev', 'qAccept'],
    alphabet: ['a', 'b', 'c', '_'],
    blankSymbol: '_',
    initialState: 'qRight',
    acceptStates: ['qAccept'],
    rejectStates: [],
    transitions: [
      // qRight: move tape 1 head to end of input
      {
        fromState: 'qRight',
        readSymbols: ['a', '_'],
        toState: 'qRight',
        writeSymbols: ['a', '_'],
        directions: ['R', 'S'],
      },
      {
        fromState: 'qRight',
        readSymbols: ['b', '_'],
        toState: 'qRight',
        writeSymbols: ['b', '_'],
        directions: ['R', 'S'],
      },
      {
        fromState: 'qRight',
        readSymbols: ['c', '_'],
        toState: 'qRight',
        writeSymbols: ['c', '_'],
        directions: ['R', 'S'],
      },
      // reached blank — start copying in reverse
      {
        fromState: 'qRight',
        readSymbols: ['_', '_'],
        toState: 'qCopyRev',
        writeSymbols: ['_', '_'],
        directions: ['L', 'S'],
      },
      // qCopyRev: read from tape 1 going left, write to tape 2 going right
      {
        fromState: 'qCopyRev',
        readSymbols: ['a', '_'],
        toState: 'qCopyRev',
        writeSymbols: ['a', 'a'],
        directions: ['L', 'R'],
      },
      {
        fromState: 'qCopyRev',
        readSymbols: ['b', '_'],
        toState: 'qCopyRev',
        writeSymbols: ['b', 'b'],
        directions: ['L', 'R'],
      },
      {
        fromState: 'qCopyRev',
        readSymbols: ['c', '_'],
        toState: 'qCopyRev',
        writeSymbols: ['c', 'c'],
        directions: ['L', 'R'],
      },
      // done reversing
      {
        fromState: 'qCopyRev',
        readSymbols: ['_', '_'],
        toState: 'qAccept',
        writeSymbols: ['_', '_'],
        directions: ['S', 'S'],
      },
    ],
    initialTapes: [
      ['a', 'b', 'c', 'b', 'a'],
      [],
    ],
  },

  // ========== 5. UNARY MULTIPLICATION (3 tapes) ==========
  {
    name: 'Unary Multiplication',
    description:
      'Multiplies two unary numbers (Tape 1 × Tape 2) and writes the result on Tape 3. For each "1" on Tape 1, copies all of Tape 2 onto Tape 3. Shows how multiple tapes simplify nested loops.',
    numTapes: 3,
    states: ['qRead1', 'qCopy2', 'qRewind2', 'qNext1', 'qAccept'],
    alphabet: ['1', '_'],
    blankSymbol: '_',
    initialState: 'qRead1',
    acceptStates: ['qAccept'],
    rejectStates: [],
    transitions: [
      // qRead1: read a 1 from tape 1, start copying tape 2
      {
        fromState: 'qRead1',
        readSymbols: ['1', '*', '_'],
        toState: 'qCopy2',
        writeSymbols: ['1', '*', '_'],
        directions: ['S', 'S', 'S'],
      },
      // tape 1 exhausted — done
      {
        fromState: 'qRead1',
        readSymbols: ['_', '*', '_'],
        toState: 'qAccept',
        writeSymbols: ['_', '*', '_'],
        directions: ['S', 'S', 'S'],
      },
      // qCopy2: copy each 1 from tape 2 to tape 3
      {
        fromState: 'qCopy2',
        readSymbols: ['*', '1', '_'],
        toState: 'qCopy2',
        writeSymbols: ['*', '1', '1'],
        directions: ['S', 'R', 'R'],
      },
      // tape 2 exhausted — rewind tape 2
      {
        fromState: 'qCopy2',
        readSymbols: ['*', '_', '_'],
        toState: 'qRewind2',
        writeSymbols: ['*', '_', '_'],
        directions: ['S', 'L', 'S'],
      },
      // qRewind2: rewind tape 2 head back to start
      {
        fromState: 'qRewind2',
        readSymbols: ['*', '1', '*'],
        toState: 'qRewind2',
        writeSymbols: ['*', '1', '*'],
        directions: ['S', 'L', 'S'],
      },
      {
        fromState: 'qRewind2',
        readSymbols: ['*', '_', '*'],
        toState: 'qNext1',
        writeSymbols: ['*', '_', '*'],
        directions: ['S', 'R', 'S'],
      },
      // qNext1: move to next symbol on tape 1
      {
        fromState: 'qNext1',
        readSymbols: ['1', '*', '*'],
        toState: 'qRead1',
        writeSymbols: ['1', '*', '*'],
        directions: ['R', 'S', 'S'],
      },
      {
        fromState: 'qNext1',
        readSymbols: ['_', '*', '*'],
        toState: 'qAccept',
        writeSymbols: ['_', '*', '*'],
        directions: ['S', 'S', 'S'],
      },
    ],
    initialTapes: [
      ['1', '1', '1'],     // 3
      ['1', '1'],           // × 2
      [],                    // result: 6 ones
    ],
  },
];

export function getExampleByName(name: string): MachineConfig | undefined {
  return EXAMPLES.find(e => e.name === name);
}
