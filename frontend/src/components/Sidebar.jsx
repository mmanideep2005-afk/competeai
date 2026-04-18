import AgentStep  from './AgentStep'
import ScoreRings from './ScoreRings'
import LogPanel   from './LogPanel'
import styles     from './Sidebar.module.css'

const STEPS = [
  { key: 'researcher', label: 'Researcher', desc: 'Web search · scraping · MCP tools' },
  { key: 'analyst',    label: 'Analyst',    desc: 'SWOT · market position · risks' },
  { key: 'writer',     label: 'Writer',     desc: 'Markdown report · recommendations' },
  { key: 'critic',     label: 'Critic',     desc: 'Quality score · self-correction loop' },
]

export default function Sidebar({ pipeline, logs, scores }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.section}>
        <div className={styles.label}>// Pipeline</div>
        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <AgentStep
              key={s.key}
              step={s}
              state={pipeline[s.key]}
              isLast={i === STEPS.length - 1}
            />
          ))}
        </div>
      </div>

      <LogPanel logs={logs} />

      {scores && <ScoreRings scores={scores} />}
    </aside>
  )
}