import React, { useState, useEffect, useMemo } from 'react';

// Animation Styles Injection
const animationStyles = `
  @keyframes slideUpFade {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .anim-entry {
    animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`;

const ResultPage = ({ 
  stats = { totalTyped: 0, mistakes: 0 }, 
  timeElapsed = 0, 
  drillTime = 5, 
  goals = { wpm: 10, accuracy: 94 }, 
  keyStats = {},
  onNext, 
  onRetry, 
  onReview 
}) => {
  
  // Animation States
  const [animWpm, setAnimWpm] = useState(0);
  const [animGrossWpm, setAnimGrossWpm] = useState(0);
  const [animAccuracy, setAnimAccuracy] = useState(0);
  const [showBars, setShowBars] = useState(false);

  // ক্যালকুলেশন
  const totalTyped = stats.totalTyped || 0;
  const mistakes = stats.mistakes || 0;

  const accuracy = totalTyped > 0 
    ? Math.round(((totalTyped - mistakes) / totalTyped) * 100) 
    : 0;
  
  // WPM Calculation
  const timeInMin = timeElapsed / 60;
  const grossWpm = timeInMin > 0 ? Math.round((totalTyped / 5) / timeInMin) : 0;
  const netWpm = timeInMin > 0 ? Math.round(((totalTyped - mistakes) / 5) / timeInMin) : 0;
  
  // Pass/Fail Logic
  const isPassed = accuracy >= goals.accuracy && netWpm >= goals.wpm;
  const isInterrupted = timeElapsed < drillTime * 60;

  // Time Message
  const formatTime = (sec) => `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')} min.`;

  // Animation Effects
  useEffect(() => {
    // Style Injection
    const styleSheet = document.createElement("style");
    styleSheet.innerText = animationStyles;
    document.head.appendChild(styleSheet);

    // Number Counting Animation Helper
    const animateValue = (start, end, duration, setter) => {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4); // Smooth easing
        setter(Math.floor(easeOutQuart * (end - start) + start));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    };

    // Trigger Animations
    animateValue(0, netWpm, 1500, setAnimWpm);
    animateValue(0, grossWpm, 1500, setAnimGrossWpm);
    animateValue(0, accuracy, 1500, setAnimAccuracy);
    
    // Bar Growth Delay
    const timer = setTimeout(() => setShowBars(true), 300);

    return () => {
      styleSheet.remove();
      clearTimeout(timer);
    };
  }, [netWpm, grossWpm, accuracy]);
  
  // Dynamic Color Generator - শুধুমাত্র ভুলের সংখ্যা অনুযায়ী
  const getColorByErrorCount = (errorCount, maxErrors) => {
    // errorCount এর ভিত্তিতে রঙ নির্ধারণ
    const percentage = (errorCount / maxErrors) * 100;
    
    if (percentage >= 80) return '#d32f2f'; // রক্তের মত গাঢ় লাল
    if (percentage >= 70) return '#e53935'; // লাল
    if (percentage >= 60) return '#f44336'; // হালকা লাল
    if (percentage >= 50) return '#ff5722'; // গাঢ় কমলা
    if (percentage >= 40) return '#ff9800'; // কমলা
    if (percentage >= 30) return '#ffc107'; // কমলা-হলুদ
    if (percentage >= 20) return '#ffeb3b'; // হলুদ
    if (percentage >= 10) return '#cddc39'; // সবুজ-হলুদ
    return '#8bc34a'; // হালকা সবুজ
  };
  
  // Problem Keys Analysis
  const problemKeys = [];
  
  // প্রথমে max errors খুঁজে বের করি
  const allErrors = Object.values(keyStats).map(s => s.errors).filter(e => e > 0);
  const maxErrors = Math.max(...allErrors, 1);
  
  const keyChart = Object.entries(keyStats)
    .map(([key, stat]) => {
      const keyAccuracy = stat.total > 0 
          ? Math.round(((stat.total - stat.errors) / stat.total) * 100) 
          : 100;
      
      const errorCount = stat.errors;
      
  // Dynamic height based on error count
  const barHeight = maxErrors > 0 ? (errorCount / maxErrors) * 80 + 12 : 12;
      
  // Color based on error count relative to max
  const barColor = getColorByErrorCount(errorCount, maxErrors);
      
      // Status based on accuracy
      let status = 'OK';
      let zone = 'ok';
      if (keyAccuracy < 80) {
        status = 'Problematic';
        zone = 'problematic';
        problemKeys.push(key);
      } else if (keyAccuracy < 90) {
        status = 'Difficult';
        zone = 'difficult';
        problemKeys.push(key);
      }
      
      return { 
        key, 
        accuracy: keyAccuracy, 
        status, 
        zone,
        barColor, 
        barHeight, 
        errors: errorCount
      };
    })
    .filter(k => k.errors > 0)
    .sort((a, b) => b.errors - a.errors);

  const viewKeyChart = useMemo(() => keyChart.slice(0, 12), [keyChart]);

  return (
    <div style={styles.tmShell}>
      <div style={styles.tmBackdropOrbs} aria-hidden="true">
        <div style={styles.tmOrbLeft} />
        <div style={styles.tmOrbRight} />
      </div>

      <div style={styles.tmModal} className="anim-entry">
        
        {/* Header */}
        <div style={styles.tmHeader}>
          <div style={styles.tmBrand}>
            <div style={styles.tmLogoMark}>T</div>
            <div>
              <div style={styles.tmBrandName}>TypingMaster</div>
              <div style={styles.tmBrandSub}>Exercise Results</div>
            </div>
          </div>

          <button style={styles.tmCloseBtn} onClick={onRetry} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={styles.tmBody}>
          {/* Left content */}
          <div style={styles.tmLeft}>
            {isInterrupted && (
              <div style={styles.tmWarning}>
                <div style={styles.tmWarningIcon}>⚠</div>
                <div>
                  <div style={styles.tmWarningTitle}>Exercise Interrupted</div>
                  <div style={styles.tmWarningText}>
                    অনুশীলনটি তাড়াতাড়ি বাধাগ্রস্ত হয়েছে। ফলাফলগুলি অসম্পূর্ণ উপাদানের উপর ভিত্তি করে এবং সঠিক নাও হতে পারে।
                  </div>
                </div>
              </div>
            )}

            <div style={styles.tmStatsTable}>
              <div style={styles.tmRow}>
                <div style={styles.tmLabel}>Time Used</div>
                <div style={styles.tmValue}>{formatTime(timeElapsed)}</div>
                <div style={styles.tmStatus}>
                  {isInterrupted ? (
                    <span style={{ ...styles.tmBadge, background: '#fff9e6', color: '#b45309', border: '1px solid #f59e0b' }}>Interrupted</span>
                  ) : (
                    <span style={styles.tmBadge}>Good</span>
                  )}
                </div>
              </div>

              <div style={styles.tmRow}>
                <div style={styles.tmLabel}>Gross Speed</div>
                <div style={styles.tmValue}>{animGrossWpm} wpm</div>
                <div style={styles.tmStatus}>
                  <span style={styles.tmBadge}>Good</span>
                </div>
              </div>

              <div style={styles.tmRow}>
                <div style={styles.tmLabel}>Accuracy</div>
                <div style={styles.tmValue}>{animAccuracy}%</div>
                <div style={styles.tmStatus}>
                  <span style={styles.tmBadge}>Goal {goals.accuracy}%</span>
                </div>
              </div>

              <div style={{ ...styles.tmRow, borderBottom: 'none' }}>
                <div style={styles.tmLabel}>Net Speed</div>
                <div style={styles.tmValue}>{animWpm} wpm</div>
                <div style={styles.tmStatus}>
                  <span style={styles.tmBadge}>{isPassed ? 'Passed' : 'Try again'}</span>
                </div>
              </div>
            </div>

            {viewKeyChart.length > 0 && (
              <div style={styles.tmKeysSection}>
                <div style={styles.tmKeysHeader}>
                  <div style={styles.tmKeysTitle}>Difficult Keys in this Exercise</div>
                  <button onClick={() => onReview(problemKeys)} style={styles.tmReviewBtn}>
                    ▶ Review
                  </button>
                </div>

                <div style={styles.tmChartBox}>
                  <div style={styles.tmChartArea}>
                    {/* Zones */}
                    <div style={{ ...styles.tmZoneLine, top: 18 }} />
                    <div style={{ ...styles.tmZoneLine, top: 64 }} />
                    <div style={{ ...styles.tmZoneLine, top: 110 }} />

                    <div style={{ ...styles.tmZoneLabel, top: 6 }}>Problematic</div>
                    <div style={{ ...styles.tmZoneLabel, top: 52 }}>Difficult</div>
                    <div style={{ ...styles.tmZoneLabel, top: 98 }}>OK</div>

                    {viewKeyChart.map((k, i) => (
                      <div key={`${k.key}-${i}`} style={styles.tmBarCol}>
                        <div style={styles.tmBarTrack}>
                          <div
                            style={{
                              ...styles.tmBarFill,
                              height: showBars ? `${k.barHeight}%` : '0%',
                              transition: `height 0.55s cubic-bezier(0.2, 1, 0.2, 1) ${i * 0.035}s`
                            }}
                            title={`${k.key === ' ' ? 'Space' : k.key} • errors: ${k.errors}`}
                          />
                        </div>
                        <div style={styles.tmKeyTick}>{k.key === ' ' ? '␠' : k.key}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div style={styles.tmRight}>
            <button onClick={() => onNext({ wpm: netWpm, accuracy })} style={styles.tmPrimaryBtn}>
              OK
            </button>
            <button onClick={onRetry} style={styles.tmSecondaryBtn}>
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const styles = {
  tmShell: {
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    position: 'fixed',
    top: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', 'Hind Siliguri', Tahoma, Geneva, Verdana, sans-serif",
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  tmBackdropOrbs: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none'
  },
  tmOrbLeft: {
    position: 'absolute',
    left: '-220px',
    bottom: '-220px',
    width: '520px',
    height: '520px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.0) 65%)',
    opacity: 0.55
  },
  tmOrbRight: {
    position: 'absolute',
    right: '-260px',
    top: '-260px',
    width: '620px',
    height: '620px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.0) 65%)',
    opacity: 0.55
  },
  tmModal: {
    width: 'min(980px, calc(100vw - 48px))',
    height: 'min(640px, calc(100vh - 48px))',
    background: 'rgba(255,255,255,0.92)',
    borderRadius: '14px',
    boxShadow: '0 22px 70px rgba(0,0,0,0.22)',
    border: '1px solid rgba(255,255,255,0.6)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  tmHeader: {
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
  tmLogoMark: {
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
  tmBrandName: {
    fontSize: '20px',
    fontWeight: 900,
    color: '#1565c0',
    fontStyle: 'italic',
    lineHeight: 1.1
  },
  tmBrandSub: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 600
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
    display: 'flex'
  },
  tmLeft: {
    flex: 1,
    minWidth: 0,
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  tmRight: {
    width: '230px',
    background: 'rgba(21,101,192,0.10)',
    borderLeft: '1px solid rgba(13,71,161,0.12)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '12px',
    padding: '18px'
  },
  tmPrimaryBtn: {
    width: '100%',
    padding: '10px 0',
    borderRadius: '6px',
    border: '1px solid rgba(21,101,192,0.3)',
    background: 'linear-gradient(180deg, #1e88e5, #1565c0)',
    color: '#fff',
    fontWeight: 800,
    cursor: 'pointer'
  },
  tmSecondaryBtn: {
    width: '100%',
    padding: '10px 0',
    borderRadius: '6px',
    border: '1px solid rgba(13,71,161,0.18)',
    background: 'rgba(255,255,255,0.75)',
    color: '#111827',
    fontWeight: 700,
    cursor: 'pointer'
  },
  tmWarning: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid rgba(245, 158, 11, 0.35)',
    background: 'linear-gradient(135deg, rgba(255, 249, 230, 0.92), rgba(255, 245, 210, 0.92))'
  },
  tmWarningIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    background: 'rgba(245, 158, 11, 0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    color: '#b45309',
    flexShrink: 0
  },
  tmWarningTitle: {
    fontWeight: 900,
    color: '#111827',
    fontSize: '13px',
    marginBottom: '2px'
  },
  tmWarningText: {
    fontSize: '12px',
    color: '#6b7280',
    lineHeight: 1.35
  },
  tmStatsTable: {
    borderRadius: '10px',
    border: '1px solid rgba(13,71,161,0.12)',
    background: '#f8fbff',
    overflow: 'hidden'
  },
  tmRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 120px 140px',
    alignItems: 'center',
    padding: '10px 12px',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    columnGap: '10px'
  },
  tmLabel: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#111827'
  },
  tmValue: {
    fontSize: '13px',
    fontWeight: 900,
    color: '#0f172a',
    textAlign: 'left'
  },
  tmStatus: {
    textAlign: 'right'
  },
  tmBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 800,
    color: '#14532d',
    background: 'linear-gradient(135deg, rgba(200, 230, 201, 0.95), rgba(165, 214, 167, 0.85))',
    border: '1px solid rgba(129, 199, 132, 0.8)'
  },
  tmKeysSection: {
    borderTop: '1px solid rgba(0,0,0,0.06)',
    paddingTop: '10px'
  },
  tmKeysHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px'
  },
  tmKeysTitle: {
    fontSize: '13px',
    fontWeight: 900,
    color: '#111827'
  },
  tmReviewBtn: {
    border: 'none',
    background: 'transparent',
    color: '#1565c0',
    fontWeight: 900,
    cursor: 'pointer'
  },
  tmChartBox: {
    marginTop: '10px',
    borderRadius: '10px',
    border: '1px solid rgba(13,71,161,0.12)',
    background: '#ffffff',
    padding: '10px'
  },
  tmChartArea: {
    height: '150px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    padding: '10px 70px 6px 10px',
    borderLeft: '2px solid rgba(21,101,192,0.55)',
    borderBottom: '2px solid rgba(21,101,192,0.55)',
    background: 'linear-gradient(180deg, #f7fbff 0%, #ffffff 60%)',
    borderRadius: '8px',
    position: 'relative',
    overflow: 'hidden'
  },
  tmZoneLine: {
    position: 'absolute',
    left: '10px',
    right: '70px',
    height: '1px',
    borderTop: '1px solid rgba(21,101,192,0.2)'
  },
  tmZoneLabel: {
    position: 'absolute',
    right: '10px',
    fontSize: '11px',
    fontWeight: 800,
    color: '#6b7280',
    background: 'rgba(255,255,255,0.85)',
    padding: '2px 6px',
    borderRadius: '5px',
    border: '1px solid rgba(0,0,0,0.06)'
  },
  tmBarCol: {
    width: '26px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  tmBarTrack: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'flex-end'
  },
  tmBarFill: {
    width: '100%',
    background: 'linear-gradient(180deg, rgba(140, 170, 255, 0.95), rgba(110, 140, 235, 0.95))',
    border: '1px solid rgba(63, 81, 181, 0.25)',
    borderRadius: '3px 3px 0 0',
    minHeight: '6px'
  },
  tmKeyTick: {
    marginTop: '6px',
    fontSize: '11px',
    fontWeight: 900,
    color: '#111827'
  }
};

export default ResultPage;