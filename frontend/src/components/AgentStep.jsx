import styles from './AgentStep.module.css'

const ICONS = {
  researcher: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  analyst: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  writer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
    </svg>
  ),
  critic: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
}

const BADGE = {
  idle:     { label: 'idle',      cls: styles.badgeIdle },
  running:  { label: 'running',   cls: styles.badgeRunning },
  done:     { label: 'done',      cls: styles.badgeDone },
  revising: { label: 'revising',  cls: styles.badgeRevising },
}

export default function AgentStep({ step, state, isLast }) {
  const b = BADGE[state] || BADGE.idle

  return (
    <div className={`${styles.wrap} ${!isLast ? styles.hasLine : ''} ${styles['state_' + state]}`}>
      <div className={styles.node}>
        <div className={styles.icon}>{ICONS[step.key]}</div>
      </div>
      {!isLast && <div className={styles.line} />}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.name}>{step.label}</span>
          <span className={`${styles.badge} ${b.cls}`}>{b.label}</span>
        </div>
        <div className={styles.desc}>{step.desc}</div>
      </div>
    </div>
  )
}