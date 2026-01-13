import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaForward, FaClock, FaBullseye, FaRegLightbulb, FaExclamationTriangle, FaChartLine, FaRedo } from 'react-icons/fa';
import VisualKeyboard from '../VisualKeyboard';
import HandGuide from '../HandGuide';
import ResultPage from '../ResultPage';
import DrillSidebar from '../DrillSidebar';

const shakeStyle = `
  @keyframes shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-5px); }
    100% { transform: translateX(0); }
  }
  .shake-anim { animation: shake 0.3s ease-in-out; border: 2px solid #e53935 !important; background: #ffebee !important; }
`;

// Ensure the line always ends with a space so the space key is practiced consistently.
const getLineWithSpace = (line) => {
  const safe = (line ?? '').toString();
  if (!safe) return ' ';
  return safe.endsWith(' ') ? safe : `${safe} `;
};

const KeyDrill = ({ learningSteps = [], generateDrillLine, onComplete, onBack, minWpm = 10 }) => {
  const [phase, setPhase] = useState(learningSteps.length > 0 ? 'learning' : 'settings'); 
  const [learnIndex, setLearnIndex] = useState(0);
  
  // Settings
  const [selectedTime, setSelectedTime] = useState(5);
  const [accuracyGoal, setAccuracyGoal] = useState(96);
  
  // Drill State
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [input, setInput] = useState('');
  const [currentLine, setCurrentLine] = useState('');
  const [linesCompleted, setLinesCompleted] = useState(0);
  const [targetKeystrokes, setTargetKeystrokes] = useState(0);
  const [pressedKey, setPressedKey] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [shake, setShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [stats, setStats] = useState({ mistakes: 0, totalTyped: 0 });
  const [keyStats, setKeyStats] = useState({});
  const [errorIndices, setErrorIndices] = useState(new Set());

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Keep focus on the hidden input during the drill so typing always works.
  useEffect(() => {
    if (phase !== 'drill') return;
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50);
    return () => clearTimeout(t);
  }, [phase]);

  // Capture keydown globally (helps when the hidden input temporarily loses focus).
  useEffect(() => {
    if (phase !== 'drill') return;

    const onKeyDown = (e) => {
      if (e.metaKey || e.altKey || e.ctrlKey) return;
      // Ensure the hidden input keeps receiving characters.
      inputRef.current?.focus({ preventScroll: true });

      // Track pressed key to keep keyboard/finger UI responsive.
      const k = e.key;
      if (k && k.length === 1) {
        setPressedKey(k.toLowerCase());
        setTimeout(() => setPressedKey(null), 180);
      } else if (k === ' ') {
        setPressedKey(' ');
        setTimeout(() => setPressedKey(null), 180);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase]);

  // --- TIMER ---
  useEffect(() => {
    if (phase !== 'drill') {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    if (timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setPhase('result');
      return;
    }

    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [phase, isPaused, timeLeft]);

  // --- LEARNING INPUT ---
  const handleLearningInput = (e) => {
    const step = learningSteps[learnIndex];
    const val = e.target.value;
    const char = val.slice(-1)?.toLowerCase();
    const targetChar = (step?.char ?? '').toString().toLowerCase();

    if (!targetChar) {
      e.target.value = '';
      return;
    }

    setPressedKey(char);

    if (char === targetChar) {
      setIsCorrect(true);
      setShake(false);
      setErrorMsg('');
      setFeedbackMsg(step?.tip || 'ভালো! পরের ধাপে যান।');

      if (learnIndex + 1 < learningSteps.length) {
        setTimeout(() => {
          setLearnIndex((i) => i + 1);
          setPressedKey(null);
          setIsCorrect(null);
        }, 250);
      } else {
        setTimeout(() => {
          setPhase('settings');
          setPressedKey(null);
          setIsCorrect(null);
        }, 350);
      }
    } else {
      setIsCorrect(false);
      setShake(true);
      const pressedDisplay = char === ' ' ? 'Space' : (char ? char.toUpperCase() : '');
      const targetDisplay = targetChar === ' ' ? 'Space' : targetChar.toUpperCase();
      setErrorMsg(`ভুল! আপনি চেপেছেন '${pressedDisplay}', কিন্তু চাপতে হবে '${targetDisplay}'`);
      if (window.navigator?.vibrate) window.navigator.vibrate(80);
      setTimeout(() => setShake(false), 250);
    }

    e.target.value = '';
    setTimeout(() => setPressedKey(null), 180);
  };

  // --- START DRILL ---
  const startDrill = () => {
    const seconds = Math.max(1, Number(selectedTime || 1) * 60);

    setTimeLeft(seconds);
    setTimeElapsed(0);
    setIsPaused(false);
    setStats({ mistakes: 0, totalTyped: 0 });
    setKeyStats({});
    setErrorMsg('');
    setFeedbackMsg('');
    setPressedKey(null);
    setIsCorrect(null);
    setShake(false);
    setLinesCompleted(0);

    const firstLine = typeof generateDrillLine === 'function' ? generateDrillLine(0) : '';
    const line = getLineWithSpace(firstLine);
    setCurrentLine(line);
    setInput('');
    setErrorIndices(new Set());

    // Reasonable default so the progress bar moves even if generateDrillLine is dynamic.
    setTargetKeystrokes(Math.max(60, seconds * 5));

    setPhase('drill');
    lastActivityRef.current = Date.now();

    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50);
  };

  // --- DRILL INPUT ---
  const handleDrillInput = (e) => {
    // পজ থাকলে রিজুম হবে
    if (isPaused) {
      setIsPaused(false);
      lastActivityRef.current = Date.now();
      e.target.value = "";
      return; 
    }
    lastActivityRef.current = Date.now();

    const val = e.target.value;
    const char = val.slice(-1).toLowerCase();
    const targetChar = currentLine[input.length]?.toLowerCase();

    if (!targetChar) return;

    setPressedKey(char);

    // Key Stats
    setKeyStats(prev => {
      const key = targetChar;
      const current = prev[key] || { total: 0, errors: 0 };
      return {
        ...prev,
        [key]: { 
          total: current.total + (char === targetChar ? 1 : 0),
          errors: current.errors + (char !== targetChar ? 1 : 0)
        }
      };
    });

    if (char === targetChar) {
      setInput(prev => prev + char);
      setIsCorrect(true);
      setShake(false);
      setErrorMsg("");
      setStats(s => ({ ...s, totalTyped: s.totalTyped + 1 }));

      if (stats.totalTyped + 1 >= targetKeystrokes) {
        setPhase('result');
      }

      if (input.length + 1 >= currentLine.length) {
        const newCount = linesCompleted + 1;
        setLinesCompleted(newCount);
        if (typeof generateDrillLine === 'function') {
          setCurrentLine(getLineWithSpace(generateDrillLine(newCount)));
        }
        setInput('');
        setPressedKey(null);
        setErrorIndices(new Set());
      }
    } else {
      setIsCorrect(false);
      setShake(true);
      setStats(s => ({ ...s, mistakes: s.mistakes + 1 }));
      setErrorIndices(prev => new Set(prev).add(input.length));
      
      const pressedDisplay = char === ' ' ? 'Space' : char.toUpperCase();
      const targetDisplay = targetChar === ' ' ? 'Space' : targetChar.toUpperCase();
      setErrorMsg(`ভুল! আপনি চেপেছেন '${pressedDisplay}', কিন্তু চাপতে হবে '${targetDisplay}'`);
      
      if (window.navigator?.vibrate) window.navigator.vibrate(100);
      setTimeout(() => setShake(false), 300);
    }
    
    e.target.value = "";
    setTimeout(() => setPressedKey(null), 200);
  };

  // Stats
  const timeElapsedMin = (timeElapsed / 60) || 1;
  const currentWpm = Math.round((stats.totalTyped / 5) / timeElapsedMin);
  const currentAcc = stats.totalTyped > 0 ? Math.round(((stats.totalTyped - stats.mistakes) / stats.totalTyped) * 100) : 100;
  const progressPercent = Math.min((stats.totalTyped / targetKeystrokes) * 100, 100);

  // --- RENDER TEXT HELPER ---
  const renderDrillText = () => {
    if (!currentLine) return null;
    const line = getLineWithSpace(currentLine);
    const totalChars = line.length;
    const rowLen = Math.ceil(totalChars / 2);

    const row1 = line.slice(0, rowLen);
    const row2 = line.slice(rowLen);
    const colCount = Math.max(row1.length, row2.length);

    const renderChar = (ch, globalIndex, localIndex) => {
      if (ch === undefined) return null;

      let statusClass = 'pending';
      if (globalIndex < input.length) {
        statusClass = errorIndices.has(globalIndex) ? 'fixed-error' : 'correct';
      } else if (globalIndex === input.length) {
        statusClass = shake ? 'wrong' : 'active';
      }

      const displayChar = ch === ' ' ? '␣' : ch;

      return (
        <div
          key={localIndex}
          className={statusClass === 'wrong' ? 'shake-anim' : ''}
          style={{
            ...styles.keyCap,
            ...(statusClass === 'correct' ? styles.keyCorrect : {}),
            ...(statusClass === 'wrong' ? styles.keyWrong : {}),
            ...(statusClass === 'fixed-error' ? styles.keyFixedError : {}),
            ...(statusClass === 'active' ? styles.keyActive : {}),
            width: '44px',
            height: '52px',
            fontSize: '22px',
            borderRadius: '8px',
            boxShadow: '0 3px 0 #bdbdbd'
          }}
        >
          {displayChar}
        </div>
      );
    };

    const renderRow = (rowText, startIndex) => {
      const padded = rowText.padEnd(colCount, ' ');

      // Visual grouping based on REAL spaces: each sequence stays in its own group,
      // and the trailing space belongs to that same group (so a group never starts with ␣).
      const groups = [];
      let i = 0;
      while (i < colCount) {
        // Skip leading spaces without starting a new group.
        while (i < colCount && padded[i] === ' ') i++;
        if (i >= colCount) break;

        const start = i;
        // Consume non-space token.
        while (i < colCount && padded[i] !== ' ') i++;
        // Include the trailing space (if any) with the token.
        if (i < colCount && padded[i] === ' ') i++;

        groups.push({ start, end: i });
      }

      return (
        <div style={styles.kdRowGroups}>
          {groups.map((g, gi) => (
            <div key={gi} style={styles.kdGroup}>
              {Array.from({ length: g.end - g.start }).map((_, offset) => {
                const localIndex = g.start + offset;
                return renderChar(padded[localIndex], startIndex + localIndex, localIndex);
              })}
            </div>
          ))}
        </div>
      );
    };

    return (
      <div style={styles.kdTextGrid}>
        {renderRow(row1, 0)}
        {renderRow(row2, rowLen)}
      </div>
    );
  };

  // --- RENDERERS ---

  if (phase === 'learning') {
    const step = learningSteps[learnIndex];
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={onBack} style={styles.backBtn}><FaArrowLeft /> ফিরে যান</button>
          <div style={styles.feedbackBox}><FaRegLightbulb color="#fbc02d" /> {feedbackMsg}</div>
          <div>ধাপ {learnIndex + 1}/{learningSteps.length}</div>
        </div>
        <div style={styles.learningCard}>
          {errorMsg && <div style={styles.errorBox}><FaExclamationTriangle /> {errorMsg}</div>}
          <div style={{marginBottom: '10px'}}>
             <h3 style={{color: '#1565c0', margin: '0'}}>নিচের অক্ষরটি টাইপ করুন</h3>
          </div>
          <div className={shake ? "shake-anim" : ""} style={{...styles.bigDisplayBox, fontSize: step.char === ' ' ? '30px' : '80px', width: step.char === ' ' ? 'auto' : '100px', padding: step.char === ' ' ? '0 30px' : '0'}}>
             {step.char === ' ' ? 'Space' : step.char.toUpperCase()}
          </div>
          <div style={{margin: '10px 0', overflow: 'hidden'}}>
             <VisualKeyboard activeKey={step.char} pressedKey={pressedKey} isCorrect={isCorrect} />
          </div>
          <div style={{display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '10px', flexWrap: 'wrap'}}>
             <HandGuide hand="left" activeFinger={step.hand === 'left' ? step.finger : null} targetKey={step.char} />
             <HandGuide hand="right" activeFinger={step.hand === 'right' ? step.finger : null} targetKey={step.char} />
          </div>
          <input ref={inputRef} type="text" onChange={handleLearningInput} style={styles.hiddenInput} autoFocus />
        </div>
      </div>
    );
  }

  if (phase === 'settings') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={onBack} style={styles.backBtn}><FaArrowLeft /> ফিরে যান</button>
          <div style={styles.feedbackBox}><FaRegLightbulb color="#fbc02d" /> {feedbackMsg || 'আপনার ড্রিল সেটিংস ঠিক করুন'}</div>
        </div>

        <div style={styles.settingsCard}>
          <h2 style={{color: '#1565c0', borderBottom: '2px solid #eee', paddingBottom: '10px'}}>ড্রিল সেটিংস</h2>

          <div style={styles.settingRow}>
            <div style={styles.settingBox}>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
                <FaClock size={24} color="#1565c0"/> <label style={{fontWeight: 'bold'}}>সময় (Duration)</label>
              </div>
              <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                {[2, 5, 10].map(m => (
                  <button key={m} onClick={() => setSelectedTime(m)} style={selectedTime === m ? styles.activeOption : styles.optionBtn}>{m} min</button>
                ))}
              </div>
            </div>

            <div style={styles.settingBox}>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
                <FaBullseye size={24} color="#e65100"/> <label style={{fontWeight: 'bold'}}>লক্ষ্য (Accuracy)</label>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <button onClick={() => setAccuracyGoal(90)} style={accuracyGoal === 90 ? styles.activeOption : styles.optionBtn}>90% (Beginner)</button>
                <button onClick={() => setAccuracyGoal(96)} style={accuracyGoal === 96 ? styles.activeOption : styles.optionBtn}>96% (Intermediate)</button>
                <button onClick={() => setAccuracyGoal(99)} style={accuracyGoal === 99 ? styles.activeOption : styles.optionBtn}>99% (Advanced)</button>
              </div>
            </div>
          </div>

          <div style={{textAlign: 'center', marginTop: '16px'}}>
            <button onClick={() => startDrill(false)} style={styles.btnPrimaryBig}>ড্রিল শুরু করুন <FaForward /></button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'drill' || phase === 'review') {
    const nextChar = currentLine?.[input.length] || '';
    const currentStep = learningSteps.find(s => s.char === nextChar) || { hand: null, finger: null };

    const total = targetKeystrokes || 1;
    const current = stats.totalTyped || 0;
    const timeValue = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`;

    return (
      <div style={styles.tmShell}>
        <div style={styles.tmPage}>
          <div style={styles.tmBody}>
            <div style={styles.tmMain}>
              <div style={styles.tmHintRow}>
                <span style={styles.tmHintDot} />
                <span style={styles.tmHintText}>Type the key sequences, follow the highlighted key</span>
              </div>

              <div
                style={{ ...styles.tmDrillBox, opacity: isPaused ? 0.6 : 1 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  inputRef.current?.focus({ preventScroll: true });
                }}
              >
                {renderDrillText()}
              </div>

              <div style={styles.tmMsgRow}>
                {errorMsg ? (
                  <span style={styles.tmErrorPill}>
                    <FaExclamationTriangle style={{ marginRight: '6px' }} /> {errorMsg}
                  </span>
                ) : (
                  <span style={styles.tmNextPill}>
                    Next: {nextChar === ' ' ? 'Space' : (nextChar ? nextChar.toUpperCase() : '-')}
                  </span>
                )}
              </div>

              <div style={styles.tmHelpNote}>Look at the on-screen keyboard and hands for hints, when needed</div>

              <div style={styles.tmKeyboardWrap}>
                <VisualKeyboard activeKey={nextChar} pressedKey={pressedKey} isCorrect={isCorrect} />
              </div>

              <div style={styles.tmHandsWrap}>
                <div style={styles.tmHandScale}>
                  <HandGuide hand="left" activeFinger={currentStep.hand === 'left' ? currentStep.finger : null} targetKey={nextChar} />
                </div>
                <div style={styles.tmHandScale}>
                  <HandGuide hand="right" activeFinger={currentStep.hand === 'right' ? currentStep.finger : null} targetKey={nextChar} />
                </div>
              </div>
            </div>

            <div style={styles.tmSidebarWrap}>
              <DrillSidebar
                title="Your Progress"
                module="1.2"
                drillName="কি ড্রিল"
                progress={{ current, total }}
                time={{ value: timeValue }}
                paused={isPaused}
                wpm={isNaN(currentWpm) ? 0 : currentWpm}
                accuracy={currentAcc}
                actions={{
                  primary: { label: 'Finish', onClick: () => setPhase('result') },
                  secondary: { label: isPaused ? 'Resume' : 'Pause', onClick: () => setIsPaused(p => !p) }
                }}
              />
            </div>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleDrillInput}
            style={styles.hiddenInput}
            autoFocus
          />
        </div>
      </div>
    );
  }

  // --- 4. RESULT VIEW ---
  if (phase === 'result') {
    return (
      <ResultPage
        stats={stats}
        keyStats={keyStats}
        timeElapsed={timeElapsed}
        drillTime={selectedTime}
        goals={{ wpm: minWpm, accuracy: accuracyGoal }}
        onNext={(result) => onComplete(result)}
        onRetry={() => setPhase('settings')}
        onReview={(problemKeys) => {
          console.log('Problem keys:', problemKeys);
          setPhase('settings');
        }}
      />
    );
  }
  return <div>Loading...</div>;
};

const styles = {
  // TypingMaster Pro inspired drill layout
  tmShell: {
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    position: 'fixed',
    top: 0,
    left: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'stretch',
    padding: 0,
    fontFamily: "'Hind Siliguri', 'Segoe UI', sans-serif"
  },
  tmPage: {
    width: '100%',
    height: '100%',
    background: 'rgba(255,255,255,0.92)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  tmCard: {
    width: 'min(1080px, calc(100vw - 48px))',
    height: 'min(720px, calc(100vh - 48px))',
    background: 'rgba(255,255,255,0.92)',
    borderRadius: '14px',
    boxShadow: '0 22px 70px rgba(0,0,0,0.22)',
    border: '1px solid rgba(255,255,255,0.6)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  tmCardHeader: {
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'linear-gradient(180deg, rgba(248,250,252,0.95), rgba(248,250,252,0.6))',
    borderBottom: '1px solid rgba(0,0,0,0.06)'
  },
  tmBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  tmLogo: {
    width: '34px',
    height: '34px',
    borderRadius: '999px',
    background: 'radial-gradient(circle at 30% 30%, #42a5f5, #0d47a1)',
    color: 'white',
    fontWeight: 900,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    letterSpacing: '0.5px'
  },
  tmBrandText: {
    fontSize: '22px',
    fontWeight: 900,
    color: '#1565c0',
    fontStyle: 'italic'
  },
  tmCloseBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: 'rgba(21,101,192,0.10)',
    color: '#1565c0',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 900,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tmBody: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    gap: '12px',
    padding: '12px 12px 10px',
    overflow: 'hidden'
  },
  tmSidebarWrap: {
    flex: '0 0 300px',
    width: '300px',
    maxWidth: '32vw',
    alignSelf: 'stretch',
    overflow: 'hidden'
  },
  tmMain: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflow: 'hidden'
  },
  tmHintRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: '#4b5563',
    fontSize: '13px'
  },
  tmHintDot: {
    width: '18px',
    height: '18px',
    borderRadius: '999px',
    background: 'rgba(21,101,192,0.12)',
    border: '1px solid rgba(21,101,192,0.25)'
  },
  tmHintText: {
    fontWeight: 700
  },
  tmPausedBanner: {
    alignSelf: 'center',
    marginTop: '6px',
    padding: '6px 12px',
    borderRadius: '999px',
    background: 'rgba(17, 24, 39, 0.08)',
    border: '1px solid rgba(17, 24, 39, 0.12)',
    color: '#111827',
    fontWeight: 900,
    fontSize: '12px',
    letterSpacing: '0.3px',
    textTransform: 'uppercase'
  },
  tmDrillBox: {
    background: '#f7fbff',
    borderRadius: '10px',
    border: '1px solid rgba(13,71,161,0.12)',
    padding: '22px 16px',
    minHeight: '160px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tmMsgRow: {
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tmErrorPill: {
    color: '#c62828',
    fontWeight: 800,
    background: '#ffebee',
    padding: '5px 14px',
    borderRadius: '999px',
    border: '1px solid #ffcdd2',
    fontSize: '13px'
  },
  tmNextPill: {
    color: '#1565c0',
    fontWeight: 900,
    background: 'rgba(21,101,192,0.08)',
    padding: '5px 14px',
    borderRadius: '999px',
    border: '1px solid rgba(21,101,192,0.18)',
    fontSize: '13px'
  },
  tmHelpNote: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '12px'
  },
  tmKeyboardWrap: {
    display: 'flex',
    justifyContent: 'center',
    overflow: 'visible',
    paddingTop: '10px',
    paddingBottom: '8px'
  },
  tmHandsWrap: {
    display: 'flex',
    gap: '14px',
    justifyContent: 'center',
    marginTop: '4px',
    flexWrap: 'wrap',
    paddingTop: '6px',
    paddingBottom: '10px'
  },
  tmHandScale: {
    transform: 'scale(0.88)',
    transformOrigin: 'top center'
  },
  kdTextGrid: {
    width: '100%',
    maxWidth: '850px',
    display: 'grid',
    gridTemplateRows: 'repeat(2, auto)',
    gap: '22px',
    justifyItems: 'center'
  },
  kdRowGroups: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '18px'
  },
  kdGroup: {
    display: 'flex',
    gap: '10px',
    padding: '6px 8px',
    borderRadius: '12px',
    background: 'rgba(13,71,161,0.05)',
    border: '1px solid rgba(13,71,161,0.10)'
  },

  container: { 
    maxWidth: '1000px', 
    width: '100%',
    height: '100vh',
    margin: '0 auto', 
    padding: '10px',
    fontFamily: "'Hind Siliguri', 'Segoe UI', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  drillContainer: {
    maxWidth: '1000px',
    width: '100%',
    height: '100vh',
    margin: '0 auto',
    padding: '10px',
    fontFamily: "'Hind Siliguri', 'Segoe UI', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  drillContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingBottom: '10px'
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '10px',
    flexShrink: 0
  },
  backBtn: { 
    background: 'transparent', 
    border: '1px solid #ccc', 
    padding: '8px 15px', 
    borderRadius: '5px', 
    cursor: 'pointer' 
  },
  settingsCard: { 
    background: 'white', 
    padding: '30px', 
    borderRadius: '15px', 
    textAlign: 'center', 
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    maxHeight: 'calc(100vh - 100px)',
    overflowY: 'auto'
  },
  settingRow: { 
    display: 'flex', 
    justifyContent: 'center', 
    gap: '20px', 
    margin: '20px 0', 
    flexWrap: 'wrap' 
  },
  settingBox: { 
    border: '1px solid #eee', 
    padding: '15px', 
    borderRadius: '10px', 
    width: '220px', 
    background: '#f9f9f9', 
    textAlign: 'left', 
    minWidth: '180px' 
  },
  optionBtn: { 
    width: '100%', 
    padding: '8px', 
    margin: '2px 0', 
    border: '1px solid #ccc', 
    background: 'white', 
    cursor: 'pointer', 
    borderRadius: '4px' 
  },
  activeOption: { 
    width: '100%', 
    padding: '8px', 
    margin: '2px 0', 
    border: '1px solid #1565c0', 
    background: '#e3f2fd', 
    color: '#1565c0', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    borderRadius: '4px' 
  },
  statsHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    background: '#fff', 
    padding: '8px 12px', 
    borderRadius: '8px', 
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)', 
    flexWrap: 'wrap',
    gap: '8px'
  },
  statItem: { display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', fontSize: '14px', color: '#444' },
  exitBtn: { background: '#ffebee', border: '1px solid #ef5350', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', color: '#c62828', fontWeight: 'bold', fontSize: '12px' },
  drillBox: { 
    background: 'white', 
    padding: '15px 10px', 
    borderRadius: '10px', 
    minHeight: '80px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    border: '1px solid #ddd', 
    position: 'relative',
    flexShrink: 0
  },
  keyboardSection: {
    marginTop: '5px',
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  handsSection: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginTop: '8px',
    flexShrink: 0,
    flexWrap: 'wrap'
  },
  hiddenInput: {
    opacity: 0,
    position: 'fixed',
    top: '-100px',
    left: '-100px',
    width: '1px',
    height: '1px',
    pointerEvents: 'none'
  },
  keyCap: { height: '45px', width: '40px', border: '1px solid #ccc', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', boxShadow: '0 3px 0 #bbb', background: '#fff', color: '#333' },
  keyCorrect: { background: '#e8f5e9', border: '1px solid #2ecc71', color: '#2ecc71', boxShadow: 'inset 0 0 5px #2ecc71' },
  keyWrong: { background: '#ffebee', border: '1px solid #e53935', color: '#e53935' },
  keyActive: { border: '2px solid #1e88e5', transform: 'translateY(2px)', boxShadow: 'none', background: '#e3f2fd' },
  keyFixedError: { background: '#fff', border: '1px solid #e53935', color: '#e53935', textDecoration: 'line-through' },
  learningCard: { textAlign: 'center', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' },
  bigDisplayBox: { fontWeight: 'bold', color: '#1565c0', border: '3px solid #1e88e5', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', height: '100px', borderRadius: '10px', background: '#e3f2fd', marginBottom: '10px' },
  feedbackBox: { background: '#fff9c4', color: '#f57f17', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', fontSize: '14px' },
  errorBox: { background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '5px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', fontWeight: 'bold' },
  resultCard: { textAlign: 'center', background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', maxWidth: '800px', margin: '0 auto' },
  finalStats: { display: 'flex', justifyContent: 'center', gap: '50px', margin: '20px 0', flexWrap: 'wrap' },
  statBox: { textAlign: 'center', border: '1px solid #eee', padding: '15px', borderRadius: '10px', width: '150px', minWidth: '120px' },
  chartContainer: { margin: '20px 0', border: '1px solid #eee', padding: '15px', borderRadius: '10px', background: '#fafafa' },
  chartGrid: { display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center' },
  chartItem: { width: '30px', height: '30px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(0,0,0,0.1)' },
  legend: { display: 'flex', gap: '15px', justifyContent: 'center', fontSize: '12px', marginTop: '10px', fontWeight: 'bold', flexWrap: 'wrap' },
  btnPrimaryBig: { padding: '12px 30px', background: '#1e88e5', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '18px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' },
  btnSecondary: { padding: '10px 20px', background: '#fff', color: '#555', border: '1px solid #ccc', borderRadius: '50px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }
};

export default KeyDrill;