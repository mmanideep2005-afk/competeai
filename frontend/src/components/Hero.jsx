import { useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import styles from './Hero.module.css'

const EXAMPLES = ['Anthropic', 'Mistral AI', 'Perplexity', 'Linear', 'Groq', 'Notion']

export default function Hero({ onRun }) {
  const [value, setValue] = useState('')

  const submit = () => { if (value.trim()) onRun(value.trim()) }

  return (
    <div className={styles.hero}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} className="text-center">

            <div className={styles.eyebrow}>
              <span className={styles.line} />
              Powered by multi-agent AI
              <span className={styles.line} />
            </div>

            <h1 className={styles.title}>
              Research any company<br />
              with <em className={styles.accent}>intelligent agents</em>
            </h1>

            <p className={styles.sub}>
              Four specialised AI agents research, analyse, write and self-critique
              a full competitive intelligence report — automatically.
            </p>

            <div className={styles.searchWrap}>
              <div className={styles.searchBox}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="var(--text-3)" strokeWidth="2">
                  <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Enter a company name…"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  autoFocus
                />
                <button className={styles.btn} onClick={submit} disabled={!value.trim()}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5">
                    <polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/>
                  </svg>
                  Analyse
                </button>
              </div>
            </div>

            <div className={styles.examples}>
              <span className={styles.exLabel}>try →</span>
              {EXAMPLES.map(ex => (
                <button key={ex} className={styles.pill}
                  onClick={() => onRun(ex)}>{ex}</button>
              ))}
            </div>

            {/* Feature cards */}
            <Row className="g-3 mt-4">
              {[
                { icon: '🔍', title: 'Deep Research', desc: 'Web search + scraping via custom MCP server' },
                { icon: '📊', title: 'SWOT Analysis', desc: 'Structured insights from LangChain agents' },
                { icon: '🔄', title: 'Self-Correction', desc: 'Critic agent loops until quality ≥ 7/10' },
                { icon: '☁️', title: 'Cloud Storage', desc: 'Reports saved to PostgreSQL in Docker' },
              ].map(f => (
                <Col key={f.title} xs={6} md={3}>
                  <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>{f.icon}</div>
                    <div className={styles.featureTitle}>{f.title}</div>
                    <div className={styles.featureDesc}>{f.desc}</div>
                  </div>
                </Col>
              ))}
            </Row>

          </Col>
        </Row>
      </Container>
    </div>
  )
}