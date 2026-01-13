import React from 'react';
import { FaClock, FaChartLine, FaBullseye } from 'react-icons/fa';
import logo from '../assets/images/Logo.png';

/**
 * Reusable right sidebar for drills (TypingMaster Pro style).
 *
 * Contract:
 * - progress: { current:number, total:number }
 * - time: { label?:string, value:string }
 * - wpm: number
 * - accuracy?: number
 * - actions?: { primary?: { label, onClick }, secondary?: { label, onClick } }
 */
const DrillSidebar = ({
  title = 'Your Progress',
  module,
  drillName,
  progress,
  time,
  paused = false,
  wpm,
  accuracy,
  actions
}) => {
  const pct = progress && progress.total > 0
    ? Math.min(100, Math.max(0, Math.round((progress.current / progress.total) * 100)))
    : 0;

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brandHeader}>
        <div style={styles.brandStack}>
          <img src={logo} alt="TechHat" style={styles.brandLogo} />
          <div style={styles.brandTitle}>TechHat Typing Master</div>
          <div style={styles.brandSubRow}>
            {module && <span style={styles.brandChip}>Module {module}</span>}
            {drillName && <span style={styles.brandChip}>{drillName}</span>}
          </div>
        </div>
      </div>

      <div style={styles.progressCard}>
        <div style={styles.progressHeaderRow}>
          <div style={styles.headerTitle}>
            <span style={styles.headerIcon}>▦</span>
            <span>{title}</span>
          </div>
        </div>
        <div style={styles.progressTopRow}>
          <div style={styles.progressPct}>{pct}%</div>
          <div style={styles.progressMeta}>
            <div style={styles.progressNums}>{progress?.current ?? 0}/{progress?.total ?? 0}</div>
            <div style={styles.progressLabel}>characters</div>
          </div>
        </div>
        <div style={styles.progressBarTrack}>
          <div style={{ ...styles.progressBarFill, width: `${pct}%` }} />
        </div>
        <div style={styles.miniBars} aria-hidden>
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.miniBar,
                height: `${10 + i * 3}px`,
                opacity: 0.45 + i * 0.035
              }}
            />
          ))}
        </div>
      </div>

      <div style={styles.statGrid}>
        <div style={styles.statItem}>
          <div style={styles.statLabel}><FaClock size={14} /> Time</div>
          <div style={styles.statValueRow}>
            <span>{time?.value ?? '00:00'}</span>
            {paused && <span style={styles.pausedPill}>PAUSED</span>}
          </div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statLabel}><FaChartLine size={14} /> WPM</div>
          <div style={styles.statValue}>{Number.isFinite(wpm) ? wpm : 0}</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statLabel}><FaBullseye size={14} /> Acc</div>
          <div style={styles.statValue}>{Number.isFinite(accuracy) ? `${accuracy}%` : '--'}</div>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {(actions?.primary || actions?.secondary) && (
        <div style={styles.actions}>
          {actions?.primary && (
            <button style={styles.primaryBtn} onClick={actions.primary.onClick}>
              {actions.primary.label}
            </button>
          )}
          {actions?.secondary && (
            <button style={styles.secondaryBtn} onClick={actions.secondary.onClick}>
              {actions.secondary.label}
            </button>
          )}
        </div>
      )}
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '280px',
    minWidth: '280px',
    background: '#dbe9fb',
    borderRadius: '10px',
    border: '1px solid rgba(21, 101, 192, 0.15)',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)'
  },
  brandHeader: {
    background: 'rgba(255,255,255,0.65)',
    border: '1px solid rgba(0,0,0,0.05)',
    borderRadius: '10px',
    padding: '10px'
  },
  brandStack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '6px'
  },
  brandLogo: {
    width: '90px',
    height: '90px',
    objectFit: 'contain',
    borderRadius: 0,
    background: 'transparent',
    border: 'none',
    padding: 0
  },
  brandTitle: {
    fontWeight: 900,
    color: '#0d47a1',
    fontSize: '15px',
    lineHeight: 1.1
  },
  brandSubRow: {
    marginTop: '6px',
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap'
  },
  brandChip: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#1565c0',
    background: 'rgba(21,101,192,0.10)',
    border: '1px solid rgba(21,101,192,0.18)',
    padding: '3px 8px',
    borderRadius: '999px'
  },
  progressHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 700,
    color: '#0d47a1'
  },
  headerIcon: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    background: '#1e88e5',
    color: 'white',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px'
  },
  progressCard: {
    background: 'rgba(255,255,255,0.75)',
    border: '1px solid rgba(0,0,0,0.05)',
    borderRadius: '10px',
    padding: '10px'
  },
  progressTopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  progressPct: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#0d47a1'
  },
  progressMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  progressNums: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#1a237e'
  },
  progressLabel: {
    fontSize: '11px',
    color: '#546e7a'
  },
  progressBarTrack: {
    marginTop: '10px',
    height: '10px',
    background: 'rgba(13,71,161,0.12)',
    borderRadius: '999px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #1565c0, #42a5f5)',
    borderRadius: '999px'
  },
  miniBars: {
    marginTop: '12px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '0',
    width: '100%'
  },
  miniBar: {
    flex: 1,
    minWidth: '6px',
    margin: '0 2px',
    background: 'rgba(13,71,161,0.35)',
    borderRadius: '3px'
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '8px'
  },
  statItem: {
    background: 'rgba(255,255,255,0.85)',
    borderRadius: '10px',
    padding: '10px',
    border: '1px solid rgba(0,0,0,0.05)'
  },
  statLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#37474f',
    fontWeight: 700
  },
  statValue: {
    marginTop: '6px',
    fontSize: '20px',
    fontWeight: 900,
    color: '#0d47a1',
    letterSpacing: '0.5px'
  },
  statValueRow: {
    marginTop: '6px',
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '10px',
    fontSize: '20px',
    fontWeight: 900,
    color: '#0d47a1',
    letterSpacing: '0.5px'
  },
  pausedPill: {
    fontSize: '11px',
    fontWeight: 900,
    color: '#b71c1c',
    background: '#ffebee',
    border: '1px solid #ffcdd2',
    padding: '3px 8px',
    borderRadius: '999px',
    letterSpacing: '0.3px'
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  primaryBtn: {
    width: '100%',
    padding: '10px 12px',
    background: '#1565c0',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 800
  },
  secondaryBtn: {
    width: '100%',
    padding: '10px 12px',
    background: 'white',
    color: '#0d47a1',
    border: '1px solid rgba(13,71,161,0.25)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 800
  }
};

export default DrillSidebar;
