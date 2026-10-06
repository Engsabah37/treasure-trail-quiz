import QUESTIONS from '../data/questions.json';

export const AVATARS = ['🧑‍🚀', '🦸', '🧙', '🥷', '🦊', '🐱', '🐉', '🦄'];

export const MISSIONS = [
  { key: 'L1', label: 'Lesson 1 · Computer Parts', em: '🖥️' },
  { key: 'L2', label: 'Lesson 2 · Software Types', em: '💾' },
  { key: 'L3', label: 'Lesson 3 · Installing an OS', em: '⚙️' },
  { key: 'L4', label: 'Lesson 4 · Files & Folders', em: '📁' },
  { key: 'L5', label: 'Lesson 5 · BIOS & Boot', em: '🔌' },
  { key: 'TK03', label: 'Safety Rules', em: '🛡️' },
  { key: 'TK05', label: 'Troubleshooting', em: '🛠️' },
  { key: 'ALL', label: `All ${QUESTIONS.length} — Full Marathon`, em: '🏆' },
];

export const LESSON_NAMES = { L1: 'Lesson 1', L2: 'Lesson 2', L3: 'Lesson 3', L4: 'Lesson 4', L5: 'Lesson 5', TK03: 'Safety', TK05: 'Troubleshoot' };
export const TYPE_NAMES = { tf: 'True / False', mcq: 'Multiple Choice', fill: 'Fill in the Blank', match: 'Matching', essay: 'Think & Check' };

export const GHOST_DEFS = [
  { name: 'Lazy Turtle', icon: '🐢', totalSec: 300 },
  { name: 'Steady Fox', icon: '🦊', totalSec: 220 },
  { name: 'Quick Falcon', icon: '🦅', totalSec: 150 },
];

export { QUESTIONS };
