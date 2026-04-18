import styles from './ScoreRings.module.css'

function Ring({ value, label, color, size = 44 }) {
  const r = 16, circ = 2 * Math.PI * r
  const filled = ((value || 0) / 10) * circ

  return (
    <div className={styles.ringCard}>
      <svg width={size} height={size} viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="3"/>
        <circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${filled.toFixed(1)} ${circ.toFixed(1)}`}
          strokeLinecap="round" transform="rotate(-90 18 18)"/>
        <text x="18" y="22" textAnchor="middle"
          fontFamily="var(--font-mono)" fontSize="8" fontWeight="500" fill={color}>
          {(value || 0).toFixed(1)}
        </text>
      </svg>
      <div className={styles.label}>{label}</div>
    </div>
  )
}

export default function ScoreRings({ scores }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.sectionLabel}>// Quality scores</div>
      <div className={styles.overall}>
        <Ring value={scores.overall} label="Overall" color="var(--accent)" size={56} />
        <div className={styles.overallMeta}>
          <div className={styles.overallVal}>{(scores.overall || 0).toFixed(1)}/10</div>
          <div className={styles.overallSub}>Report quality score</div>
        </div>
      </div>
      <div className={styles.grid}>
        <Ring value={scores.completeness}  label="Complete"   color="var(--purple)" />
        <Ring value={scores.specificity}   label="Specific"   color="var(--green)" />
        <Ring value={scores.actionability} label="Actionable" color="#60a5fa" />
        <Ring value={scores.readability}   label="Readable"   color="#f472b6" />
      </div>
    </div>
  )
}