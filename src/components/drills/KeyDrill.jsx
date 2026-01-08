import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaForward, FaClock, FaBullseye, FaRegLightbulb, FaExclamationTriangle, FaChartLine, FaRedo } from 'react-icons/fa';
import VisualKeyboard from '../VisualKeyboard';
import HandGuide from '../HandGuide';

// Shake Animation CSS
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

const KeyDrill = ({ learningSteps, generateDrillLine, onComplete, onBack, minWpm = 10 }) => {
  const [phase, setPhase] = useState('learning'); 
  const [learnIndex, setLearnIndex] = useState(0);
  
  // Settings States
  const [selectedTime, setSelectedTime] = useState(5);
  const [accuracyGoal, setAccuracyGoal] = useState(94);
  
  // Drill States
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [targetKeystrokes, setTargetKeystrokes] = useState(0);
  const [currentLine, setCurrentLine] = useState("");
  const [linesCompleted, setLinesCompleted] = useState(0);
  
  const [input, setInput] = useState('');
  const [stats, setStats] = useState({ mistakes: 0, totalTyped: 0 });
  const [keyStats, setKeyStats] = useState({});
  
  // Visual Feedback States
  const [pressedKey, setPressedKey] = useState(null);
  const [isCorrect, setIsCorrect] = useState(true);
  const [shake, setShake] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("শুরু করা যাক!");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorIndices, setErrorIndices] = useState(new Set()); // ভুলের অবস্থান

  const inputRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef(null);

  // Initial Line Setup (Safety Check added)
  useEffect(() => {
    if (typeof generateDrillLine === 'function') {
      setCurrentLine(generateDrillLine(0));
    } else {
      console.error("generateDrillLine prop is missing!");
      setCurrentLine("error loading line");
    }
  }, [generateDrillLine]);

  // Style Injection
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = shakeStyle;
    document.head.appendChild(styleSheet);
    return () => styleSheet.remove();
  }, []);

  // Auto Focus
  useEffect(() => {
    if ((phase === 'learning' || phase === 'drill' || phase === 'review') && !isPaused) {
      inputRef.current?.focus();
    }
  }, [phase, isPaused, currentLine, shake]);

  // --- PHASE 1: LEARNING ---
  const handleLearningInput = (e) => {
    const char = e.target.value.slice(-1).toLowerCase();
    const targetChar = learningSteps[learnIndex].char;
    setPressedKey(char);

    if (char === targetChar) {
      setIsCorrect(true);
      setShake(false);
      setErrorMsg("");
      const praises = ["দারুণ!", "চালিয়ে যান!", "চমৎকার!"];
      setFeedbackMsg(praises[Math.floor(Math.random() * praises.length)]);

      setTimeout(() => {
        setPressedKey(null);
        if (learnIndex < learningSteps.length - 1) {
          setLearnIndex(prev => prev + 1);
        } else {
          setPhase('settings');
        }
      }, 200);
    } else {
      setIsCorrect(false);
      setShake(true);
      const targetDisplay = targetChar === ' ' ? 'Space' : targetChar.toUpperCase();
      setErrorMsg(`ভুল! চাপতে হবে '${targetDisplay}'`);
      setTimeout(() => setShake(false), 300);
    }
    e.target.value = "";
  };

  const startDrill = (isReview = false, problemKeys = []) => {
    const time = isReview ? 2 : selectedTime;
    setTimeLeft(time * 60);
    setTimeElapsed(0);
    setStats({ mistakes: 0, totalTyped: 0 });
    setKeyStats({});
    setLinesCompleted(0);
    setIsPaused(false);
    lastActivityRef.current = Date.now();
    // টার্গেট: প্রতি মিনিটে ৩০টি শব্দ (১৫০ কীস্ট্রোক) * সময়
    setTargetKeystrokes(30 * 5 * time); 
    
    if (typeof generateDrillLine === 'function') {
      setCurrentLine(generateDrillLine(0));
    }
    setPhase(isReview ? 'review' : 'drill');
    setInput('');
    setErrorIndices(new Set());
  };

  // --- TIMER & AUTO PAUSE (10s) ---
  useEffect(() => {
    if ((phase === 'drill' || phase === 'review') && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        // ১০ সেকেন্ড ইনএক্টিভ থাকলে পজ
        if (now - lastActivityRef.current > 10000 && !isPaused) {
          setIsPaused(true);
        }

        if (!isPaused) {
          setTimeLeft(prev => {
            if (prev <= 1) {
              setPhase('result');
              return 0;
            }
            return prev - 1;
          });
          setTimeElapsed(prev => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, isPaused, timeLeft]);

  // --- DRILL INPUT ---
  const handleDrillInput = (e) => {
    if (isPaused) {
      setIsPaused(false);
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

      // কাজ শেষ হলে আর্লি ফিনিশ
      if (stats.totalTyped + 1 >= targetKeystrokes) {
        setPhase('result');
      }

      // লাইন চেঞ্জ
      if (input.length + 1 >= currentLine.length) {
        const newCount = linesCompleted + 1;
        setLinesCompleted(newCount);
        if (typeof generateDrillLine === 'function') {
          setCurrentLine(generateDrillLine(newCount));
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

  // Live Stats
  const timeElapsedMin = (timeElapsed / 60) || 1; // avoid divide by zero
  const currentWpm = Math.round((stats.totalTyped / 5) / (timeElapsedMin)); // Realtime WPM logic fix
  const currentAcc = stats.totalTyped > 0 ? Math.round(((stats.totalTyped - stats.mistakes) / stats.totalTyped) * 100) : 100;
  const progressPercent = Math.min((stats.totalTyped / targetKeystrokes) * 100, 100);

  // --- RENDER TEXT HELPER ---
  const renderDrillText = () => {
    if (!currentLine) return null;
    const words = currentLine.split(' ');
    let charIndex = 0;

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px' }}>
        {words.map((word, wIdx) => {
          const wordElement = (
            <div key={wIdx} style={{ display: 'flex', whiteSpace: 'nowrap' }}>
              {word.split('').map((char, cIdx) => {
                const globalIndex = charIndex + cIdx;
                let statusClass = 'pending';
                
                if (globalIndex < input.length) {
                  statusClass = errorIndices.has(globalIndex) ? 'fixed-error' : 'correct';
                } else if (globalIndex === input.length) {
                  statusClass = shake ? 'wrong' : 'active';
                }

                return (
                  <div key={cIdx} className={statusClass === 'wrong' ? 'shake-anim' : ''} style={{
                    ...styles.keyCap,
                    ...(statusClass === 'correct' ? styles.keyCorrect : {}),
                    ...(statusClass === 'wrong' ? styles.keyWrong : {}),
                    ...(statusClass === 'fixed-error' ? styles.keyFixedError : {}),
                    ...(statusClass === 'active' ? styles.keyActive : {}),
                    marginRight: '2px'
                  }}>
                    {char}
                  </div>
                );
              })}
            </div>
          );

          charIndex += word.length;
          let spaceElement = null;
          
          if (wIdx < words.length - 1) {
             const spaceGlobalIndex = charIndex;
             let spaceStatus = 'pending';
             if (spaceGlobalIndex < input.length) {
                spaceStatus = errorIndices.has(spaceGlobalIndex) ? 'fixed-error' : 'correct';
             } else if (spaceGlobalIndex === input.length) {
                spaceStatus = shake ? 'wrong' : 'active';
             }

             spaceElement = (
                <div className={spaceStatus === 'wrong' ? 'shake-anim' : ''} style={{
                   ...styles.keyCap,
                   width: '60px',
                   background: '#fafafa',
                   color: '#ccc',
                   fontSize: '16px',
                   ...(spaceStatus === 'correct' ? styles.keyCorrect : {}),
                   ...(spaceStatus === 'wrong' ? styles.keyWrong : {}),
                   ...(spaceStatus === 'fixed-error' ? styles.keyFixedError : {}),
                   ...(spaceStatus === 'active' ? styles.keyActive : {}),
                }}>
                  ␣
                </div>
             );
             charIndex++;
          }

          return (
            <div key={wIdx} style={{display: 'flex', alignItems: 'center'}}>
               {wordElement}
               {spaceElement && <div style={{marginLeft: '2px'}}>{spaceElement}</div>}
            </div>
          );
        })}
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
          <div style={{margin: '10px 0'}}>
             <VisualKeyboard activeKey={step.char} pressedKey={pressedKey} isCorrect={isCorrect} />
          </div>
          <div style={{display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '10px'}}>
             <HandGuide hand="left" activeFinger={step.hand === 'left' ? step.finger : null} targetKey={step.char} />
             <HandGuide hand="right" activeFinger={step.hand === 'right' ? step.finger : null} targetKey={step.char} />
          </div>
          <input ref={inputRef} type="text" onChange={handleLearningInput} style={{opacity: 0, position: 'absolute'}} autoFocus />
        </div>
      </div>
    );
  }

  if (phase === 'settings') {
    return (
      <div style={styles.container}>
        <div style={styles.settingsCard}>
          <h2 style={{color: '#1565c0', borderBottom: '2px solid #eee', paddingBottom: '10px'}}>ড্রিল সেটিংস</h2>
          <div style={styles.settingRow}>
             <div style={styles.settingBox}>
               <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
                 <FaClock size={24} color="#1565c0"/> <label style={{fontWeight: 'bold'}}>সময় (Duration)</label>
               </div>
               <div style={{display: 'flex', gap: '5px'}}>
                 {[2, 5, 10].map(m => (
                   <button key={m} onClick={() => setSelectedTime(m)} style={selectedTime === m ? styles.activeOption : styles.optionBtn}>{m} min</button>
                 ))}
               </div>
             </div>
             <div style={styles.settingBox}>
               <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
                 <FaBullseye size={24} color="#e65100"/> <label style={{fontWeight: 'bold'}}>লক্ষ্য (Accuracy)</label>
               </div>
               <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                 <button onClick={() => setAccuracyGoal(90)} style={accuracyGoal === 90 ? styles.activeOption : styles.optionBtn}>90% (Beginner)</button>
                 <button onClick={() => setAccuracyGoal(96)} style={accuracyGoal === 96 ? styles.activeOption : styles.optionBtn}>96% (Intermediate)</button>
                 <button onClick={() => setAccuracyGoal(99)} style={accuracyGoal === 99 ? styles.activeOption : styles.optionBtn}>99% (Advanced)</button>
               </div>
             </div>
          </div>
          <button onClick={() => startDrill(false)} style={styles.btnPrimaryBig}>ড্রিল শুরু করুন <FaForward /></button>
        </div>
      </div>
    );
  }

  if (phase === 'drill' || phase === 'review') {
    const nextChar = currentLine[input.length] || '';
    const currentStep = learningSteps.find(s => s.char === nextChar) || { hand: 'left', finger: '' };
    
    return (
      <div style={styles.container}>
        <div style={styles.statsHeader}>
           <div style={styles.statItem}>
             <FaClock color="#555"/> 
             <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
             {isPaused && <span style={{color: '#d32f2f', marginLeft: '5px', animation: 'blink 1s infinite'}}>(Paused)</span>}
           </div>
           <div style={styles.statItem}><FaChartLine color="#1e88e5"/> <span>{isNaN(currentWpm) ? 0 : currentWpm} WPM</span></div>
           <div style={styles.statItem}><FaBullseye color={currentAcc >= accuracyGoal ? '#43a047' : '#e53935'}/> <span>{currentAcc}% Acc</span></div>
           <button onClick={onBack} style={styles.exitBtn}>Exit</button>
        </div>
        
        <div style={{width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px', marginBottom: '15px', overflow: 'hidden'}}>
           <div style={{width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #4caf50, #8bc34a)', transition: 'width 0.3s ease'}}></div>
        </div>

        <div style={{height: '30px', textAlign: 'center', marginBottom: '5px'}}>
           {errorMsg ? (
             <span style={{color: '#c62828', fontWeight: 'bold', background: '#ffebee', padding: '5px 15px', borderRadius: '20px', border: '1px solid #ffcdd2', fontSize: '14px'}}>
               <FaExclamationTriangle style={{marginRight:'5px'}}/> {errorMsg}
             </span>
           ) : (
             <span style={{color: '#1e88e5', fontWeight: 'bold'}}>
               পরবর্তী: {nextChar === ' ' ? 'Space' : nextChar.toUpperCase()}
             </span>
           )}
        </div>
        
        <div style={{...styles.drillBox, opacity: isPaused ? 0.5 : 1}} onClick={() => inputRef.current.focus()}>
           {renderDrillText()}
        </div>

        <p style={{textAlign: 'center', color: '#777', fontSize: '13px', margin: '10px 0'}}>
           হিন্ট দেখার জন্য নিচের কিবোর্ড এবং হাতের দিকে লক্ষ্য করুন
        </p>
        <div style={{marginTop: '0'}}><VisualKeyboard activeKey={nextChar} pressedKey={pressedKey} isCorrect={isCorrect} /></div>
        <div style={{display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '10px'}}>
             <HandGuide hand="left" activeFinger={currentStep.hand === 'left' ? currentStep.finger : null} targetKey={nextChar} />
             <HandGuide hand="right" activeFinger={currentStep.hand === 'right' ? currentStep.finger : null} targetKey={nextChar} />
        </div>

        <input ref={inputRef} type="text" value={input} onChange={handleDrillInput} style={{opacity: 0, position: 'absolute'}} autoFocus />
      </div>
    );
  }

  // --- 4. RESULT VIEW ---
  if (phase === 'result') {
    const accuracy = stats.totalTyped > 0 ? Math.round(((stats.totalTyped - stats.mistakes) / stats.totalTyped) * 100) : 0;
    const finalWpm = Math.round((stats.totalTyped / 5) / (timeElapsed / 60)) || 0;
    
    // Pass Criteria
    const isPassed = accuracy >= accuracyGoal && finalWpm >= minWpm;
    
    let timeMsg = `ব্যবহৃত সময়: ${Math.floor(timeElapsed / 60)} মি ${timeElapsed % 60} সে`;
    if (timeElapsed < (selectedTime * 60)) {
      const saved = (selectedTime * 60) - timeElapsed;
      timeMsg += ` (অভিনন্দন! আপনি ${Math.floor(saved / 60)} মি ${saved % 60} সে আগে শেষ করেছেন)`;
    }

    let accFeedback = "";
    if (accuracy >= 98) accFeedback = "অসাধারণ (Excellent)!";
    else if (accuracy >= 94) accFeedback = "খুব ভালো (Very Good)!";
    else if (accuracy >= 90) accFeedback = "ভালো (Good)।";
    else accFeedback = "আরও উন্নতি প্রয়োজন।";

    const keyChart = Object.entries(keyStats).map(([key, stat]) => {
      const errRate = (stat.errors / stat.total) * 100;
      let status = 'Good';
      let color = '#a5d6a7';
      if (errRate > 20) { status = 'Problematic'; color = '#ef9a9a'; }
      else if (errRate > 10) { status = 'Problem'; color = '#fff59d'; }
      else if (errRate > 5) { status = 'Ok'; color = '#eeeeee'; }
      return { key, status, color };
    });

    return (
      <div style={styles.container}>
         <div style={styles.resultCard}>
            <h2 style={{color: isPassed ? '#2ecc71' : '#e53935', borderBottom: '1px solid #eee', paddingBottom: '15px'}}>
              {isPassed ? "অনুশীলন সম্পন্ন!" : "অনুশীলন ব্যর্থ হয়েছে"}
            </h2>
            <p style={{color: '#555', fontWeight: 'bold'}}>{timeMsg}</p>
            
            <div style={styles.finalStats}>
               <div style={styles.statBox}>
                 <h1 style={{color: finalWpm >= minWpm ? '#2e7d32' : '#c62828'}}>{finalWpm}</h1>
                 <small>Speed (Min Goal: {minWpm}+ WPM)</small>
               </div>
               <div style={styles.statBox}>
                 <h1 style={{color: accuracy >= accuracyGoal ? '#2e7d32' : '#c62828'}}>{accuracy}%</h1>
                 <small>Accuracy (Goal: {accuracyGoal}%)</small>
                 <div style={{fontSize: '12px', marginTop: '5px'}}>{accFeedback}</div>
               </div>
            </div>

            <div style={styles.chartContainer}>
              <h4 style={{textAlign: 'left', margin: '0 0 10px 0'}}>Result Summary:</h4>
              <div style={styles.chartGrid}>
                {keyChart.map((k, i) => (
                  <div key={i} style={{...styles.chartItem, background: k.color}} title={k.status}>
                    {k.key === ' ' ? '␣' : k.key.toUpperCase()}
                  </div>
                ))}
              </div>
              <div style={styles.legend}>
                <span style={{color: '#ef9a9a'}}>■ Problematic</span>
                <span style={{color: '#fff59d'}}>■ Problem</span>
                <span style={{color: '#eeeeee'}}>■ Ok</span>
                <span style={{color: '#a5d6a7'}}>■ Good</span>
              </div>
            </div>

            <div style={{display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px'}}>
               <button onClick={() => setPhase('settings')} style={styles.btnSecondary}><FaRedo/> Retry</button>
               {isPassed ? (
                 <button onClick={() => onComplete({ wpm: finalWpm, accuracy })} style={styles.btnPrimaryBig}>পরবর্তী ধাপ <FaForward /></button>
               ) : (
                 <div style={{color: 'red', fontSize: '12px', marginTop: '10px'}}>লক্ষ্য পূরণ হয়নি।</div>
               )}
            </div>
         </div>
      </div>
    );
  }
  return <div>Loading...</div>;
};

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '10px', fontFamily: "'Hind Siliguri', 'Segoe UI', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  backBtn: { background: 'transparent', border: '1px solid #ccc', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' },
  settingsCard: { background: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
  settingRow: { display: 'flex', justifyContent: 'center', gap: '30px', margin: '30px 0' },
  settingBox: { border: '1px solid #eee', padding: '20px', borderRadius: '10px', width: '250px', background: '#f9f9f9', textAlign: 'left' },
  optionBtn: { width: '100%', padding: '8px', margin: '2px 0', border: '1px solid #ccc', background: 'white', cursor: 'pointer', borderRadius: '4px' },
  activeOption: { width: '100%', padding: '8px', margin: '2px 0', border: '1px solid #1565c0', background: '#e3f2fd', color: '#1565c0', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' },
  statsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px 15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '10px' },
  statItem: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '16px', color: '#444' },
  exitBtn: { background: '#ffebee', border: '1px solid #ef5350', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', color: '#c62828', fontWeight: 'bold' },
  drillBox: { background: 'white', padding: '20px', borderRadius: '10px', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd', position: 'relative' },
  keyCap: { height: '50px', width: '45px', border: '1px solid #ccc', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold', boxShadow: '0 3px 0 #bbb', background: '#fff', color: '#333' },
  keyCorrect: { background: '#e8f5e9', borderColor: '#2ecc71', color: '#2ecc71', boxShadow: 'inset 0 0 5px #2ecc71' },
  keyWrong: { background: '#ffebee', borderColor: '#e53935', color: '#e53935' },
  keyActive: { border: '2px solid #1e88e5', transform: 'translateY(2px)', boxShadow: 'none', background: '#e3f2fd' },
  keyFixedError: { background: '#fff', borderColor: '#e53935', color: '#e53935', textDecoration: 'line-through' },
  learningCard: { textAlign: 'center', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' },
  bigDisplayBox: { fontWeight: 'bold', color: '#1565c0', border: '3px solid #1e88e5', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', height: '100px', borderRadius: '10px', background: '#e3f2fd', marginBottom: '10px' },
  feedbackBox: { background: '#fff9c4', color: '#f57f17', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', fontSize: '14px' },
  errorBox: { background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '5px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', fontWeight: 'bold' },
  resultCard: { textAlign: 'center', background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
  finalStats: { display: 'flex', justifyContent: 'center', gap: '50px', margin: '20px 0' },
  statBox: { textAlign: 'center', border: '1px solid #eee', padding: '15px', borderRadius: '10px', width: '150px' },
  chartContainer: { margin: '20px 0', border: '1px solid #eee', padding: '15px', borderRadius: '10px', background: '#fafafa' },
  chartGrid: { display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center' },
  chartItem: { width: '30px', height: '30px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(0,0,0,0.1)' },
  legend: { display: 'flex', gap: '15px', justifyContent: 'center', fontSize: '12px', marginTop: '10px', fontWeight: 'bold' },
  btnPrimaryBig: { padding: '12px 30px', background: '#1e88e5', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' },
  btnSecondary: { padding: '10px 20px', background: '#fff', color: '#555', border: '1px solid #ccc', borderRadius: '50px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }
};

export default KeyDrill;