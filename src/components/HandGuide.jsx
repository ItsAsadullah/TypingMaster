import React from 'react';

const HandGuide = ({ activeFinger, hand, targetKey }) => {
  const isLeft = hand === 'left';

  // Key Mapping (নাম্বার সহ)
  const keyMap = isLeft ? {
    pinky: ['1', 'Q', 'A', 'Z'],
    ring: ['2', 'W', 'S', 'X'],
    middle: ['3', 'E', 'D', 'C'],
    index: ['4', '5', 'R', 'T', 'F', 'G', 'V', 'B'],
    thumb: ['Space']
  } : {
    thumb: ['Space'],
    index: ['6', '7', 'Y', 'U', 'H', 'J', 'N', 'M'],
    middle: ['8', 'I', 'K', ','],
    ring: ['9', 'O', 'L', '.'],
    pinky: ['0', 'P', ';', '/', "'", '-']
  };

  const isActiveFinger = (fingerName) => {
    if (!activeFinger) return false;
    return activeFinger.toLowerCase().includes(fingerName);
  };

  const isTargetKey = (key) => {
    if (!targetKey) return false;
    return key.toLowerCase() === targetKey.toLowerCase();
  };

  // স্টাইল
  const normalStyle = { fill: '#ffffff', stroke: '#333', strokeWidth: '2' };
  const activeStyle = { fill: '#fff59d', stroke: '#fbc02d', strokeWidth: '3' };
  const nailStyle = { fill: 'none', stroke: '#333', strokeWidth: '1', opacity: '0.4' };
  
  // টেক্সট হাইলাইট স্টাইল (ফন্ট সাইজ বাড়ানো হয়েছে)
  const normalTextStyle = { fill: '#555', fontSize: '11px', fontWeight: 'bold' };
  const targetTextStyle = { fill: '#d32f2f', fontSize: '14px', fontWeight: '900' };

  // Finger Component
  const Finger = ({ name, d, nailD, textX, textY, keys }) => {
    const active = isActiveFinger(name);
    return (
      <g>
        <path d={d} style={active ? activeStyle : normalStyle} />
        <path d={nailD} style={nailStyle} />
        
        <text 
          x={textX} 
          y={textY} 
          textAnchor="middle"
          style={{ pointerEvents: 'none' }}
        >
          {keys.map((k, i) => (
            <tspan 
              x={textX} 
              dy={i === 0 ? 0 : 13} // লাইন স্পেসিং বাড়ানো হয়েছে
              key={i}
              style={isTargetKey(k) ? targetTextStyle : normalTextStyle}
            >
              {k}
            </tspan>
          ))}
        </text>
      </g>
    );
  };

  return (
    <div style={{ margin: '0 10px', textAlign: 'center' }}>
      <svg width="240" height="300" viewBox="0 0 240 300">
        
        {/* ==================== বাম হাত (LEFT HAND) ==================== */}
        {isLeft && (
          <g transform="translate(10, 10)">
            {/* তালু (Palm Base) - ফিক্সড শেপ */}
            <path 
              d="M10,140 L10,220 Q30,260 120,260 L180,260 Q230,240 210,160" 
              fill="white" stroke="#333" strokeWidth="2"
            />
            {/* কবজি লাইন */}
            <path d="M40,260 L190,260" fill="none" stroke="#ddd" strokeWidth="2" strokeDasharray="4"/>

            {/* 1. Pinky (Leftmost) - তালুর সাথে মেলানো হয়েছে */}
            <Finger 
              name="pinky"
              d="M10,140 L10,70 Q10,50 25,50 L40,50 Q55,50 55,70 L55,140"
              nailD="M20,60 Q32,53 45,60"
              textX="32" textY="80" keys={keyMap.pinky}
            />

            {/* 2. Ring */}
            <Finger 
              name="ring"
              d="M60,140 L60,40 Q60,20 75,20 L90,20 Q105,20 105,40 L105,140"
              nailD="M70,30 Q82,23 95,30"
              textX="82" textY="50" keys={keyMap.ring}
            />

            {/* 3. Middle */}
            <Finger 
              name="middle"
              d="M110,140 L110,25 Q110,5 125,5 L140,5 Q155,5 155,25 L155,140"
              nailD="M120,15 Q132,8 145,15"
              textX="132" textY="35" keys={keyMap.middle}
            />

            {/* 4. Index */}
            <Finger 
              name="index"
              d="M160,140 L160,40 Q160,20 175,20 L190,20 Q205,20 205,40 L205,160"
              nailD="M170,30 Q182,23 195,30"
              textX="182" textY="50" keys={keyMap.index}
            />

            {/* 5. Thumb */}
            <Finger 
              name="thumb"
              d="M210,160 Q240,180 230,220 L190,230"
              nailD="M220,190 Q225,200 220,210"
              textX="215" textY="200" keys={keyMap.thumb}
            />
          </g>
        )}

        {/* ==================== ডান হাত (RIGHT HAND) ==================== */}
        {!isLeft && (
          <g transform="translate(0, 10)">
            {/* তালু (Palm Base) - ফিক্সড শেপ */}
            <path 
              d="M20,160 Q10,240 60,260 L200,260 Q230,240 220,140 L175,140" 
              fill="white" stroke="#333" strokeWidth="2"
            />
            {/* কবজি লাইন */}
            <path d="M60,260 L200,260" fill="none" stroke="#ddd" strokeWidth="2" strokeDasharray="4"/>

             {/* 1. Thumb */}
            <Finger 
              name="thumb"
              d="M20,160 Q-10,180 0,220 L40,230"
              nailD="M10,190 Q5,200 10,210"
              textX="15" textY="200" keys={keyMap.thumb}
            />

            {/* 2. Index */}
            <Finger 
              name="index"
              d="M25,160 L25,40 Q25,20 40,20 L55,20 Q70,20 70,40 L70,140"
              nailD="M35,30 Q47,23 60,30"
              textX="47" textY="50" keys={keyMap.index}
            />

            {/* 3. Middle */}
            <Finger 
              name="middle"
              d="M75,140 L75,25 Q75,5 90,5 L105,5 Q120,5 120,25 L120,140"
              nailD="M85,15 Q97,8 110,15"
              textX="97" textY="35" keys={keyMap.middle}
            />

            {/* 4. Ring */}
            <Finger 
              name="ring"
              d="M125,140 L125,40 Q125,20 140,20 L155,20 Q170,20 170,40 L170,140"
              nailD="M135,30 Q147,23 160,30"
              textX="147" textY="50" keys={keyMap.ring}
            />

            {/* 5. Pinky */}
            <Finger 
              name="pinky"
              d="M175,140 L175,70 Q175,50 190,50 L205,50 Q220,50 220,70 L220,140 Q240,160 220,260"
              nailD="M185,60 Q197,53 210,60"
              textX="197" textY="80" keys={keyMap.pinky}
            />
          </g>
        )}

      </svg>
      
      <div style={{ fontWeight: 'bold', color: '#555', marginTop: '5px' }}>
        {isLeft ? 'বাম হাত' : 'ডান হাত'}
      </div>
    </div>
  );
};

export default HandGuide;