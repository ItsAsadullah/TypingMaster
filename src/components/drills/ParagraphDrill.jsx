import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaArrowLeft, FaForward, FaClock, FaBullseye, FaExclamationTriangle, FaChartLine } from 'react-icons/fa';
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

  @keyframes blink { 50% { opacity: 0; } }
  .blinking-cursor { animation: blink 1s step-end infinite; border-left: 2px solid #0d47a1; margin-left: 1px; display: inline-block; height: 1.2em; vertical-align: text-bottom; }

  @media (max-width: 980px) {
    .tm-body {
      flex-direction: column !important;
    }
  }

  /* TypingMaster style: wrong words in input area */
  .tm-typedwrap{ position: relative; width: 100%; }
  .tm-typed-highlight{
    width: 100%;
    min-height: 90px;
    max-height: 180px;
    overflow-y: auto;
    padding: 10px 12px;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    background: #fff;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    font-size: 20px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: anywhere;
    box-sizing: border-box;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.08);
    pointer-events: none;
  }
  .tm-typed-highlight .tm-wrongword { color:#d32f2f; font-weight:800; text-decoration: underline; }
  .tm-typed-highlight .tm-okword { color:#111827; }

  /* real textarea: transparent text; caret visible */
  .tm-typedarea{
    position: absolute;
    inset: 0;
    width: 100%;
    min-height: 90px;
    max-height: 180px;
    resize: none;
    overflow-y: auto;
    padding: 10px 12px;
    border-radius: 6px;
    border: 1px solid transparent; /* border comes from highlight layer */
    background: transparent;
    color: transparent;
  caret-color: transparent;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    font-size: 20px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: anywhere;
    box-sizing: border-box;
  }
  .tm-typedarea:focus{ outline:none; }

  .tm-typedarea .tm-wrongword { color: #d32f2f; font-weight: 800; text-decoration: underline; }

  /* keep preview line (optional) */
  .tm-typed-preview { white-space: pre-wrap; }

  /* Caret placeholder rendered in highlight layer */
  .tm-caret {
    display: inline-block;
    width: 0;
    border-left: 2px solid #0d47a1;
    height: 1.2em;
    vertical-align: text-bottom;
    margin-left: 1px;
    animation: blink 1s step-end infinite;
  }
  
  /* Current word highlight in reference */
  .tm-current-word { 
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    border-radius: 4px;
    padding: 2px 4px;
    color: #1565c0;
    font-weight: 700;
  }
  
  /* Completed words in reference */
  .tm-completed-word { color: #9e9e9e; }
  .tm-pending-word { color: #374151; }
  
  /* History area for completed paragraphs */
  .tm-history-area {
    max-height: 120px;
    overflow-y: auto;
    padding: 8px 12px;
    background: #f5f5f5;
    border-radius: 6px;
    margin-bottom: 8px;
    font-size: 16px;
    line-height: 1.6;
    color: #666;
  }
`;

const ParagraphDrill = ({
  paragraphText = [],
  onComplete,
  onBack,
  minWpm = 10,
  module,
  drillName = 'Paragraph Drill'
}) => {
  const [phase, setPhase] = useState('settings');
  
  // Settings
  const [selectedTime, setSelectedTime] = useState(5);
  const [accuracyGoal, setAccuracyGoal] = useState(96);
  
  // Drill State
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState("");
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const currentParagraphIndexRef = useRef(0);
  const isLoadingNextRef = useRef(false);
  
  // Typing Master 12 Style States
  const [currentLineIndex, setCurrentLineIndex] = useState(0); // বর্তমান লাইন
  const [currentWordIndex, setCurrentWordIndex] = useState(0); // বর্তমান শব্দ (লাইনের মধ্যে)
  const [currentTyping, setCurrentTyping] = useState(''); // বর্তমান টাইপিং (শব্দ শেষ হওয়ার আগে)
  const [completedWords, setCompletedWords] = useState([]); // বর্তমান লাইনের সম্পন্ন শব্দগুলো { word, correct }
  const [typedHistory, setTypedHistory] = useState([]); // সম্পন্ন লাইনগুলোর হিস্টোরি (টাইপিং এরিয়ায় দেখানোর জন্য)
  const [parsedLines, setParsedLines] = useState([]); // প্যারাগ্রাফ থেকে পার্স করা লাইন ও শব্দ
  
  const [input, setInput] = useState('');
  const [stats, setStats] = useState({ mistakes: 0, totalTyped: 0, correctWords: 0, wrongWords: 0 });
  const [keyStats, setKeyStats] = useState({});
  
  const [isCorrect, setIsCorrect] = useState(true);
  const [shake, setShake] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("শুরু করা যাক!");
  const [errorMsg, setErrorMsg] = useState("");
  const [currentWpm, setCurrentWpm] = useState(0);
  const [wrongKey, setWrongKey] = useState(null);
  
  // Visuals for keyboard and hands
  const [pressedKey, setPressedKey] = useState(null);

  const inputRef = useRef(null);
  const activeCharRef = useRef(null);
  const inputEndRef = useRef(null);
  const typedHighlightRef = useRef(null);
  const historyEndRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef(null);

  // Visible typing textarea ref
  const typingAreaRef = useRef(null);

  // Finger mapping helper
  const getFingerForKey = (key) => {
    const upperKey = (key || '').toUpperCase();
    const leftHand = {
      'A': 'left-pinky', 'Q': 'left-pinky', 'Z': 'left-pinky', '1': 'left-pinky',
      'S': 'left-ring', 'W': 'left-ring', 'X': 'left-ring', '2': 'left-ring',
      'D': 'left-middle', 'E': 'left-middle', 'C': 'left-middle', '3': 'left-middle',
      'F': 'left-index', 'R': 'left-index', 'T': 'left-index', 'G': 'left-index',
      'V': 'left-index', 'B': 'left-index', '4': 'left-index', '5': 'left-index',
    };
    const rightHand = {
      'J': 'right-index', 'U': 'right-index', 'Y': 'right-index', 'H': 'right-index',
      'N': 'right-index', 'M': 'right-index', '6': 'right-index', '7': 'right-index',
      'K': 'right-middle', 'I': 'right-middle', ',': 'right-middle', '8': 'right-middle',
      'L': 'right-ring', 'O': 'right-ring', '.': 'right-ring', '9': 'right-ring',
      ';': 'right-pinky', 'P': 'right-pinky', '/': 'right-pinky', '0': 'right-pinky',
      "'": 'right-pinky', '-': 'right-pinky', '[': 'right-pinky', ']': 'right-pinky',
    };
    // Special keys
    if (key === ' ') return 'thumb';
    if (key === '\n') return 'right-pinky';
    if (key === 'Enter') return 'right-pinky';
    if (key === 'Backspace') return 'right-pinky';
    if (key === 'Tab') return 'left-pinky';
    
    return leftHand[upperKey] || rightHand[upperKey] || null;
  };

  // প্যারাগ্রাফ টেক্সট থেকে লাইন এবং শব্দ পার্স করা
  const parseParagraphToLines = useCallback((text) => {
    if (!text) return [];
    const lines = text.split('\n').filter(line => line.trim() !== '');
    return lines.map(line => ({
      text: line,
      words: line.split(/\s+/).filter(w => w.length > 0)
    }));
  }, []);

  const resetForNewParagraph = () => {
    setInput('');
    setCurrentTyping('');
    setCompletedWords([]);
    setTypedHistory([]);
    setCurrentLineIndex(0);
    setCurrentWordIndex(0);
    setIsCorrect(true);
    setErrorMsg('');
  };

  const loadParagraphByIndex = (index) => {
    const list = Array.isArray(paragraphText) ? paragraphText : [];
    if (list.length === 0) {
      const defaultText = 'This is a sample paragraph.\nType carefully and press Enter to move to the next line.';
      setCurrentParagraph(defaultText);
      setParsedLines(parseParagraphToLines(defaultText));
      resetForNewParagraph();
      return;
    }

    const safeIndex = Math.min(Math.max(index, 0), list.length - 1);
    setCurrentParagraphIndex(safeIndex);
    currentParagraphIndexRef.current = safeIndex;
    const paragraphStr = String(list[safeIndex] ?? '');
    setCurrentParagraph(paragraphStr);
    setParsedLines(parseParagraphToLines(paragraphStr));
    resetForNewParagraph();
  };

  const loadNextParagraph = () => {
    const list = Array.isArray(paragraphText) ? paragraphText : [];
    if (list.length === 0) {
      loadParagraphByIndex(0);
      return;
    }

    // Loop through paragraphs until time is up
    const nextIndex = (currentParagraphIndexRef.current + 1) % list.length;
    loadParagraphByIndex(nextIndex);
  };

  // বর্তমান প্রত্যাশিত শব্দ পাওয়া
  const getCurrentExpectedWord = useCallback(() => {
    if (parsedLines.length === 0) return '';
    if (currentLineIndex >= parsedLines.length) return '';
    const currentLine = parsedLines[currentLineIndex];
    if (!currentLine || currentWordIndex >= currentLine.words.length) return '';
    return currentLine.words[currentWordIndex];
  }, [parsedLines, currentLineIndex, currentWordIndex]);

  // লাইন শেষ কিনা চেক করা (সব শব্দ টাইপ হয়ে গেছে)
  const isEndOfLine = useCallback(() => {
    if (parsedLines.length === 0) return false;
    if (currentLineIndex >= parsedLines.length) return false;
    const currentLine = parsedLines[currentLineIndex];
    return currentWordIndex >= currentLine.words.length;
  }, [parsedLines, currentLineIndex, currentWordIndex]);

  // সব প্যারাগ্রাফ শেষ কিনা চেক করা
  const isEndOfParagraph = useCallback(() => {
    if (parsedLines.length === 0) return false;
    return currentLineIndex >= parsedLines.length;
  }, [parsedLines, currentLineIndex]);

  // বর্তমান লাইনের শেষ শব্দ কিনা চেক করা
  const isLastWordOfLine = useCallback(() => {
    if (parsedLines.length === 0) return false;
    if (currentLineIndex >= parsedLines.length) return false;
    const currentLine = parsedLines[currentLineIndex];
    return currentWordIndex === currentLine.words.length - 1;
  }, [parsedLines, currentLineIndex, currentWordIndex]);

  // প্রত্যাশিত পরবর্তী অক্ষর (keyboard highlight এর জন্য)
  const getNextExpectedChar = useCallback(() => {
    const expectedWord = getCurrentExpectedWord();
    if (isEndOfLine()) return 'Enter';
    if (!expectedWord) return '';
    
    const typedLen = currentTyping.length;
    if (typedLen < expectedWord.length) {
      return expectedWord[typedLen];
    }
    // শব্দ শেষ হলে - লাইনের শেষ শব্দ হলে Enter, নাহলে Space
    return isLastWordOfLine() ? 'Enter' : ' ';
  }, [getCurrentExpectedWord, isEndOfLine, isLastWordOfLine, currentTyping]);

  useEffect(() => {
    if (phase === 'drill' && parsedLines.length === 0) {
      loadParagraphByIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Real-time WPM calculation
  useEffect(() => {
    if (phase !== 'drill') return;
    const elapsedMinutes = timeElapsed / 60;
    if (elapsedMinutes > 0 && stats.totalTyped > 0) {
      const wpm = Math.round((stats.totalTyped / 5) / elapsedMinutes);
      setCurrentWpm(wpm);
    } else {
      setCurrentWpm(0);
    }
  }, [phase, timeElapsed, stats.totalTyped]);

  // Auto focus (focus visible textarea)
  useEffect(() => {
    if (phase === 'drill') {
      const focusInterval = setInterval(() => {
        const el = typingAreaRef.current;
        if (el && document.activeElement !== el) el.focus();
      }, 100);
      return () => clearInterval(focusInterval);
    }
  }, [phase]);

  // Auto-scroll history to bottom
  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [completedWords, typedHistory]);

  // Scroll highlight layer to bottom as user types
  useEffect(() => {
    const el = typedHighlightRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [input, currentTyping, completedWords, typedHistory]);

  // Key event handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'];
      if (scrollKeys.includes(e.key)) e.preventDefault();

      // key highlight
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

    const preventWheel = (e) => e.preventDefault();
    const preventTouch = (e) => {
      if (e.touches.length > 1) e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('wheel', preventWheel, { passive: false });
    window.addEventListener('touchmove', preventTouch, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('wheel', preventWheel);
      window.removeEventListener('touchmove', preventTouch);
    };
  }, [phase, isPaused]);

  // শব্দ সম্পন্ন করা (Space প্রেসে - মাঝের শব্দগুলোর জন্য)
  const completeCurrentWord = useCallback((addSpace = true) => {
    const expectedWord = getCurrentExpectedWord();
    const typedWord = currentTyping.trim();
    const isMatch = typedWord === expectedWord;
    
    // Stats আপডেট
    setStats(prev => ({
      ...prev,
      totalTyped: prev.totalTyped + typedWord.length,
      correctWords: prev.correctWords + (isMatch ? 1 : 0),
      wrongWords: prev.wrongWords + (isMatch ? 0 : 1),
      mistakes: prev.mistakes + (isMatch ? 0 : 1)
    }));

    // সম্পন্ন শব্দ তালিকায় যোগ
    setCompletedWords(prev => [...prev, { 
      word: typedWord, 
      expected: expectedWord,
      correct: isMatch 
    }]);

    // পরবর্তী শব্দে যাওয়া
    setCurrentTyping('');
    setCurrentWordIndex(prev => prev + 1);
    
    if (!isMatch) {
      setShake(true);
      setTimeout(() => setShake(false), 300);
      setWrongKey(null);
    }
    
    setIsCorrect(isMatch);
  }, [getCurrentExpectedWord, currentTyping]);

  // লাইন সম্পন্ন করা (Enter প্রেসে)
  const completeCurrentLine = useCallback(() => {
    // যদি এখনো শব্দ টাইপ হচ্ছে, আগে সেটা শেষ করা
    let lineWords = [...completedWords];
    
    if (currentTyping.trim().length > 0) {
      const expectedWord = getCurrentExpectedWord();
      const typedWord = currentTyping.trim();
      const isMatch = typedWord === expectedWord;
      
      setStats(prev => ({
        ...prev,
        totalTyped: prev.totalTyped + typedWord.length,
        correctWords: prev.correctWords + (isMatch ? 1 : 0),
        wrongWords: prev.wrongWords + (isMatch ? 0 : 1),
        mistakes: prev.mistakes + (isMatch ? 0 : 1)
      }));

      lineWords.push({ 
        word: typedWord, 
        expected: expectedWord,
        correct: isMatch 
      });
    }

    // টাইপিং হিস্টোরিতে এই লাইন যোগ করা
    setTypedHistory(prev => [...prev, {
      lineIndex: currentLineIndex,
      words: lineWords
    }]);

    // পরবর্তী লাইনে যাওয়া
    setCurrentLineIndex(prev => prev + 1);
    setCurrentWordIndex(0);
    setCurrentTyping('');
    setCompletedWords([]);
    
    // চেক করা সব লাইন শেষ কিনা
    if (currentLineIndex + 1 >= parsedLines.length) {
      // প্যারাগ্রাফ শেষ, পরবর্তীটি লোড করা
      if (isLoadingNextRef.current) return;
      // drill phase ছাড়া auto-advance করবে না
      if (phase !== 'drill') return;
      if (isPaused) return;

      isLoadingNextRef.current = true;
      setFeedbackMsg('✅ প্যারাগ্রাফ সম্পন্ন! পরবর্তী আসছে...');
      setTimeout(() => {
        // drill phase ছাড়া advance করবে না
        if (isPaused || phase !== 'drill') {
          isLoadingNextRef.current = false;
          return;
        }
        loadNextParagraph();
        setFeedbackMsg('চালিয়ে যান!');
        isLoadingNextRef.current = false;
      }, 300);
    }
  }, [currentTyping, completedWords, getCurrentExpectedWord, currentLineIndex, parsedLines.length, phase, isPaused]);

  // Input change handler - Typing Master 12 স্টাইল
  const handleInputChange = (e) => {
    const value = e.target.value;
    const lastChar = value.slice(-1);
    
    lastActivityRef.current = Date.now();

    // Backspace handling - শুধু বর্তমান শব্দের মধ্যে
    if (value.length < input.length) {
      // Allow backspace within current word only
      const newTyping = currentTyping.slice(0, -1);
      setCurrentTyping(newTyping);
      setInput(value);
      return;
    }

    setInput(value);

    // Enter প্রেস - লাইনের শেষে (শেষ শব্দের পরে বা isEndOfLine হলে)
    if (lastChar === '\n' || e.nativeEvent.inputType === 'insertLineBreak') {
      return; // handleKeyDown এ handle হবে
    }

    // Space প্রেস
    if (lastChar === ' ') {
      if (currentTyping.length > 0) {
        // লাইনের শেষ শব্দ হলে Space ignore করা - Enter দরকার
        if (isLastWordOfLine()) {
          return;
        }
        completeCurrentWord(true);
      }
      return;
    }

    // সাধারণ অক্ষর টাইপ
    setCurrentTyping(prev => prev + lastChar);
  };

  // Keyboard event handler for special keys
  const handleKeyDown = (e) => {
    if (isPaused) return;

    // Enter key handling - লাইনের শেষ শব্দ টাইপ করার পর
    if (e.key === 'Enter') {
      e.preventDefault();
      // শেষ শব্দ টাইপ হয়ে গেলে বা সব শব্দ শেষ হলে
      if (isLastWordOfLine() && currentTyping.length > 0) {
        completeCurrentLine();
      } else if (isEndOfLine()) {
        completeCurrentLine();
      }
    }

    // Space key handling - মাঝের শব্দগুলোর জন্য
    if (e.key === ' ') {
      e.preventDefault();
      if (currentTyping.length > 0 && !isLastWordOfLine()) {
        completeCurrentWord(true);
        setInput(prev => prev + ' ');
      }
    }
  };

  // রেফারেন্স টেক্সট রেন্ডার (তিনটি লাইন দেখাবে - বর্তমান + পরের দুটি)
  const renderReferenceText = () => {
    if (parsedLines.length === 0) return null;
    if (currentLineIndex >= parsedLines.length) return <span className="tm-completed-word">সম্পন্ন!</span>;

    // তিনটি লাইন দেখানো - বর্তমান এবং পরের দুটি
    const linesToShow = [];
    for (let i = currentLineIndex; i < Math.min(currentLineIndex + 3, parsedLines.length); i++) {
      linesToShow.push({ line: parsedLines[i], index: i });
    }

    return (
      <>
        {linesToShow.map(({ line, index }, lineIdx) => {
          const isCurrentLine = index === currentLineIndex;
          
          return (
            <div key={index} style={{ 
              marginBottom: '8px',
              opacity: isCurrentLine ? 1 : 0.6
            }}>
              {line.words.map((word, wordIdx) => {
                let className = 'tm-pending-word';
                let style = { marginRight: '8px', display: 'inline' };
                
                if (isCurrentLine) {
                  if (wordIdx < currentWordIndex) {
                    // সম্পন্ন শব্দ
                    className = 'tm-completed-word';
                  } else if (wordIdx === currentWordIndex) {
                    // বর্তমান শব্দ - হাইলাইট
                    className = 'tm-current-word';
                  }
                }

                return (
                  <span key={wordIdx} className={className} style={style}>
                    {word}
                  </span>
                );
              })}
              {/* প্রতিটি লাইনের শেষে Enter চিহ্ন */}
              <span style={{
                display: 'inline-block',
                color: isCurrentLine && isEndOfLine() ? '#1565c0' : '#9e9e9e',
                fontWeight: isCurrentLine && isEndOfLine() ? 'bold' : 'normal',
                fontSize: '16px',
                marginLeft: '4px',
                background: isCurrentLine && isEndOfLine() ? '#e3f2fd' : 'transparent',
                padding: isCurrentLine && isEndOfLine() ? '2px 6px' : '0',
                borderRadius: '4px'
              }}>
                ↵
              </span>
            </div>
          );
        })}
      </>
    );
  };

  // টাইপ করা টেক্সট রেন্ডার (হিস্টোরি + বর্তমান লাইন)
  const renderTypedText = () => {
    return (
      <>
        {/* হিস্টোরি - আগের সম্পন্ন লাইনগুলো */}
        {typedHistory.map((historyLine, lineIdx) => (
          <div key={lineIdx} style={{ marginBottom: '4px' }}>
            {historyLine.words.map((item, idx) => (
              <span 
                key={idx}
                className={item.correct ? 'tm-okword' : 'tm-wrongword'}
                style={{ marginRight: '6px' }}
              >
                {item.word}
              </span>
            ))}
            <span style={{
              display: 'inline-block',
              color: '#9e9e9e',
              fontWeight: 700,
              fontSize: '16px',
              marginLeft: '2px'
            }}>
              ↵
            </span>
          </div>
        ))}
        
        {/* বর্তমান লাইন */}
        <div>
          {/* বর্তমান লাইনের সম্পন্ন শব্দগুলো */}
          {completedWords.map((item, idx) => (
            <span 
              key={idx}
              className={item.correct ? 'tm-okword' : 'tm-wrongword'}
              style={{ marginRight: '6px' }}
            >
              {item.word}
            </span>
          ))}
          {/* বর্তমান টাইপিং */}
          <span style={{ color: '#333' }}>{currentTyping}</span>
          {/* যদি লাইন শেষ হয়ে যায়, caret-এর আগে Enter marker দেখাও */}
          {isEndOfLine() && (
            <span style={{
              display: 'inline-block',
              color: '#1565c0',
              fontWeight: 800,
              fontSize: '16px',
              marginLeft: '2px',
              background: '#e3f2fd',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              ↵
            </span>
          )}
          <span ref={inputEndRef} className="tm-caret" />
        </div>
      </>
    );
  };

  const handleStartDrill = () => {
    setPhase('drill');
    setTimeLeft(selectedTime * 60);
    setTimeElapsed(0);
    setStats({ mistakes: 0, totalTyped: 0, correctWords: 0, wrongWords: 0 });
    setKeyStats({});
    setInput('');
    setCurrentTyping('');
    setCompletedWords([]);
    setTypedHistory([]);
    setCurrentParagraph('');
    setCurrentParagraphIndex(0);
    setCurrentLineIndex(0);
    setCurrentWordIndex(0);
    currentParagraphIndexRef.current = 0;
    isLoadingNextRef.current = false;
    setParsedLines([]);
    loadParagraphByIndex(0);
  };

  const handlePause = () => setIsPaused(!isPaused);

  const handleSkip = () => {
    if (window.confirm('আপনি কি নিশ্চিত এই ড্রিল এড়িয়ে যেতে চান?')) {
      setPhase('result');
    }
  };

  const handleRestart = () => {
    setPhase('settings');
    setStats({ mistakes: 0, totalTyped: 0, correctWords: 0, wrongWords: 0 });
    setKeyStats({});
    setInput('');
    setCurrentTyping('');
    setCompletedWords([]);
    setTypedHistory([]);
    setCurrentParagraph('');
    setCurrentParagraphIndex(0);
    setCurrentLineIndex(0);
    setCurrentWordIndex(0);
    currentParagraphIndexRef.current = 0;
    isLoadingNextRef.current = false;
    setParsedLines([]);
  };

  // Result calculations
  const accuracy = stats.totalTyped > 0 ? Math.round(((stats.totalTyped - stats.mistakes) / stats.totalTyped) * 100) : 0;
  const currentAcc = stats.totalTyped > 0 ? Math.round(((stats.totalTyped - stats.mistakes) / stats.totalTyped) * 100) : 0;

  // প্রত্যাশিত পরবর্তী কী (keyboard এ দেখানোর জন্য)
  const nextExpectedKey = getNextExpectedChar();

  return (
    <div style={styles.drillContainer}>
      <style>{shakeStyle}</style>

      {/* SETTINGS PHASE */}
      {phase === 'settings' && (
        <div style={styles.settingsCard}>
          <button onClick={onBack} style={styles.backBtn}>
            <FaArrowLeft /> ফিরে যান
          </button>

          <h2 style={{color: '#1565c0', borderBottom: '2px solid #eee', paddingBottom: '10px'}}>প্যারাগ্রাফ ড্রিল সেটিংস</h2>

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
            ড্রিল শুরু করুন <FaForward style={{marginLeft: '8px'}}/>
          </button>
        </div>
      )}

      {/* DRILL PHASE */}
      {phase === 'drill' && (
        <div style={styles.tmShell}>
          <div style={styles.tmPage}>
            <div className="tm-body" style={styles.tmBody}>
              {/* Main typing panel */}
              <div style={styles.tmMain}>
                {/* রেফারেন্স টেক্সট - তিনটি লাইন */}
                <div style={styles.tmTextCard}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                    লাইন {currentLineIndex + 1} / {parsedLines.length} | প্যারাগ্রাফ {currentParagraphIndex + 1}
                  </div>
                  <div style={{ fontSize: '22px', lineHeight: '1.8' }}>
                    {renderReferenceText()}
                  </div>
                </div>

                {/* বিভাজক রেখা */}
                <div style={{ 
                  width: '100%', 
                  height: '1px', 
                  background: 'linear-gradient(to right, transparent, #ccc, transparent)',
                  margin: '5px 0'
                }} />

                {/* টাইপিং এরিয়া - ইউজার যা টাইপ করছে (উপরে টাইপ করা, নিচে নতুন) */}
                <div className="tm-typedwrap">
                  <div ref={typedHighlightRef} style={styles.tmInputCard} className="tm-typed-highlight">
                    {renderTypedText()}
                  </div>

                  <textarea
                    ref={typingAreaRef}
                    className={`tm-typedarea ${shake ? 'shake-anim' : ''}`}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={isPaused}
                    rows={3}
                    spellCheck="false"
                    autoFocus
                  />
                </div>

                <div style={styles.tmHintRow}>
                  <span style={styles.tmHintDot} />
                  <span style={styles.tmHintText}>
                    {isLastWordOfLine() && currentTyping.length > 0 
                      ? 'Enter চাপুন পরবর্তী লাইনে যেতে' 
                      : isEndOfLine() 
                        ? 'Enter চাপুন পরবর্তী লাইনে যেতে'
                        : 'Space চাপুন শব্দ শেষ করতে'}
                  </span>
                </div>

                <div style={styles.tmKeyboardWrap}>
                  <VisualKeyboard
                    pressedKey={pressedKey}
                    activeKey={nextExpectedKey === 'Enter' ? 'Enter' : (nextExpectedKey === ' ' ? 'Space' : nextExpectedKey)}
                    isCorrect={isCorrect}
                    wrongKey={wrongKey}
                  />
                </div>

                <div style={styles.tmHandsWrap}>
                  <div style={styles.tmHandScale}>
                    <HandGuide
                      activeFinger={getFingerForKey(nextExpectedKey || '')}
                      hand="left"
                      targetKey={nextExpectedKey}
                    />
                  </div>
                  <div style={styles.tmHandScale}>
                    <HandGuide
                      activeFinger={getFingerForKey(nextExpectedKey || '')}
                      hand="right"
                      targetKey={nextExpectedKey}
                    />
                  </div>
                </div>
              </div>

              <div style={styles.tmSidebarWrap}>
                <DrillSidebar
                  title="Your Progress"
                  module={module}
                  drillName={drillName}
                  progress={{ 
                    current: timeElapsed, 
                    total: selectedTime * 60
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
    background: '#1976d2',
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
  tmTextCard: {
    flex: '0 0 auto',
    minHeight: '140px',
    background: '#f7fbff',
    borderRadius: '10px',
    border: '1px solid rgba(13,71,161,0.12)',
    padding: '14px 16px',
    fontSize: '18px',
    lineHeight: '1.6',
    overflowY: 'auto',
    marginBottom: '5px'
  },
  tmInputCard: {
    width: '100%',
    minHeight: '80px',
    maxHeight: '160px',
    background: '#fff',
    borderRadius: '4px',
    border: '1px solid #ccc',
    padding: '10px 12px',
    marginBottom: '10px',
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: '20px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
    color: '#333',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
  },
  tmEnterMark: {
    display: 'inline-block',
    padding: '0 6px',
    borderRadius: '4px',
    fontWeight: 900
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
    background: '#8bc34a',
    display: 'inline-block',
    position: 'relative'
  },
  tmHintText: {
    fontWeight: 600
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
  tmHiddenInput: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '1px',
    height: '1px',
    opacity: 0,
    border: 'none',
    outline: 'none',
    resize: 'none',
    overflow: 'hidden'
  },
  // New Compact Drill Styles
  drillContent: {
    width: '98%',
    maxWidth: '1400px',
    height: '96vh',
    background: 'white',
    borderRadius: '12px',
    padding: '12px 16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    overflow: 'hidden',
    position: 'relative'
  },
  compactHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    background: '#f8f9fa',
    borderRadius: '8px',
    flexShrink: 0
  },
  statsRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  statBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    background: '#e3f2fd',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1565c0'
  },
  smallBtn: {
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: '6px',
    background: '#1976d2',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    gap: '12px',
    minHeight: 0,
    overflow: 'hidden'
  },
  textSection: {
    flex: '0 0 45%',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minHeight: 0
  },
  feedbackCompact: {
    padding: '8px 12px',
    background: 'linear-gradient(90deg, #e8f5e9, #fff)',
    borderLeft: '3px solid #4caf50',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#2e7d32',
    flexShrink: 0
  },
  paragraphBox: {
    flex: 1,
    fontSize: '18px',
    lineHeight: '1.7',
    padding: '12px',
    background: '#fafafa',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    overflow: 'hidden',
    letterSpacing: '0.5px'
  },
  visualSection: {
    flex: '0 0 53%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '8px'
  },
  handsRow: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    transform: 'scale(0.85)',
    transformOrigin: 'top center'
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255,255,255,0.95)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    borderRadius: '12px',
    zIndex: 100
  },
  resumeBtn: {
    padding: '10px 24px',
    background: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  // Keep old styles for compatibility
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
    minHeight: '300px'
  },
  feedbackBox: {
    padding: '12px',
    background: '#e8f5e9',
    borderLeft: '4px solid #4caf50',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2e7d32'
  },
  paragraphDisplay: {
    fontSize: '20px',
    lineHeight: '1.8',
    padding: '20px',
    background: '#fafafa',
    borderRadius: '8px',
    minHeight: '200px',
    letterSpacing: '1px',
    whiteSpace: 'pre-wrap'
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

export default ParagraphDrill;
