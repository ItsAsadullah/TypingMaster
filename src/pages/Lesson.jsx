import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { courseData } from '../utils/courseData';

// নতুন কম্পোনেন্ট ইম্পোর্ট
import InstructionDrill from '../components/drills/InstructionDrill';
import KeyDrill from '../components/drills/KeyDrill';

// ডেটা ইম্পোর্ট
import { instructionSteps } from '../data/lesson_1_1';
import { learningSteps, generateDrillLine } from '../data/lesson_1_2';

const Lesson = () => {
  const { lessonId, drillId } = useParams();
  const navigate = useNavigate();
  const { markDrillComplete } = useUser();
  
  // ১.১ ইনস্ট্রাকশন হ্যান্ডলার
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

  // ১.২ কী ড্রিল হ্যান্ডলার
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
      />
    );
  }

  // অন্যান্য ড্রিলের জন্য প্লেসহোল্ডার (ভবিষ্যতে এখানে WordDrill বা GameDrill আসবে)
  return <div style={{padding: '50px', textAlign: 'center'}}>এই লেসনটি এখনো তৈরি হয়নি।</div>;
};

export default Lesson;