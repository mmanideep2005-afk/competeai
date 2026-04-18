import styles from './Navbar.module.css'

export default function Navbar({ running, elapsed }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <div className={styles.logoMark}>
          <svg viewBox="0 0 16 16" fill="#07090f" width="16" height="16">
            <path d="M8 1L2 4.5V11l6 3.5 6-3.5V4.5L8 1zm0 2.2l4 2.3v4.6L8 12.4l-4-2.3V5.5l4-2.3z"/>
          </svg>
        </div>
        <span>CompeteAI</span>
      </div>

      <div className={styles.right}>
        {running && (
          <div className={styles.liveBadge}>
            <span className={styles.liveDot} />
            Pipeline running…
          </div>
        )}
        {elapsed && !running && (
          <div className={styles.doneBadge}>
            Completed in {elapsed}s
          </div>
        )}
        <div className={styles.stackPill}>
          <span className={styles.dot} />
          LangGraph · Groq · MCP · PostgreSQL
        </div>
      </div>
    </nav>
  )
}