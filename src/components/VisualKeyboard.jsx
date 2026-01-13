import React from 'react';

const VisualKeyboard = ({ activeKey, pressedKey, isCorrect, wrongKey }) => {
  const targetKey = activeKey?.toLowerCase() || '';
  const userKey = pressedKey?.toLowerCase() || '';
  const errorKey = wrongKey?.toLowerCase() || '';

  // ফুল কিবোর্ড লেআউট
  const rows = [
    [
      { k: '`', w: 1 }, { k: '1', w: 1 }, { k: '2', w: 1 }, { k: '3', w: 1 }, { k: '4', w: 1 }, { k: '5', w: 1 }, { k: '6', w: 1 }, { k: '7', w: 1 }, { k: '8', w: 1 }, { k: '9', w: 1 }, { k: '0', w: 1 }, { k: '-', w: 1 }, { k: '=', w: 1 }, { k: 'Backspace', w: 2, l: '←' }
    ],
    [
      { k: 'Tab', w: 1.5, l: 'Tab' }, { k: 'q', w: 1 }, { k: 'w', w: 1 }, { k: 'e', w: 1 }, { k: 'r', w: 1 }, { k: 't', w: 1 }, { k: 'y', w: 1 }, { k: 'u', w: 1 }, { k: 'i', w: 1 }, { k: 'o', w: 1 }, { k: 'p', w: 1 }, { k: '[', w: 1 }, { k: ']', w: 1 }, { k: '\\', w: 1.5 }
    ],
    [
      { k: 'CapsLock', w: 1.8, l: 'Caps' }, { k: 'a', w: 1 }, { k: 's', w: 1 }, { k: 'd', w: 1 }, { k: 'f', w: 1 }, { k: 'g', w: 1 }, { k: 'h', w: 1 }, { k: 'j', w: 1 }, { k: 'k', w: 1 }, { k: 'l', w: 1 }, { k: ';', w: 1 }, { k: "'", w: 1 }, { k: 'Enter', w: 2.2, l: 'Enter' }
    ],
    [
      { k: 'Shift', w: 2.4, l: 'Shift' }, { k: 'z', w: 1 }, { k: 'x', w: 1 }, { k: 'c', w: 1 }, { k: 'v', w: 1 }, { k: 'b', w: 1 }, { k: 'n', w: 1 }, { k: 'm', w: 1 }, { k: ',', w: 1 }, { k: '.', w: 1 }, { k: '/', w: 1 }, { k: 'Shift', w: 2.4, l: 'Shift' }
    ],
    [
      { k: 'Ctrl', w: 1.5 }, { k: 'Win', w: 1.2, l: '❖' }, { k: 'Alt', w: 1.2 }, { k: 'Space', w: 6, l: '' }, { k: 'Alt', w: 1.2 }, { k: 'Win', w: 1.2, l: '❖' }, { k: 'Menu', w: 1.2, l: '≡' }, { k: 'Ctrl', w: 1.5 }
    ]
  ];

  // Key matching helper - special keys handle
  const matchKey = (keyboardKey, checkKey) => {
    if (!checkKey) return false;
    const k = keyboardKey.toLowerCase();
    const c = checkKey.toLowerCase();
    
    // Space key
    if ((k === 'space' || k === ' ') && (c === 'space' || c === ' ')) return true;
    // Backspace
    if (k === 'backspace' && c === 'backspace') return true;
    // Enter
    if (k === 'enter' && (c === 'enter' || c === '\n')) return true;
    // Tab
    if (k === 'tab' && (c === 'tab' || c === '\t')) return true;
    // Caps Lock
    if (k === 'capslock' && c === 'capslock') return true;
    // Shift
    if (k === 'shift' && c === 'shift') return true;
    // Ctrl
    if (k === 'ctrl' && c === 'ctrl') return true;
    // Alt
    if (k === 'alt' && c === 'alt') return true;
    // Regular keys
    return k === c;
  };

  // কি কালার লজিক
  const getKeyStyle = (keyLabel) => {
    // ১. ভুল কী - Red থাকবে যতক্ষণ সঠিক না চাপে
    if (errorKey && matchKey(keyLabel, errorKey)) {
      return { bg: '#ef5350', border: '#c62828', color: '#fff' };
    }
    
    // ২. টার্গেট কি (যেটা চাপতে হবে) - নীল বর্ডার/হালকা নীল
    if (matchKey(keyLabel, targetKey)) {
      return { bg: '#e3f2fd', border: '#1e88e5', color: '#1565c0' };
    }

    // ৩. ইউজার যেটা চেপেছে (flash effect)
    if (userKey && matchKey(keyLabel, userKey)) {
      if (isCorrect) {
        return { bg: '#2ecc71', border: '#27ae60', color: '#fff' }; // সঠিক হলে সবুজ
      } else {
        return { bg: '#ef5350', border: '#c62828', color: '#fff' }; // ভুল হলে লাল
      }
    }

    // ৪. সাধারণ অবস্থা
    return { bg: '#fff', border: '#ccc', color: '#444' };
  };

  return (
    <div style={styles.container}>
      <div style={styles.keyboard}>
        {rows.map((row, rIndex) => (
          <div key={rIndex} style={styles.row}>
            {row.map((keyObj, kIndex) => {
              const style = getKeyStyle(keyObj.k);
              return (
                <div
                  key={kIndex}
                  style={{
                    ...styles.key,
                    flex: keyObj.w,
                    background: style.bg,
                    color: style.color,
                    border: `1px solid ${style.border}`,
                    boxShadow: style.bg === '#fff' ? '0 3px 0 #bbb' : 'none',
                    transform: style.bg !== '#fff' ? 'translateY(2px)' : 'none'
                  }}
                >
                  {keyObj.l !== undefined ? keyObj.l : keyObj.k.toUpperCase()}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { marginTop: '20px', display: 'flex', justifyContent: 'center', width: '100%' },
  keyboard: { background: '#e0e0e0', padding: '10px', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '5px', width: '100%', maxWidth: '850px' },
  row: { display: 'flex', gap: '5px', justifyContent: 'center' },
  key: { height: '40px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', border: '1px solid #ccc', cursor: 'default', transition: 'all 0.1s' }
};

export default VisualKeyboard;