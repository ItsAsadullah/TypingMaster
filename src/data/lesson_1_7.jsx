// Lesson 1.7: Blind Typing Test

const wordLevels = [
  [
    "sad dad fad lad",
    "fall ask all add",
    "lass flask salsa",
    "jak dak lak fak"
  ],
  [
    "salad alaska dallas",
    "flask flask fall fall",
    "add all ask lass",
    "sad lad dad fad"
  ],
  [
    "alaska salad dallas flask",
    "add lass fall ask dad",
    "jak lak dak fak salsa",
    "fall fall lass lass add add"
  ],
  [
    "salad salad flask flask",
    "alaska dallas fall ask",
    "add all lass dad fad",
    "jak dak lak fak salsa"
  ],
  [
    "alaska salad flask fall",
    "add all ask lass dad fad jak",
    "salad flask alaska dallas",
    "fall lass add jak dak lak"
  ]
];

export const generateDrillLine = () => {
  const randomLevel = wordLevels[Math.floor(Math.random() * wordLevels.length)];
  return randomLevel[Math.floor(Math.random() * randomLevel.length)];
};

export const lesson_1_7 = {
  title: "Blind Typing Test: Home Row",
  generateDrillLine
};
