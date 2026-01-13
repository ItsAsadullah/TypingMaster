// লেসন ১.৪ - ওয়ার্ড প্র্যাকটিস ড্রিল
// এখানে শুধু শব্দ-ভিত্তিক ড্রিল হবে (কোন লার্নিং ফেজ নেই)

const wordLevels = [
  // Level 0: সহজ ৩-৪ অক্ষরের শব্দ
  [
    "sad dad fad lad",
    "fall ask all add",
    "lass flask salsa",
    "jak dak lak fak"
  ],
  // Level 1: একটু বড় শব্দ
  [
    "salad alaska dallas",
    "flask flask fall fall",
    "add all ask lass",
    "sad lad dad fad"
  ],
  // Level 2: মিক্সড শব্দ
  [
    "alaska salad dallas flask",
    "add lass fall ask dad",
    "jak lak dak fak salsa",
    "fall fall lass lass add add"
  ],
  // Level 3: দ্রুত টাইপিং এর জন্য
  [
    "salad salad flask flask",
    "alaska dallas fall ask",
    "add all lass dad fad",
    "jak dak lak fak salsa"
  ],
  // Level 4: সব মিলিয়ে
  [
    "sad dad fad lad fall flask",
    "alaska salad dallas lass add",
    "ask all jak dak lak salsa",
    "fall fall add add ask ask"
  ]
];

// লাইন জেনারেট করার ফাংশন
export const generateDrillLine = () => {
  const randomLevel = wordLevels[Math.floor(Math.random() * wordLevels.length)];
  return randomLevel[Math.floor(Math.random() * randomLevel.length)];
};
