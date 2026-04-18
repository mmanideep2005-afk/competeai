import { useState, useEffect } from 'react'
import styles from './SearchBar.module.css'

export default function SearchBar({ company, onRun, running }) {
  const [value, setValue] = useState(company)
  useEffect(() => setValue(company), [company])

  const submit = () => { if (value.trim() && !running) onRun(value.trim()) }

  return (
    <div className={styles.wrap}>
      <div className={styles.box}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="var(--text-3)" strokeWidth="2">
          <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          className={styles.input}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="New company…"
          disabled={running}
        />
        <button className={styles.btn} onClick={submit} disabled={running || !value.trim()}>
          {running ? 'Running…' : 'Analyse'}
        </button>
      </div>
    </div>
  )
}