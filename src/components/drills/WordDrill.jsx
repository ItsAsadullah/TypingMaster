import React, { useState, useEffect, useRef } from 'react';
import ResultPage from '../ResultPage';
import DrillSidebar from '../DrillSidebar';
import VisualKeyboard from '../VisualKeyboard';
import HandGuide from '../HandGuide';

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

// Simple icon components
const ArrowLeft = () => <span>←</span>;
const Forward = () => <span>→</span>;
const Clock = () => <span>⏱️</span>;
const Target = () => <span>🎯</span>;
const Warning = () => <span>⚠️</span>;
const Chart = () => <span>📊</span>;

const WordDrill = ({
  generateDrillLine,
  onComplete,
  onBack,
  minWpm = 10,
  module,
  drillName = 'Word Drill'
}) => {
  const [phase, setPhase] = useState('settings');
  
  // Settings
  const [selectedTime, setSelectedTime] = useState(5);
  const [accuracyGoal, setAccuracyGoal] = useState(96);
  
  // Drill State
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLine, setCurrentLine] = useState("");
  const [linesCompleted, setLinesCompleted] = useState(0);
  
  const [input, setInput] = useState('');
  const [stats, setStats] = useState({ mistakes: 0, totalTyped: 0 });
  const [keyStats, setKeyStats] = useState({});
  
  const [isCorrect, setIsCorrect] = useState(true);
  const [shake, setShake] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("শুরু করা যাক!");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorIndices, setErrorIndices] = useState(new Set());
  const [currentWpm, setCurrentWpm] = useState(0);
  const [wrongKey, setWrongKey] = useState(null);
  
  const [pressedKey, setPressedKey] = useState(null);

  const inputRef = useRef(null);
  const textDisplayRef = useRef(null);
  const timerRef = useRef(null);

  const getFingerForKey = (key) => {
    const upperKey = (key ?? '').toString().toUpperCase();

    const leftHand = {
      'A': 'left-pinky', 'Q': 'left-pinky', 'Z': 'left-pinky', '1': 'left-pinky',
      'S': 'left-ring', 'W': 'left-ring', 'X': 'left-ring', '2': 'left-ring',
      'D': 'left-middle', 'E': 'left-middle', 'C': 'left-middle', '3': 'left-middle',
      'F': 'left-index', 'R': 'left-index', 'T': 'left-index', 'G': 'left-index',
      'V': 'left-index', 'B': 'left-index', '4': 'left-index', '5': 'left-index'
    };
    const rightHand = {
      'J': 'right-index', 'U': 'right-index', 'Y': 'right-index', 'H': 'right-index',
      'N': 'right-index', 'M': 'right-index', '6': 'right-index', '7': 'right-index',
      'K': 'right-middle', 'I': 'right-middle', ',': 'right-middle', '8': 'right-middle',
      'L': 'right-ring', 'O': 'right-ring', '.': 'right-ring', '9': 'right-ring',
      ';': 'right-pinky', 'P': 'right-pinky', '/': 'right-pinky', '0': 'right-pinky',
      "'": 'right-pinky', '-': 'right-pinky', '[': 'right-pinky', ']': 'right-pinky'
    };

    if (upperKey === ' ') return 'thumb';
    if (upperKey === 'ENTER') return 'right-pinky';
    if (upperKey === 'BACKSPACE') return 'right-pinky';
    if (upperKey === 'TAB') return 'left-pinky';

    return leftHand[upperKey] || rightHand[upperKey] || null;
  };

  const progressPct = (() => {
    const total = Math.max(1, selectedTime * 60);
    const elapsed = Math.min(total, timeElapsed);
    return Math.round((elapsed / total) * 100);
  })();

  const getLineWithSpace = (line) => {
    return line.endsWith(' ') ? line : line + ' ';
  };

  // Find which word the current cursor is in
  const getCurrentWordBounds = (line, cursorPos) => {
    let wordStart = 0;
    let wordEnd = 0;
    let i = 0;
    
    while (i < line.length) {
      // Skip leading spaces
      while (i < line.length && line[i] === ' ') i++;
      if (i >= line.length) break;
      
      wordStart = i;
      // Find word end
      while (i < line.length && line[i] !== ' ') i++;
      wordEnd = i;
      // Include trailing space
      if (i < line.length && line[i] === ' ') i++;
      
      // Check if cursor is within this word (including its trailing space)
      if (cursorPos >= wordStart && cursorPos < i) {
        return { start: wordStart, end: i };
      }
    }
    return { start: 0, end: line.length };
  };

  const renderWordGroups = () => {
    if (!currentLine) return null;
    const line = getLineWithSpace(currentLine);
    const cursorPos = input.length;
    const currentWordBounds = getCurrentWordBounds(line, cursorPos);

    return (
      <div style={styles.wordTextDisplay}>
        {line.split('').map((ch, idx) => {
          const isTyped = idx < input.length;
          const isCursor = idx === input.length;
          const isErr = errorIndices.has(idx);
          const isInCurrentWord = idx >= currentWordBounds.start && idx < currentWordBounds.end;

          // Base styles
          let color = '#6b7280'; // gray for untyped
          let fontWeight = 400;
          let textDecoration = 'none';
          let background = 'transparent';
          let borderBottom = 'none';

          if (isTyped) {
            if (isErr) {
              color = '#dc2626'; // red for error
              background = '#fef2f2';
              textDecoration = 'line-through';
            } else {
              color = '#16a34a'; // green for correct
            }
          } else if (isInCurrentWord) {
            // Highlight current word
            color = '#1e40af'; // dark blue
            fontWeight = 600;
            
            if (isCursor) {
              // Bold underline for current letter
              borderBottom = '3px solid #1e40af';
              background = 'rgba(30, 64, 175, 0.08)';
            }
          }

          return (
            <span
              key={idx}
              style={{
                color,
                fontWeight,
                textDecoration,
                background,
                borderBottom,
                padding: '2px 1px',
                fontSize: '26px',
                lineHeight: '1.8',
                letterSpacing: ch === ' ' ? '0' : '0.5px',
                display: 'inline',
              }}
            >
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          );
        })}
      </div>
    );
  };

  const loadNewLine = () => {
    const newLine = generateDrillLine ? generateDrillLine() : "Type something here";
    setCurrentLine(getLineWithSpace(newLine));
    setInput('');
    setErrorIndices(new Set());
    setIsCorrect(true);
    setErrorMsg("");
  };

  useEffect(() => {
    if (phase === 'drill' && currentLine === "") {
      loadNewLine();
    }
  }, [phase]);

  // Timer - runs independently once drill starts
  useEffect(() => {
    if (phase !== 'drill' || isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Start the timer interval
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setPhase('result');
          return 0;
        }
        return prev - 1;
      });
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase, isPaused]);

  // Real-time WPM
  useEffect(() => {
    if (phase !== 'drill') return;
    const elapsedMinutes = timeElapsed / 60;
    if (elapsedMinutes > 0 && stats.totalTyped > 0) {
      const charsTyped = stats.totalTyped;
      const wpm = Math.round((charsTyped / 5) / elapsedMinutes);
      setCurrentWpm(wpm);
    } else {
      setCurrentWpm(0);
    }
  }, [phase, timeElapsed, stats.totalTyped]);

  // Auto focus
  useEffect(() => {
    if (phase === 'drill') {
      const focusInterval = setInterval(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
      return () => clearInterval(focusInterval);
    }
  }, [phase]);

  // No scrolling needed in fixed layout; keep view stable.

  // Prevent scrolling + Highlight keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent default scrolling
      const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'];
      if (scrollKeys.includes(e.key)) e.preventDefault();
      
      // Block Enter key
      if (e.key === 'Enter') {
        e.preventDefault();
        return;
      }
      
      // Highlight pressed key
      if (phase === 'drill') {
        let keyToHighlight = e.key;
        if (e.key === ' ') keyToHighlight = 'Space';
        else if (e.key === 'Backspace') keyToHighlight = 'Backspace';
        else if (e.key === 'Enter') keyToHighlight = 'Enter';
        else if (e.key === 'Tab') keyToHighlight = 'Tab';
        else if (e.key === 'CapsLock') keyToHighlight = 'CapsLock';
        else if (e.key === 'Shift') keyToHighlight = 'Shift';
        else if (e.key === 'Control') keyToHighlight = 'Ctrl';
        else if (e.key === 'Alt') keyToHighlight = 'Alt';
        else if (e.key === 'Meta') keyToHighlight = 'Win';
        else keyToHighlight = e.key.toUpperCase();

        setPressedKey(keyToHighlight);
      }
    };
    
    const handleKeyUp = () => {
      setTimeout(() => setPressedKey(null), 100);
    };

    const preventWheel = (e) => {
      if (phase === 'drill') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('wheel', preventWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('wheel', preventWheel);
    };
  }, [phase]);

  const handleInputChange = (e) => {
    const typed = e.target.value;
    
    // Block backspace - no deleting
    if (typed.length < input.length) {
      e.preventDefault();
      return;
    }
    
    const expected = currentLine.substring(0, typed.length);

    setStats(prev => ({ ...prev, totalTyped: prev.totalTyped + 1 }));

    // Track key stats
    if (typed.length > input.length) {
      const expectedChar = currentLine[typed.length - 1];
      const key = expectedChar === ' ' ? 'Space' : (expectedChar ? expectedChar.toUpperCase() : '');
      setKeyStats(prev => ({
        ...prev,
        [key]: {
          total: (prev[key]?.total || 0) + 1,
          errors: prev[key]?.errors || 0
        }
      }));
    }

    if (typed === expected) {
      setInput(typed);
      setIsCorrect(true);
      setErrorMsg("");
      setErrorIndices(new Set());
      setWrongKey(null);
      
      // Encouragement messages
      if (Math.random() < 0.1) {
        const encouragements = [
          "✨ চমৎকার! চালিয়ে যান!",
          "🎯 পারফেক্ট! ভালো করছেন!",
          "💪 দুর্দান্ত! গতি বজায় রাখুন!",
          "🌟 শাবাশ! এভাবেই চলতে থাকুন!"
        ];
        setFeedbackMsg(encouragements[Math.floor(Math.random() * encouragements.length)]);
      }

      // Line completed
      if (typed === currentLine) {
        setLinesCompleted(prev => prev + 1);
        setWrongKey(null);
        setErrorIndices(new Set());
        loadNewLine();
      }
    } else {
      // Mistake
      setStats(prev => ({ ...prev, mistakes: prev.mistakes + 1 }));
      setIsCorrect(false);
      setShake(true);
      setTimeout(() => setShake(false), 300);

      const wrongChar = currentLine[typed.length - 1] || '';
  const typedChar = typed[typed.length - 1] || '';
      setErrorMsg(`ভুল! আপনি চেপেছেন "${typedChar}", কিন্তু সঠিক হল "${wrongChar}"`);
      
  setWrongKey(typedChar === ' ' ? 'Space' : (typedChar ? typedChar.toUpperCase() : null));
      
  const nextErrors = new Set(errorIndices);
  nextErrors.add(typed.length - 1);
  setErrorIndices(nextErrors);
      
      const errorTips = [
        `💡 টিপস: "${wrongChar}" চাপতে হবে। সঠিক আঙুল ব্যবহার করুন`,
        `🎯 মনোযোগ দিন! "${wrongChar}" কী এর অবস্থান মনে রাখুন`,
        `📍 "${wrongChar}" চাপুন। হোম রো থেকে সঠিক আঙুল ব্যবহার করুন`,
        `🔍 ধীরে টাইপ করুন। "${wrongChar}" এর জন্য সঠিক finger placement`,
        `✋ স্ক্রিনে দেখুন, কীবোর্ডে নয়। "${wrongChar}" চাপুন`
      ];
      setFeedbackMsg(errorTips[Math.floor(Math.random() * errorTips.length)]);

      const key = wrongChar === ' ' ? 'Space' : (wrongChar ? wrongChar.toUpperCase() : '');
      setKeyStats(prev => ({
        ...prev,
        [key]: {
          total: prev[key]?.total || 0,
          errors: (prev[key]?.errors || 0) + 1
        }
      }));
    }
  };

  const handleStartDrill = () => {
    setTimeLeft(Math.max(1, selectedTime * 60));
    setTimeElapsed(0);
    setStats({ mistakes: 0, totalTyped: 0 });
    setKeyStats({});
    setLinesCompleted(0);
    setInput('');
    setCurrentLine('');
    setIsPaused(false);
    loadNewLine();
    setPhase('drill');
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50);
  };

  const handlePause = () => setIsPaused((p) => !p);

  const handleSkip = () => {
    if (window.confirm('আপনি কি নিশ্চিত এই ড্রিল এড়িয়ে যেতে চান?')) {
      setPhase('result');
    }
  };

  const handleRestart = () => {
    setPhase('settings');
    setStats({ mistakes: 0, totalTyped: 0 });
    setKeyStats({});
    setLinesCompleted(0);
    setInput('');
    setCurrentLine('');
    setTimeElapsed(0);
    setTimeLeft(0);
    setIsPaused(false);
  };

  // Result calculations
  const currentAcc = stats.totalTyped > 0 ? Math.round(((stats.totalTyped - stats.mistakes) / stats.totalTyped) * 100) : 0;
  const accuracy = currentAcc;
  const totalMinutes = timeElapsed / 60;
  const finalWpm = totalMinutes > 0 ? Math.round(((stats.totalTyped - stats.mistakes) / 5) / totalMinutes) : 0;

  // Result Phase
  if (phase === 'result') {
    return (
      <ResultPage
        stats={stats}
        keyStats={keyStats}
        timeElapsed={timeElapsed}
        drillTime={selectedTime}
        goals={{ wpm: minWpm, accuracy: accuracyGoal }}
        onNext={(result) => onComplete({ ...result, passed: accuracy >= accuracyGoal })}
        onRetry={handleRestart}
        onReview={(problemKeys) => {
          console.log('Problem keys:', problemKeys);
          handleRestart();
        }}
      />
    );
  }

  return (
    <div style={styles.tmShell}>
      <style>{shakeStyle}</style>

      <div style={styles.tmPage}>
        <div style={styles.tmBody} className="tm-body">
          <div style={styles.tmMain}>
            {phase === 'settings' && (
              <div style={styles.tmSettingsWrap}>
                <button onClick={onBack} style={styles.tmBackBtn}>
                  <ArrowLeft /> ফিরে যান
                </button>

                <h2 style={styles.tmSettingsTitle}>ড্রিল সেটিংস</h2>

                <div style={styles.tmSettingGroup}>
                  <div style={styles.tmSettingLabelRow}>
                    <Clock /> <span style={{ fontWeight: 900 }}>সময় (Duration)</span>
                  </div>
                  <div style={styles.tmOptionRow}>
                    <button onClick={() => setSelectedTime(2)} style={selectedTime === 2 ? styles.tmActiveOption : styles.tmOptionBtn}>2 min</button>
                    <button onClick={() => setSelectedTime(5)} style={selectedTime === 5 ? styles.tmActiveOption : styles.tmOptionBtn}>5 min</button>
                    <button onClick={() => setSelectedTime(10)} style={selectedTime === 10 ? styles.tmActiveOption : styles.tmOptionBtn}>10 min</button>
                  </div>
                </div>

                <div style={styles.tmSettingGroup}>
                  <div style={styles.tmSettingLabelRow}>
                    <Target /> <span style={{ fontWeight: 900 }}>লক্ষ্য (Accuracy)</span>
                  </div>
                  <div style={styles.tmOptionRow}>
                    <button onClick={() => setAccuracyGoal(90)} style={accuracyGoal === 90 ? styles.tmActiveOption : styles.tmOptionBtn}>90% (Beginner)</button>
                    <button onClick={() => setAccuracyGoal(96)} style={accuracyGoal === 96 ? styles.tmActiveOption : styles.tmOptionBtn}>96% (Intermediate)</button>
                    <button onClick={() => setAccuracyGoal(99)} style={accuracyGoal === 99 ? styles.tmActiveOption : styles.tmOptionBtn}>99% (Advanced)</button>
                  </div>
                </div>

                <button onClick={handleStartDrill} style={styles.tmStartBtn}>
                  ড্রিল শুরু করুন <Forward />
                </button>
              </div>
            )}

            {phase === 'drill' && (
              <>
                <div style={styles.tmMsgRow}>
                  {errorMsg ? (
                    <span style={styles.tmErrorPill}><Warning /> {errorMsg}</span>
                  ) : (
                    <span style={styles.tmNextPill}>{feedbackMsg || 'টাইপ করুন...'}</span>
                  )}
                </div>

                <div style={styles.tmDrillBox}>
                  <div ref={textDisplayRef} style={styles.tmWordText}>
                    {renderWordGroups()}
                  </div>
                </div>

                <div style={styles.tmHintRow}>
                  <span style={styles.tmHintDot} />
                  <span style={styles.tmHintText}>Type the above text here</span>
                </div>

                <div style={styles.tmKeyboardWrap}>
                  <VisualKeyboard
                    pressedKey={pressedKey}
                    activeKey={(currentLine?.[input.length] ?? '')}
                    isCorrect={isCorrect}
                    wrongKey={wrongKey}
                  />
                </div>

                <div style={styles.tmHandsWrap}>
                  <div style={styles.tmHandScale}>
                    <HandGuide
                      activeFinger={getFingerForKey((currentLine?.[input.length] ?? ''))}
                      hand="left"
                      targetKey={(currentLine?.[input.length] ?? '')}
                    />
                  </div>
                  <div style={styles.tmHandScale}>
                    <HandGuide
                      activeFinger={getFingerForKey((currentLine?.[input.length] ?? ''))}
                      hand="right"
                      targetKey={(currentLine?.[input.length] ?? '')}
                    />
                  </div>
                </div>

                <div style={styles.tmHelpNote}>Backspace বন্ধ (Word Drill). ভুল হলে ঠিক কী চাপুন।</div>

                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                  disabled={isPaused}
                  className={shake ? 'shake-anim' : ''}
                  style={styles.tmHiddenInput}
                  autoFocus
                />
              </>
            )}
          </div>

          <div style={styles.tmSidebarWrap}>
            <DrillSidebar
              title="Your Progress"
              module={module}
              drillName={drillName}
              progress={{ 
                current: stats.totalTyped, 
                total: Math.max(stats.totalTyped, selectedTime * 60 * 5) // approximate 5 chars per second
              }}
              time={{ 
                value: `${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`
              }}
              paused={isPaused}
              wpm={currentWpm}
              accuracy={currentAcc}
              actions={{
                primary: { label: 'Finish', onClick: () => setPhase('result') },
                secondary: { label: isPaused ? 'Resume' : 'Pause', onClick: () => setIsPaused(p => !p) }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  // TypingMaster Pro inspired drill layout (same structure as KeyDrill)
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
  tmHelpNote: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '12px'
  },
  tmDrillBox: {
    background: '#f7fbff',
    borderRadius: '10px',
    border: '1px solid rgba(13,71,161,0.12)',
    padding: '18px 16px',
    minHeight: '160px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tmWordText: {
    width: '100%',
    maxWidth: '850px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '26px',
    lineHeight: '1.9',
    fontFamily: 'monospace',
    letterSpacing: '1px'
  },
  wordTextDisplay: {
    width: '100%',
    textAlign: 'center',
    lineHeight: '2.2',
    fontFamily: "'Segoe UI', 'Hind Siliguri', sans-serif",
    wordWrap: 'break-word'
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
    padding: 0
  },
  tmHiddenInput: {
    position: 'fixed',
    top: '-120px',
    left: 0,
    opacity: 0.01,
    pointerEvents: 'none'
  },
  // Settings block inside tmMain
  tmSettingsWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '10px 8px'
  },
  tmBackBtn: {
    alignSelf: 'flex-start',
    background: 'transparent',
    border: '1px solid rgba(0,0,0,0.18)',
    padding: '8px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 800,
    color: '#111827'
  },
  tmSettingsTitle: {
    color: '#1565c0',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
    paddingBottom: '10px',
    marginBottom: '16px',
    fontWeight: 900,
    fontSize: '22px'
  },
  tmSettingGroup: {
    marginBottom: '18px'
  },
  tmSettingLabelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
    color: '#0f172a'
  },
  tmOptionRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  tmOptionBtn: {
    flex: 1,
    minWidth: '140px',
    padding: '12px',
    border: '1px solid rgba(0,0,0,0.14)',
    borderRadius: '10px',
    background: 'white',
    cursor: 'pointer',
    fontWeight: 800,
    transition: 'all 0.15s',
    color: '#111827'
  },
  tmActiveOption: {
    flex: 1,
    minWidth: '140px',
    padding: '12px',
    border: '1px solid rgba(21,101,192,0.35)',
    borderRadius: '10px',
    background: 'rgba(21,101,192,0.08)',
    cursor: 'pointer',
    fontWeight: 900,
    color: '#1565c0'
  },
  tmStartBtn: {
    width: '100%',
    padding: '14px',
    background: '#1565c0',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 900,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '10px',
    gap: '8px'
  }
};

export default WordDrill;