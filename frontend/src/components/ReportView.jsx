import ReactMarkdown from 'react-markdown'
import styles from './ReportView.module.css'

export default function ReportView({ company, report, scores, running, error, pipeline }) {
  const copyReport = () => {
    if (report) navigator.clipboard.writeText(report)
  }

  const progress = Object.values(pipeline).filter(s => s === 'done').length * 25

  if (error) {
    return (
      <div className={styles.errorBox}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        Error: {error}
      </div>
    )
  }

  if (!report && !running) {
    return (
      <div className={styles.empty}>
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
          stroke="var(--text-3)" strokeWidth="1.2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
        <h4>Pipeline initialised</h4>
        <p>Agents are running — your report will appear here when the pipeline completes</p>
      </div>
    )
  }

  if (running && !report) {
    return (
      <div className={styles.loading}>
        <div className={styles.progressWrap}>
          <div className={styles.progressBar} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.loadingText}>
          Agents working on <strong style={{ color: 'var(--accent)' }}>{company}</strong>…
        </div>
        <div className={styles.steps}>
          {['Researcher','Analyst','Writer','Critic'].map((s, i) => {
            const key = s.toLowerCase()
            const state = pipeline[key]
            return (
              <div key={s} className={`${styles.loadStep} ${styles['ls_'+state]}`}>
                <div className={styles.loadDot} />
                {s}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.reportWrap} fade-up`}>
      <div className={styles.reportHeader}>
        <div>
          <div className={styles.reportCompany}>{company}</div>
          <div className={styles.reportMeta}>
            {scores && <span className={styles.scoreTag}>Score {scores.overall?.toFixed(1)}/10</span>}
            <span className={styles.metaTag}>LangGraph Pipeline</span>
            <span className={styles.metaTag}>4 Agents</span>
          </div>
        </div>
        <button className={styles.copyBtn} onClick={copyReport}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy Report
        </button>
      </div>

      <div className={styles.reportBody}>
        <ReactMarkdown>{report}</ReactMarkdown>
      </div>
    </div>
  )
}