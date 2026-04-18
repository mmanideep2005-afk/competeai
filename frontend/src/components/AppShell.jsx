import { Container, Row, Col } from 'react-bootstrap'
import Sidebar    from './Sidebar'
import ReportView from './ReportView'
import SearchBar  from './SearchBar'

export default function AppShell({ company, pipeline, logs, report, scores, running, error, onRun }) {
  return (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', overflow: 'hidden' }}>
      <Sidebar pipeline={pipeline} logs={logs} scores={scores} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
        <SearchBar company={company} onRun={onRun} running={running} />
        <ReportView
          company={company}
          report={report}
          scores={scores}
          running={running}
          error={error}
          pipeline={pipeline}
        />
      </div>
    </div>
  )
}