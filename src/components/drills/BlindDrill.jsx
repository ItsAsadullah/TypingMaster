import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaForward, FaClock, FaBullseye, FaExclamationTriangle, FaChartLine, FaRedo } from 'react-icons/fa';
import ResultPage from '../ResultPage';

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

const BlindDrill = ({ generateDrillLine, onComplete, onBack, minWpm = 10 }) => {
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
  
  const [shake, setShake] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("কীবোর্ড না দেখে টাইপ করুন!");

  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const getLineWithSpace = (line) => {
    return line.endsWith(' ') ? line : line + ' ';
  };

  const loadNewLine = () => {
    const newLine = generateDrillLine ? generateDrillLine() : "Type something here";
    setCurrentLine(getLineWithSpace(newLine));
    setInput('');
  };

  useEffect(() => {
    if (phase === 'drill' && currentLine === "") {
      loadNewLine();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Timer
  useEffect(() => {
    if (phase === 'drill' && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setPhase('result');
            return 0;
          }
          return prev - 1;
        });
        setTimeElapsed((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [phase, isPaused, timeLeft]);

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

  // Prevent scrolling
  useEffect(() => {
    const preventScrollKeys = (e) => {
      const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'];
      if (e.key === ' ' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
      }
      if (scrollKeys.includes(e.key)) {
        e.preventDefault();
      }
    };

    const preventWheel = (e) => e.preventDefault();
    const preventTouch = (e) => {
      if (e.touches.length > 1) e.preventDefault();
    };

    window.addEventListener('keydown', preventScrollKeys);
    window.addEventListener('wheel', preventWheel, { passive: false });
    window.addEventListener('touchmove', preventTouch, { passive: false });

    return () => {
      window.removeEventListener('keydown', preventScrollKeys);
      window.removeEventListener('wheel', preventWheel);
      window.removeEventListener('touchmove', preventTouch);
    };
  }, []);

  const handleInputChange = (e) => {
    const typed = e.target.value;
    const expected = currentLine.substring(0, typed.length);

    setStats(prev => ({ ...prev, totalTyped: prev.totalTyped + 1 }));

    if (typed === expected) {
      setInput(typed);

      // Track correct key press
      if (typed.length > 0) {
        const lastKey = typed[typed.length - 1];
        setKeyStats(prev => ({
          ...prev,
          [lastKey]: {
            total: (prev[lastKey]?.total || 0) + 1,
            errors: prev[lastKey]?.errors || 0
          }
        }));
      }

      if (typed === currentLine) {
        setLinesCompleted(prev => prev + 1);
        loadNewLine();
      }
    } else {
      setStats(prev => ({ ...prev, mistakes: prev.mistakes + 1 }));
      
      // Track key error
      if (typed.length > 0) {
        const wrongKey = typed[typed.length - 1];
        setKeyStats(prev => ({
          ...prev,
          [wrongKey]: {
            total: (prev[wrongKey]?.total || 0) + 1,
            errors: (prev[wrongKey]?.errors || 0) + 1
          }
        }));
      }
      
      setShake(true);
      setTimeout(() => setShake(false), 300);
    }
  };

  const handleStartDrill = () => {
    setPhase('drill');
    setTimeLeft(selectedTime * 60);
    setTimeElapsed(0);
    setStats({ mistakes: 0, totalTyped: 0 });
    setKeyStats({});
    setLinesCompleted(0);
    setInput('');
    setCurrentLine('');
    loadNewLine();
  };

  const handlePause = () => setIsPaused(!isPaused);

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
  };

  // Result calculations
  const accuracy = stats.totalTyped > 0 ? Math.round(((stats.totalTyped - stats.mistakes) / stats.totalTyped) * 100) : 0;
  const totalChars = stats.totalTyped;
  const totalMinutes = timeElapsed / 60;
  const grossWpm = totalMinutes > 0 ? Math.round((totalChars / 5) / totalMinutes) : 0;
  const finalWpm = totalMinutes > 0 ? Math.round(((totalChars - stats.mistakes) / 5) / totalMinutes) : 0;
  const isPassed = accuracy >= accuracyGoal && finalWpm >= minWpm;

  const currentAcc = stats.totalTyped > 0 ? Math.round(((stats.totalTyped - stats.mistakes) / stats.totalTyped) * 100) : 0;
  const minsElapsed = Math.floor(timeElapsed / 60);
  const secsElapsed = timeElapsed % 60;

  let accFeedback = "চেষ্টা চালিয়ে যান।";
  if (accuracy >= 98) accFeedback = "অসাধারণ (Excellent)!";
  else if (accuracy >= 94) accFeedback = "খুব ভালো (Very Good)!";
  else if (accuracy >= 90) accFeedback = "ভালো (Good)।";

  let wpmFeedback = "আরও দ্রুত করার চেষ্টা করুন।";
  if (finalWpm >= 40) wpmFeedback = "অসাধারণ দ্রুততা!";
  else if (finalWpm >= 25) wpmFeedback = "ভালো গতি।";
  else if (finalWpm >= 15) wpmFeedback = "মোটামুটি।";

  return (
    <div style={styles.drillContainer}>
      <style>{shakeStyle}</style>

      {/* SETTINGS PHASE */}
      {phase === 'settings' && (
        <div style={styles.settingsCard}>
          <button onClick={onBack} style={styles.backBtn}>
            <FaArrowLeft /> ফিরে যান
          </button>

          <h2 style={{color: '#d32f2f', borderBottom: '2px solid #eee', paddingBottom: '10px'}}>
            🙈 Blind Typing Test
          </h2>

          <div style={{
            background: '#fff3e0',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            borderLeft: '4px solid #f57c00'
          }}>
            <p style={{margin: 0, lineHeight: '1.8', fontSize: '16px'}}>
              এই টেস্টে কীবোর্ড এবং হাতের গাইড দেখানো হবে না। শুধুমাত্র টেক্সট দেখে টাইপ করতে হবে।
            </p>
          </div>

          <div style={styles.settingGroup}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
                 <FaClock size={24} color="#1565c0"/> <label style={{fontWeight: 'bold'}}>সময় (Duration)</label>
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
                 <button onClick={() => setSelectedTime(2)} style={selectedTime === 2 ? styles.activeOption : styles.optionBtn}>2 min</button>
                 <button onClick={() => setSelectedTime(5)} style={selectedTime === 5 ? styles.activeOption : styles.optionBtn}>5 min</button>
                 <button onClick={() => setSelectedTime(10)} style={selectedTime === 10 ? styles.activeOption : styles.optionBtn}>10 min</button>
            </div>
          </div>

          <div style={styles.settingGroup}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
                 <FaBullseye size={24} color="#e65100"/> <label style={{fontWeight: 'bold'}}>লক্ষ্য (Accuracy)</label>
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
                 <button onClick={() => setAccuracyGoal(90)} style={accuracyGoal === 90 ? styles.activeOption : styles.optionBtn}>90% (Beginner)</button>
                 <button onClick={() => setAccuracyGoal(96)} style={accuracyGoal === 96 ? styles.activeOption : styles.optionBtn}>96% (Intermediate)</button>
                 <button onClick={() => setAccuracyGoal(99)} style={accuracyGoal === 99 ? styles.activeOption : styles.optionBtn}>99% (Advanced)</button>
            </div>
          </div>

          <button onClick={handleStartDrill} style={styles.startBtn}>
            টেস্ট শুরু করুন <FaForward style={{marginLeft: '8px'}}/>
          </button>
        </div>
      )}

      {/* DRILL PHASE */}
      {phase === 'drill' && (
        <div style={styles.drillContent}>
          {/* Header with stats */}
          <div style={styles.drillHeader}>
            <div style={styles.statsBar}>
              <div style={styles.statItem}><FaClock color="#1976d2"/> <span>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span></div>
              <div style={styles.statItem}><FaChartLine color="#388e3c"/> <span>{linesCompleted} Lines</span></div>
              <div style={styles.statItem}><FaBullseye color={currentAcc >= accuracyGoal ? '#43a047' : '#e53935'}/> <span>{currentAcc}% Acc</span></div>
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
              <button onClick={handlePause} style={styles.controlBtn}>{isPaused ? '▶ চালু করুন' : '⏸ পজ করুন'}</button>
              <button onClick={handleSkip} style={{...styles.controlBtn, background: '#f44336'}}>⏩ এড়িয়ে যান</button>
            </div>
          </div>

          {isPaused && (
            <div style={styles.pausedOverlay}>
              <h2>⏸ পজ করা হয়েছে</h2>
              <p>চালিয়ে যেতে "চালু করুন" চাপুন</p>
            </div>
          )}

          {/* Text display area - NO KEYBOARD, NO HANDS */}
          <div style={styles.textDisplayArea}>
            <div style={styles.feedbackBox}>
              {feedbackMsg}
            </div>

            <div style={styles.textToType}>
              {currentLine.split('').map((char, idx) => {
                let color = '#999';
                let bg = 'transparent';
                let fw = 'normal';

                if (idx < input.length) {
                  color = '#4caf50';
                  fw = 'bold';
                } else if (idx === input.length) {
                  color = '#1976d2';
                  bg = '#e3f2fd';
                  fw = 'bold';
                }

                return (
                  <span key={idx} style={{color, background: bg, fontWeight: fw, padding: '2px 0'}}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                );
              })}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              disabled={isPaused}
              className={shake ? 'shake-anim' : ''}
              style={{
                ...styles.hiddenInput,
                position: 'fixed',
                top: '-100px',
                left: 0,
                opacity: 0.01
              }}
              autoFocus
            />
          </div>
        </div>
      )}

      {/* RESULT PHASE */}
      {phase === 'result' && (
        <ResultPage
          stats={stats}
          keyStats={keyStats}
          timeElapsed={timeElapsed}
          drillTime={selectedTime}
          goals={{ wpm: minWpm, accuracy: accuracyGoal }}
          onNext={(result) => onComplete(result)}
          onRetry={handleRestart}
          onReview={(problemKeys) => {
            console.log('Problem keys:', problemKeys);
            handleRestart();
          }}
        />
      )}
    </div>
  );
};

const styles = {
  drillContainer: {
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    position: 'fixed',
    top: 0,
    left: 0,
    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  settingsCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '600px',
    width: '90%',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
  },
  backBtn: {
    background: 'transparent',
    border: '1px solid #ccc',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  settingGroup: {
    marginBottom: '25px'
  },
  optionBtn: {
    flex: 1,
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    background: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s'
  },
  activeOption: {
    flex: 1,
    padding: '12px',
    border: '2px solid #1976d2',
    borderRadius: '8px',
    background: '#e3f2fd',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#1976d2'
  },
  startBtn: {
    width: '100%',
    padding: '15px',
    background: '#d32f2f',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '20px'
  },
  drillContent: {
    width: '90%',
    maxWidth: '1000px',
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  drillHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    background: '#f5f5f5',
    borderRadius: '8px'
  },
  statsBar: {
    display: 'flex',
    gap: '20px'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  controlBtn: {
    padding: '8px 16px',
    background: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  pausedOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(255,255,255,0.95)',
    padding: '40px',
    borderRadius: '12px',
    textAlign: 'center',
    zIndex: 10
  },
  textDisplayArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    minHeight: '200px'
  },
  feedbackBox: {
    padding: '12px',
    background: '#fff3e0',
    borderLeft: '4px solid #f57c00',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#e65100'
  },
  textToType: {
    fontSize: '28px',
    lineHeight: '1.8',
    padding: '20px',
    background: '#fafafa',
    borderRadius: '8px',
    fontFamily: 'monospace',
    minHeight: '120px',
    letterSpacing: '2px'
  },
  hiddenInput: {
    fontSize: '16px',
    padding: '10px',
    border: '2px solid #1976d2',
    borderRadius: '6px',
    width: '100%',
    outline: 'none'
  },
  resultCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '800px',
    width: '90%',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
  },
  resultGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginTop: '30px',
    marginBottom: '30px'
  },
  resultBox: {
    padding: '20px',
    background: '#f5f5f5',
    borderRadius: '8px',
    textAlign: 'center'
  },
  resultActions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center'
  },
  retryBtn: {
    padding: '12px 24px',
    background: '#757575',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  nextBtn: {
    padding: '12px 24px',
    background: '#2e7d32',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px'
  }
};

export default BlindDrill;
