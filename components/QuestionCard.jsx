'use client';
import { useState, useRef, useEffect } from 'react';

function normalize(s) {
  return s
    .toLowerCase()
    .replace(/[.\-_/\\]+/g, ' ')
    .replace(/[^a-z0-9+% ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isCorrectFill(raw, accepts) {
  const input = normalize(raw);
  if (!input) return false;
  for (const a of accepts) {
    const acc = normalize(a);
    if (!acc) continue;
    if (input === acc) return true;
    const re = new RegExp('(^| )' + acc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($| )');
    if (re.test(' ' + input + ' ')) return true;
    if (re.test(' ' + acc + ' ') && acc.includes(input) && input.length >= 2) return true;
  }
  return false;
}

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Renders ONE question with the UI that fits its type, and calls
// onAnswer(correct, explanationNode) exactly once the student has answered.
// Mount with a `key` tied to the question index so all local state resets
// automatically on the next question.
export default function QuestionCard({ q, onAnswer }) {
  if (q.type === 'tf') return <TF q={q} onAnswer={onAnswer} />;
  if (q.type === 'mcq') return <MCQ q={q} onAnswer={onAnswer} />;
  if (q.type === 'fill') return <Fill q={q} onAnswer={onAnswer} />;
  if (q.type === 'match') return <Match q={q} onAnswer={onAnswer} />;
  if (q.type === 'essay') return <Essay q={q} onAnswer={onAnswer} />;
  return null;
}

function TF({ q, onAnswer }) {
  const [picked, setPicked] = useState(null);
  function pick(val) {
    if (picked !== null) return;
    setPicked(val);
    const correct = val === q.answer;
    onAnswer(correct, <>The correct answer is <b style={{ display: 'inline', color: 'var(--good)' }}>{q.answer ? 'True' : 'False'}</b>.</>);
  }
  return (
    <div className="tf-row">
      {[true, false].map((val) => {
        let cls = 'opt-btn';
        if (picked !== null) {
          if (val === picked) cls += val === q.answer ? ' pick-correct' : ' pick-wrong';
          if (val !== picked && val === q.answer) cls += ' reveal-correct';
        }
        return (
          <button key={String(val)} className={cls} disabled={picked !== null} onClick={() => pick(val)}>
            {val ? '✅ True' : '❌ False'}
          </button>
        );
      })}
    </div>
  );
}

function MCQ({ q, onAnswer }) {
  const [picked, setPicked] = useState(null);
  function pick(i) {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === q.correct;
    onAnswer(correct, <>The correct answer is <b style={{ display: 'inline', color: 'var(--good)' }}>{q.opts[q.correct]}</b>.</>);
  }
  return (
    <div className="opt-grid">
      {q.opts.map((opt, i) => {
        let cls = 'opt-btn';
        if (picked !== null) {
          if (i === picked) cls += i === q.correct ? ' pick-correct' : ' pick-wrong';
          if (i !== picked && i === q.correct) cls += ' reveal-correct';
        }
        return (
          <button key={i} className={cls} disabled={picked !== null} onClick={() => pick(i)}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function Fill({ q, onAnswer }) {
  const [val, setVal] = useState('');
  const [done, setDone] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => ref.current && ref.current.focus(), 50);
    return () => clearTimeout(t);
  }, []);
  function submit() {
    if (done) return;
    const v = val.trim();
    if (!v) {
      ref.current && ref.current.focus();
      return;
    }
    setDone(true);
    const correct = isCorrectFill(v, q.accept);
    onAnswer(correct, correct ? null : <>Accepted answer: <b style={{ display: 'inline', color: 'var(--good)' }}>{q.accept[0]}</b>.</>);
  }
  return (
    <div className="answer-row">
      <input
        ref={ref}
        type="text"
        placeholder="Type your answer…"
        autoComplete="off"
        value={val}
        disabled={done}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
      />
      <button disabled={done} onClick={submit}>
        Send
      </button>
    </div>
  );
}

function Match({ q, onAnswer }) {
  const [leftItems] = useState(() => q.pairs.map((p, i) => ({ text: p[0], pairIdx: i })));
  const [rightItems] = useState(() => shuffled(q.pairs.map((p, i) => ({ text: p[1], pairIdx: i }))));
  const [matched, setMatched] = useState(new Set());
  const [selLeft, setSelLeft] = useState(null);
  const [selRight, setSelRight] = useState(null);
  const [wrongFlash, setWrongFlash] = useState(null); // {left, right}
  const mistakesRef = useRef(0);
  const doneRef = useRef(false);

  function pick(side, pairIdx) {
    if (doneRef.current || wrongFlash) return;
    if (side === 'L') {
      if (matched.has('L' + pairIdx)) return;
      setSelLeft(pairIdx);
    } else {
      if (matched.has('R' + pairIdx)) return;
      setSelRight(pairIdx);
    }
  }

  useEffect(() => {
    if (selLeft === null || selRight === null) return;
    if (selLeft === selRight) {
      setMatched((prev) => {
        const next = new Set(prev);
        next.add('L' + selLeft);
        next.add('R' + selRight);
        if (next.size === q.pairs.length * 2) {
          doneRef.current = true;
          const correct = mistakesRef.current === 0;
          onAnswer(correct, correct ? null : 'Great job pairing them all — just a couple of mismatches along the way.');
        }
        return next;
      });
      setSelLeft(null);
      setSelRight(null);
    } else {
      mistakesRef.current += 1;
      setWrongFlash({ left: selLeft, right: selRight });
      const t = setTimeout(() => {
        setWrongFlash(null);
        setSelLeft(null);
        setSelRight(null);
      }, 500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selLeft, selRight]);

  return (
    <div>
      <p className="match-hint">Tap one item on the left, then its match on the right.</p>
      <div className="match-wrap">
        <div className="match-col">
          {leftItems.map((it) => {
            let cls = 'match-btn';
            if (matched.has('L' + it.pairIdx)) cls += ' matched';
            else if (selLeft === it.pairIdx) cls += ' selected';
            if (wrongFlash && wrongFlash.left === it.pairIdx) cls += ' wrong-flash';
            return (
              <button key={it.pairIdx} className={cls} onClick={() => pick('L', it.pairIdx)}>
                {it.text}
              </button>
            );
          })}
        </div>
        <div className="match-col">
          {rightItems.map((it, i) => {
            let cls = 'match-btn';
            if (matched.has('R' + it.pairIdx)) cls += ' matched';
            else if (selRight === it.pairIdx) cls += ' selected';
            if (wrongFlash && wrongFlash.right === it.pairIdx) cls += ' wrong-flash';
            return (
              <button key={i} className={cls} onClick={() => pick('R', it.pairIdx)}>
                {it.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Essay({ q, onAnswer }) {
  const [attempt, setAttempt] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [graded, setGraded] = useState(false);

  function grade(correct) {
    if (graded) return;
    setGraded(true);
    onAnswer(correct, correct ? null : 'No worries — re-reading the model answer is how it sticks.');
  }

  return (
    <div>
      <div className="answer-row">
        <textarea
          rows={3}
          placeholder="Type your own answer first, then reveal the model answer…"
          value={attempt}
          onChange={(e) => setAttempt(e.target.value)}
          disabled={revealed}
        />
      </div>
      {!revealed && (
        <button className="reveal-btn" onClick={() => setRevealed(true)}>
          Reveal Model Answer 👀
        </button>
      )}
      {revealed && (
        <>
          <div className="essay-box">
            <b>Model answer</b>
            {q.model}
          </div>
          {!graded && (
            <div className="self-grade">
              <button className="yes" onClick={() => grade(true)}>✅ I got it right</button>
              <button className="no" onClick={() => grade(false)}>❌ I missed it</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
