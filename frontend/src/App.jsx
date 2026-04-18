import { useState, useCallback } from 'react'
import Navbar   from './components/Navbar'
import Hero     from './components/Hero'
import AppShell from './components/AppShell'

export default function App() {
  const [view, setView]       = useState('hero')   // 'hero' | 'app'
  const [company, setCompany] = useState('')
  const [pipeline, setPipeline] = useState({
    researcher: 'idle',
    analyst:    'idle',
    writer:     'idle',
    critic:     'idle',
  })
  const [logs, setLogs]     = useState([])
  const [report, setReport] = useState(null)
  const [scores, setScores] = useState(null)
  const [elapsed, setElapsed] = useState(null)
  const [running, setRunning] = useState(false)
  const [error, setError]   = useState(null)

  const addLog = useCallback((msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString('en', { hour12: false })
    setLogs(prev => [...prev, { ts, msg, type, id: Date.now() + Math.random() }])
  }, [])

  const resetState = () => {
    setPipeline({ researcher:'idle', analyst:'idle', writer:'idle', critic:'idle' })
    setLogs([])
    setReport(null)
    setScores(null)
    setElapsed(null)
    setError(null)
  }

  const runPipeline = useCallback((name) => {
    if (!name.trim()) return
    setCompany(name.trim())
    setView('app')
    resetState()
    setRunning(true)

    const startMs = Date.now()
    addLog(`Starting pipeline for "${name.trim()}"`, 'accent')

    const es = new EventSource(`http://localhost:8000/research?company=${encodeURIComponent(name.trim())}`)

    es.onmessage = (e) => {
      const d = JSON.parse(e.data)

      if (d.step === 'researcher') {
        if (d.status === 'running') {
          setPipeline(p => ({ ...p, researcher: 'running' }))
          addLog('Researcher agent started — web search + scraping')
        } else if (d.status === 'done') {
          setPipeline(p => ({ ...p, researcher: 'done' }))
          addLog('Research complete')
        }
      }
      if (d.step === 'analyst') {
        if (d.status === 'running') {
          setPipeline(p => ({ ...p, analyst: 'running' }))
          addLog('Analyst agent started — SWOT + insights')
        } else if (d.status === 'done') {
          setPipeline(p => ({ ...p, analyst: 'done' }))
          addLog('Analysis complete')
        }
      }
      if (d.step === 'writer') {
        if (d.status === 'running') {
          setPipeline(p => ({ ...p, writer: 'running' }))
          addLog('Writer agent started — drafting report')
        } else if (d.status === 'done') {
          setPipeline(p => ({ ...p, writer: 'done' }))
          addLog('Draft complete')
        }
      }
      if (d.step === 'critic') {
        if (d.status === 'running') {
          setPipeline(p => ({ ...p, critic: 'running' }))
          addLog('Critic scoring quality')
        } else if (d.status === 'revising') {
          setPipeline(p => ({ ...p, critic: 'revising', writer: 'running' }))
          addLog(`Revision requested: ${d.feedback}`, 'warn')
        } else if (d.status === 'done') {
          setPipeline(p => ({ ...p, critic: 'done' }))
          addLog(`Approved — score: ${d.score}/10`, 'success')
        }
      }
      if (d.step === 'complete') {
        const secs = ((Date.now() - startMs) / 1000).toFixed(1)
        setElapsed(secs)
        setScores({ overall: d.score, ...d.scores })
        setReport(d.report)
        setRunning(false)
        addLog(`Pipeline finished in ${secs}s`, 'success')
        es.close()
      }
      if (d.step === 'error') {
        setError(d.message)
        setRunning(false)
        addLog(`Error: ${d.message}`, 'error')
        es.close()
      }
    }

    es.onerror = () => {
      setRunning(false)
      setError('Connection lost. Is the FastAPI server running?')
      es.close()
    }
  }, [addLog])

  return (
    <>
      <Navbar running={running} elapsed={elapsed} />
      {view === 'hero'
        ? <Hero onRun={runPipeline} />
        : <AppShell
            company={company}
            pipeline={pipeline}
            logs={logs}
            report={report}
            scores={scores}
            running={running}
            error={error}
            onRun={runPipeline}
          />
      }
    </>
  )
}