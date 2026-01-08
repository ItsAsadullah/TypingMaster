// লার্নিং ফেজের জন্য স্টেপ
export const learningSteps = [
  { char: 'a', finger: 'pinky', hand: 'left', hint: 'বাম হাতের কনিষ্ঠা (Left Pinky)' },
  { char: 's', finger: 'ring', hand: 'left', hint: 'বাম হাতের অনামিকা (Left Ring)' },
  { char: 'd', finger: 'middle', hand: 'left', hint: 'বাম হাতের মধ্যমা (Left Middle)' },
  { char: 'f', finger: 'index', hand: 'left', hint: 'বাম হাতের তর্জনী (Left Index)' },
  { char: ' ', finger: 'thumb', hand: 'right', hint: 'বৃদ্ধাঙ্গুলি (Thumb)' },
  { char: 'j', finger: 'index', hand: 'right', hint: 'ডান হাতের তর্জনী (Right Index)' },
  { char: 'k', finger: 'middle', hand: 'right', hint: 'ডান হাতের মধ্যমা (Right Middle)' },
  { char: 'l', finger: 'ring', hand: 'right', hint: 'ডান হাতের অনামিকা (Right Ring)' },
  { char: ';', finger: 'pinky', hand: 'right', hint: 'ডান হাতের কনিষ্ঠা (Right Pinky)' }
];

// লেভেল ভিত্তিক ড্রিল প্যাটার্ন (Easy -> Hard)
const drillLevels = [
  // Level 0: Basic Repetition (সবচেয়ে সহজ)
  [
    "aaaa ssss dddd ffff",
    "jjjj kkkk llll ;;;;",
    "asdf jkl; asdf jkl;",
    "aaaa ;;;; ssss llll"
  ],
  // Level 1: Doubles & Simple Rhythm (ছন্দ মিলিয়ে)
  [
    "aa ss dd ff jj kk ll ;;",
    "as as df df jk jk l; l;",
    "aj aj sk sk dl dl f; f;",
    "a s d f j k l ;"
  ],
  // Level 2: Simple Words (উচ্চারণযোগ্য শব্দ)
  [
    "sad sad dad dad fad fad",
    "fall fall lad lad lass lass",
    "add add all all ask ask",
    "jak jak dak dak lak lak",
    "flask flask salsa salsa"
  ],
  // Level 3: Mixed & Tricky (একটু কঠিন)
  [
    "ajsk dlf; ajsk dlf;",
    "fjdk slja fjdk slja",
    "ksjd fl;a ksjd fl;a",
    "jfkd ls;a jfkd ls;a"
  ],
  // Level 4: Expert Random (পুরোপুরি র‍্যান্ডম)
  [
    "afa jaj sks ldl ;a;",
    "asdf ;lkj fdsa jkl;",
    "aj sk dl f; aj sk dl f;",
    "askl ;dfj sadj fakl"
  ]
];

// ড্রিল জেনারেটর (লেভেল অনুযায়ী)
export const generateDrillLine = (completedLines = 0) => {
  // প্রতি ৩ লাইন পর পর লেভেল বাড়বে
  const levelIndex = Math.min(Math.floor(completedLines / 3), drillLevels.length - 1);
  const patterns = drillLevels[levelIndex];
  
  // সেই লেভেলের একটি র‍্যান্ডম লাইন রিটার্ন করবে
  return patterns[Math.floor(Math.random() * patterns.length)];
};