'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import QUESTIONS from '../data/questions.json';
import QuestionCard from './QuestionCard';
import QRBox from './QRBox';

const AVATARS = ['🧑‍🚀', '🦸', '🧙', '🥷', '🦊', '🐱', '🐉', '🦄'];

const MISSIONS = [
  { key: 'L1', label: 'Lesson 1 · Computer Parts', em: '🖥️' },
  { key: 'L2', label: 'Lesson 2 · Software Types', em: '💾' },
  { key: 'L3', label: 'Lesson 3 · Installing an OS', em: '⚙️' },
  { key: 'L4', label: 'Lesson 4 · Files & Folders', em: '📁' },
  { key: 'L5', label: 'Lesson 5 · BIOS & Boot', em: '🔌' },
  { key: 'TK03', label: 'Safety Rules', em: '🛡️' },
  { key: 'TK05', label: 'Troubleshooting', em: '🛠️' },
  { key: 'ALL', label: `All ${QUESTIONS.length} — Full Marathon`, em: '🏆' },
];

const LESSON_NAMES = { L1: 'Lesson 1', L2: 'Lesson 2', L3: 'Lesson 3', L4: 'Lesson 4', L5: 'Lesson 5', TK03: 'Safety', TK05: 'Troubleshoot' };
const TYPE_NAMES = { tf: 'True / False', mcq: 'Multiple Choice', fill: 'Fill in the Blank', match: 'Matching', essay: 'Think & Check' };

const GHOST_DEFS = [
  { name: 'Lazy Turtle', icon: '🐢', totalSec: 300 },
  { name: 'Steady Fox', icon: '🦊', totalSec: 220 },
  { name: 'Quick Falcon', icon: '🦅', totalSec: 150 },
];

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m + 'm ' + (s < 10 ? '0' : '') + s + 's';
}

export default function GameApp() {
  const [screen, setScreen] = useState('start'); // start | game | end
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [mission, setMission] = useState(null);

  const [pool, setPool] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState(null); // {ok, node}
  const [startTime, setStartTime] = useState(0);
  const [ghosts, setGhosts] = useState([]);
  const [raceMapOpen, setRaceMapOpen] = useState(false);
  const [savedResult, setSavedResult] = useState(false);
  const [copyState, setCopyState] = useState('📋 Copy My Result');
  const [copyHint, setCopyHint] = useState('Paste it in the class WhatsApp or Classroom so your teacher can see it.');

  const missionCounts = useMemo(() => {
    const m = {};
    MISSIONS.forEach((mm) => {
      m[mm.key] = mm.key === 'ALL' ? QUESTIONS.length : QUESTIONS.filter((q) => q.lesson === mm.key).length;
    });
    return m;
  }, []);

  function startGame() {
    if (!mission) return;
    const basePool = mission === 'ALL' ? QUESTIONS : QUESTIONS.filter((q) => q.lesson === mission);
    const p = shuffled(basePool);
    setPool(p);
    setIdx(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setAnswered(false);
    setFeedback(null);
    setStartTime(Date.now());
    setGhosts(GHOST_DEFS.map((g) => ({ ...g, secPerStep: g.totalSec / p.length })));
    setSavedResult(false);
    setCopyState('📋 Copy My Result');
    setCopyHint('Paste it in the class WhatsApp or Classroom so your teacher can see it.');
    setScreen('game');
  }

  function handleAnswer(correct, explainNode) {
    setAnswered(true);
    if (correct) {
      setScore((s) => s + 1);
      setStreak((st) => {
        const next = st + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }
    setFeedback({ ok: correct, node: explainNode });
  }

  function celebrate() {
    const colors = ['#ff8fb8', '#b79cf0', '#6fd9ae', '#ffd166'];
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 }, colors });
    setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.4 }, colors }), 300);
    setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { y: 0.7 }, colors }), 600);
  }

  function next() {
    const nextIdx = idx + 1;
    if (nextIdx >= pool.length) {
      celebrate();
      setScreen('end');
    } else {
      setIdx(nextIdx);
      setAnswered(false);
      setFeedback(null);
    }
  }

  // Save the result to the database exactly once, as soon as the end screen shows.
  useEffect(() => {
    if (screen !== 'end' || savedResult || pool.length === 0) return;
    setSavedResult(true);
    const finishSeconds = (Date.now() - startTime) / 1000;
    fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name || 'Explorer',
        avatar,
        mission,
        score,
        total: pool.length,
        bestStreak,
        finishSeconds,
      }),
    }).catch(() => {
      // Best-effort — a failed save never blocks the student from seeing their result.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const currentQ = pool[idx];
  const pct = pool.length ? Math.round((idx / pool.length) * 100) : 0;

  function retry() {
    setScreen('start');
    setMission(null);
  }

  async function copyResult() {
    const finalPct = pool.length ? Math.round((score / pool.length) * 100) : 0;
    const finishSeconds = (Date.now() - startTime) / 1000;
    const missionLabel = (MISSIONS.find((m) => m.key === mission) || {}).label || mission;
    const text =
      '✨ Treasure Trail — ' + (name || 'Explorer') + ' ' + avatar +
      ' — ' + missionLabel + ' — ' + score + '/' + pool.length + ' (' + finalPct + '%) — best streak ' + bestStreak + '🔥 — finished in ' + formatTime(finishSeconds);
    try {
      await navigator.clipboard.writeText(text);
      setCopyState('✅ Copied!');
      setCopyHint(text);
    } catch (e) {
      setCopyHint('Copy failed — select this text manually: ' + text);
    }
    setTimeout(() => setCopyState('📋 Copy My Result'), 2500);
  }

  return (
    <div className="page">
      <div className="wrap">
        <div className="brand">
          <span className="chip">✨ Eng. Sabah&apos;s Class</span>
          <h1>Treasure Trail</h1>
          <p>Unit 1 review — every question type, your own pace</p>
        </div>

        {screen === 'start' && (
          <div className="screen">
            <QRBox />
            <p className="field-label">Your name</p>
            <input
              className="name-input"
              type="text"
              placeholder="e.g. Malak"
              maxLength={18}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="field-label">Pick your explorer</p>
            <div className="avatar-grid">
              {AVATARS.map((em) => (
                <button
                  key={em}
                  className={'avatar-btn' + (avatar === em ? ' selected' : '')}
                  onClick={() => setAvatar(em)}
                >
                  {em}
                </button>
              ))}
            </div>
            <p className="field-label">Choose your mission</p>
            <div className="mission-grid">
              {MISSIONS.map((m) => (
                <button
                  key={m.key}
                  className={'mission-btn' + (mission === m.key ? ' selected' : '')}
                  onClick={() => setMission(m.key)}
                >
                  <span className="em">{m.em}</span>
                  <span className="tx">
                    <span className="ttl">{m.label}</span>
                    <span className="sub">{missionCounts[m.key]} questions</span>
                  </span>
                </button>
              ))}
            </div>
            <button className="start-btn" disabled={!mission} onClick={startGame}>
              Set Sail ▸
            </button>
            <div className="meta-row">
              <span>{mission ? missionCounts[mission] + ' questions on this trail' : 'Pick a mission above'}</span>
              <span>{QUESTIONS.length} questions · 7 topics</span>
            </div>
          </div>
        )}

        {screen === 'game' && currentQ && (
          <div className="screen">
            <div className="hud">
              <span className="pos">{idx}/{pool.length}</span>
              <div className="mini-trail">
                <div className="fill" style={{ width: pct + '%' }} />
              </div>
              {streak >= 2 && (
                <span className="streak-chip show">{streak >= 3 ? '🔥' : '⭐'} {streak}</span>
              )}
              <button className="map-btn" onClick={() => setRaceMapOpen(true)}>🗺️ Map</button>
            </div>
            <div>
              <span className="q-tag">{LESSON_NAMES[currentQ.lesson] || currentQ.lesson}</span>
              <span className="q-type-tag">{TYPE_NAMES[currentQ.type] || currentQ.type}</span>
            </div>
            <p className="q-prompt">{currentQ.text}</p>
            <QuestionCard key={idx} q={currentQ} onAnswer={handleAnswer} />
            {feedback && (
              <div className={'feedback ' + (feedback.ok ? 'ok' : 'bad')}>
                <b>{feedback.ok ? '✓ Correct!' : '✗ Not quite'}</b>
                {feedback.node}
              </div>
            )}
            {answered && (
              <button className="next-btn" onClick={next}>
                Next ▸
              </button>
            )}
          </div>
        )}

        {screen === 'end' && (
          <EndScreen
            name={name}
            avatar={avatar}
            mission={mission}
            pool={pool}
            score={score}
            bestStreak={bestStreak}
            startTime={startTime}
            ghosts={ghosts}
            onRetry={retry}
            onCopy={copyResult}
            copyState={copyState}
            copyHint={copyHint}
          />
        )}
      </div>

      {screen === 'game' && raceMapOpen && (
        <RaceMap
          name={name}
          avatar={avatar}
          idx={idx}
          pool={pool}
          startTime={startTime}
          ghosts={ghosts}
          onClose={() => setRaceMapOpen(false)}
        />
      )}
    </div>
  );
}

function EndScreen({ name, avatar, mission, pool, score, bestStreak, startTime, ghosts, onRetry, onCopy, copyState, copyHint }) {
  const total = pool.length;
  const pct = total ? Math.round((score / total) * 100) : 0;
  const msg =
    pct >= 90 ? `Legendary — treasure hunter tier! Best streak: ${bestStreak}🔥` :
    pct >= 70 ? `Great haul — a few gaps to patch. Best streak: ${bestStreak}🔥` :
    pct >= 50 ? 'Halfway to the gold — worth another run.' :
    'The map needs another look before you sail again.';

  const finishSec = (Date.now() - startTime) / 1000;
  const entries = useMemo(() => {
    const list = [{ name: (name || 'Explorer') + ' (you)', icon: avatar, time: finishSec, mine: true }];
    ghosts.forEach((g) => list.push({ name: g.name, icon: g.icon, time: total * g.secPerStep, mine: false }));
    list.sort((a, b) => a.time - b.time);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="screen">
      <div className="q-tag">Trail complete</div>
      <div className="result-score">
        <span className="num">{score}</span>
        <span className="den">/{total}</span>
        <div className="pct">{pct}% · {msg}</div>
      </div>
      <p className="field-label">Final standings</p>
      <div className="standings">
        {entries.map((e, i) => {
          const medal = ['🥇', '🥈', '🥉', '🏅'][i] || '🏅';
          return (
            <div key={i} className={'standing-row' + (e.mine ? ' me' : '')}>
              <span className="rank">{medal}</span>
              <span className="ava">{e.icon}</span>
              <span className="nm">{e.name}</span>
              <span className="tm">{formatTime(e.time)}</span>
            </div>
          );
        })}
      </div>
      <button
        className="start-btn"
        style={{ marginBottom: 10, background: 'linear-gradient(180deg,var(--mint),var(--mint-deep))', boxShadow: '0 8px 0 #1f7a53, 0 14px 24px -10px rgba(140,80,150,.4)' }}
        onClick={onCopy}
      >
        {copyState}
      </button>
      <p style={{ textAlign: 'center', fontSize: '.76rem', color: 'var(--ink-soft)', margin: '6px 0 14px' }}>{copyHint}</p>
      <QRBox />
      <button className="start-btn" onClick={onRetry}>
        Pick a New Mission ▸
      </button>
    </div>
  );
}

function RaceMap({ name, avatar, idx, pool, startTime, ghosts, onClose }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const total = pool.length;
  const yourPct = Math.min(100, Math.round((idx / total) * 100));
  const elapsedSec = (Date.now() - startTime) / 1000;

  let winnerText = '';
  const ghostPcts = ghosts.map((g) => {
    const stepsDone = Math.floor(elapsedSec / g.secPerStep);
    const p = Math.min(100, Math.round((stepsDone / total) * 100));
    if (p >= 100 && !winnerText && yourPct < 100) {
      winnerText = g.icon + ' ' + g.name + ' reached the treasure first! Hurry up! 🏃';
    }
    return p;
  });

  let banner = null;
  if (yourPct >= 100) banner = '🏆 ' + avatar + ' ' + (name || 'Explorer') + ' reached the treasure!';
  else if (winnerText) banner = winnerText;

  return (
    <div className="race-overlay">
      <div className="race-head">
        <h2>🗺️ Race Map</h2>
        <button className="close-btn" onClick={onClose}>Close ✕</button>
      </div>
      <div className="lanes">
        <div className="lane">
          <div className="label">
            <span className="you">{avatar} {name || 'Explorer'} (you)</span>
            <span>{yourPct}%</span>
          </div>
          <div className="track">
            <span className="chest">🏆</span>
            <span className="runner" style={{ left: yourPct + '%' }}>{avatar}</span>
          </div>
        </div>
        {ghosts.map((g, gi) => (
          <div className="lane" key={gi}>
            <div className="label">
              <span>{g.icon} {g.name}</span>
              <span>{ghostPcts[gi]}%</span>
            </div>
            <div className="track">
              <span className="chest">🏆</span>
              <span className="runner" style={{ left: ghostPcts[gi] + '%' }}>{g.icon}</span>
            </div>
          </div>
        ))}
      </div>
      {banner && <div className="winner-banner">{banner}</div>}
    </div>
  );
}
