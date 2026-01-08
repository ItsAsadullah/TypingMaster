import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const InstructionDrill = ({ steps, onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const stepData = steps[currentStep] || {};
  const isLastStep = currentStep === steps.length - 1;

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Enter') isLastStep ? onComplete() : setCurrentStep(p => p + 1); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentStep, isLastStep]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}><FaArrowLeft /> ফিরে যান</button>
        <div style={{color: '#666'}}>ধাপ {currentStep + 1} / {steps.length}</div>
      </div>
      <div style={styles.instructionCard}>
        <div style={{marginBottom: '20px'}}>{stepData.icon}</div>
        <h2 style={{color: '#1565c0', marginBottom: '20px'}}>{stepData.title}</h2>
        <div style={styles.instructionContent}>{stepData.content}</div>
        <div style={styles.footerNav}>
          <button onClick={() => currentStep === 0 ? onBack() : setCurrentStep(p => p - 1)} style={styles.btnSecondary}><FaArrowLeft /> পেছনে</button>
          <button onClick={() => isLastStep ? onComplete() : setCurrentStep(p => p + 1)} style={styles.btnPrimary}>
            {isLastStep ? 'শেষ করুন' : 'পরবর্তী'} <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: "'Hind Siliguri', 'Segoe UI', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  backBtn: { background: 'transparent', border: '1px solid #ccc', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
  instructionCard: { background: 'white', padding: '50px 30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  instructionContent: { fontSize: '18px', color: '#555', maxWidth: '600px', marginBottom: '40px', lineHeight: '1.6' },
  footerNav: { display: 'flex', gap: '20px' },
  btnPrimary: { padding: '10px 30px', background: '#1e88e5', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' },
  btnSecondary: { padding: '10px 30px', background: '#f5f5f5', color: '#555', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' },
};

export default InstructionDrill;
