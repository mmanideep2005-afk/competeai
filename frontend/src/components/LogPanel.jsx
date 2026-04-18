import { useEffect, useRef } from 'react'
import styles from './LogPanel.module.css'

export default function LogPanel({ logs }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [logs])

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <polyline points="4 17 10 11 4 5"/>
          <line x1="12" y1="19" x2="20" y2="19"/>
        </svg>
        Activity log
      </div>
      <div className={styles.body} ref={ref}>
        {logs.length === 0
          ? <span className={styles.empty}>Waiting for pipeline...</span>
          : logs.map(l => (
            <div key={l.id} className={`${styles.line} ${styles['type_' + l.type]}`}>
              <span className={styles.ts}>[{l.ts}]</span> {l.msg}
            </div>
          ))
        }
      </div>
    </div>
  )
}