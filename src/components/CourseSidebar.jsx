import React from 'react';
import { courseData } from '../utils/courseData';
import { FaCheckCircle, FaLock, FaPlayCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CourseSidebar = ({ currentLessonId }) => {
  const navigate = useNavigate();

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <h3 style={{color: '#fff', fontSize: '16px'}}>Touch Typing Course</h3>
        <small style={{color: '#bbdefb'}}>12 Lessons</small>
      </div>

      <div style={styles.listContainer}>
        {courseData.map((lesson) => {
          const isActive = lesson.id === parseInt(currentLessonId);
          const isLocked = lesson.status === 'locked';

          return (
            <div 
              key={lesson.id} 
              style={{
                ...styles.item,
                background: isActive ? '#e3f2fd' : 'transparent',
                borderLeft: isActive ? '4px solid #1e88e5' : '4px solid transparent',
                opacity: isLocked ? 0.6 : 1,
                cursor: isLocked ? 'not-allowed' : 'pointer'
              }}
              onClick={() => !isLocked && navigate(`/course/${lesson.id}`)}
            >
              <div style={styles.icon}>
                {lesson.status === 'completed' ? <FaCheckCircle color="#2ecc71" /> : 
                 isActive ? <FaPlayCircle color="#1e88e5" /> : 
                 isLocked ? <FaLock color="#ccc" /> : <div style={styles.dot}></div>}
              </div>
              <div style={styles.text}>
                <span style={{fontWeight: isActive ? 'bold' : 'normal', color: isActive ? '#1565c0' : '#333'}}>
                  {lesson.id}. {lesson.title.split(':')[1]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    background: '#fff',
    borderRight: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    boxShadow: '2px 0 5px rgba(0,0,0,0.05)'
  },
  header: {
    background: '#1565c0',
    padding: '20px',
    textAlign: 'center'
  },
  listContainer: {
    overflowY: 'auto',
    flex: 1,
    padding: '10px 0'
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 15px',
    borderBottom: '1px solid #f0f0f0',
    transition: '0.2s'
  },
  icon: {
    marginRight: '10px',
    display: 'flex',
    alignItems: 'center'
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: '2px solid #ccc'
  },
  text: {
    fontSize: '13px',
    lineHeight: '1.4'
  }
};

export default CourseSidebar;
