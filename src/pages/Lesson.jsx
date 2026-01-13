import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

// কম্পোনেন্ট ইম্পোর্ট
import InstructionDrill from '../components/drills/InstructionDrill';
import KeyDrill from '../components/drills/KeyDrill';
import WordDrill from '../components/drills/WordDrill';
import ParagraphDrill from '../components/drills/ParagraphDrill';
import BlindDrill from '../components/drills/BlindDrill';

// ডেটা ইম্পোর্ট
import { instructionSteps } from '../data/lesson_1_1';
import { learningSteps, generateDrillLine } from '../data/lesson_1_2';
import { resultInstructions } from '../data/lesson_1_3'; 
import { generateDrillLine as generateWordDrill } from '../data/lesson_1_4'; 
import { lesson_1_5 } from '../data/lesson_1_5';
import { lesson_1_6 } from '../data/lesson_1_6';
import { lesson_1_7 } from '../data/lesson_1_7'; 

const Lesson = () => {
  const { lessonId, drillId } = useParams();
  const navigate = useNavigate();
  const { markDrillComplete } = useUser();
  
  // ১.১ ইনস্ট্রাকশন
  if (drillId === "1.1") {
    return (
      <InstructionDrill 
        steps={instructionSteps || []}
        onComplete={() => {
           markDrillComplete(lessonId, drillId, { wpm: 0, accuracy: 100 });
           navigate(`/course/${lessonId}`);
        }}
        onBack={() => navigate(`/course/${lessonId}`)}
      />
    );
  }

  // ১.২ কী ড্রিল
  if (drillId === "1.2") {
    return (
      <KeyDrill 
        learningSteps={learningSteps}
        generateDrillLine={generateDrillLine} 
        onComplete={(stats) => {
          markDrillComplete(lessonId, drillId, stats);
          navigate(`/course/${lessonId}`);
        }}
        onBack={() => navigate(`/course/${lessonId}`)}
        minWpm={10} 
      />
    );
  }

  // ১.৩ ইনস্ট্রাকশন
  if (drillId === "1.3") {
    return (
      <InstructionDrill 
        steps={resultInstructions || []}
        onComplete={() => {
           markDrillComplete(lessonId, drillId, { wpm: 0, accuracy: 100 });
           navigate(`/course/${lessonId}`);
        }}
        onBack={() => navigate(`/course/${lessonId}`)}
      />
    );
  }

 // ১.৪ ওয়ার্ড ড্রিল
  if (drillId === "1.4") {
    return (
      <WordDrill 
        generateDrillLine={generateWordDrill}
        onComplete={(stats) => {
          markDrillComplete(lessonId, drillId, stats);
          navigate(`/course/${lessonId}`);
        }}
        onBack={() => navigate(`/course/${lessonId}`)}
        minWpm={12}
        module="1.4"
        drillName="ওয়ার্ড ড্রিল"
      />
    );
  }

  // ১.৫ Enter Key ইনস্ট্রাকশন
  if (drillId === "1.5") {
    return (
      <InstructionDrill 
        steps={lesson_1_5.sections || []}
        onComplete={() => {
           markDrillComplete(lessonId, drillId, { wpm: 0, accuracy: 100 });
           navigate(`/course/${lessonId}`);
        }}
        onBack={() => navigate(`/course/${lessonId}`)}
      />
    );
  }

  // ১.৬ প্যারাগ্রাফ ড্রিল
  if (drillId === "1.6") {
    return (
      <ParagraphDrill 
        paragraphText={lesson_1_6.paragraphTexts}
        onComplete={(stats) => {
          markDrillComplete(lessonId, drillId, stats);
          navigate(`/course/${lessonId}`);
        }}
        onBack={() => navigate(`/course/${lessonId}`)}
        minWpm={12}
        module="1.6"
        drillName="প্যারাগ্রাফ ড্রিল"
      />
    );
  }

  // ১.৭ ব্লাইন্ড টাইপিং টেস্ট
  if (drillId === "1.7") {
    return (
      <BlindDrill 
        generateDrillLine={lesson_1_7.generateDrillLine}
        onComplete={(stats) => {
          markDrillComplete(lessonId, drillId, stats);
          navigate(`/course/${lessonId}`);
        }}
        onBack={() => navigate(`/course/${lessonId}`)}
        minWpm={15} 
      />
    );
  }

  return (
    <div style={{padding: '50px', textAlign: 'center', color: '#666'}}>
      <h3>লেসনটি লোড হচ্ছে অথবা তৈরি হয়নি...</h3>
      <button onClick={() => navigate(`/course/${lessonId}`)} style={{marginTop:'20px'}}>ফিরে যান</button>
    </div>
  );
};

export default Lesson;