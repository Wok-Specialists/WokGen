'use client';

import { useState, useCallback, useRef } from 'react';

type Tab = 'table' | 'convert' | 'stats';
type ConvertMode = 'csv-json' | 'csv-yaml' | 'json-csv';
type SortDir = 'asc' | 'desc';

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let inQ = false;
    let cur = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === ',' && !inQ) {
        cells.push(cur); cur = '';
      } else {
        cur += ch;
      }
    }
    cells.push(cur);
    rows.push(cells);
  }
  return rows;
}

function toYaml(obj: unknown, depth = 0): string {
  const indent = '  '.repeat(depth);
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj === 'boolean' || typeof obj === 'number') return String(obj);
  if (typeof obj === 'string') {
    if (/[:\n#"']/.test(obj)) return `"${obj.replace(/"/g, '\\"')}"`;
    return obj || '""';
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map(item => {
      const v = toYaml(item, depth + 1);
      if (typeof item === 'object' && item !== null) return `\n${indent}- ${v.trimStart()}`;
      return `\n${indent}- ${v}`;
    }).join('');
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return entries.map(([k, v]) => {
      const val = toYaml(v, depth + 1);
      if (typeof v === 'object' && v !== null) return `\n${indent}${k}:${val}`;
      return `\n${indent}${k}: ${val}`;
    }).join('');
  }
  return String(obj);
}

function csvToJson(rows: string[][]): string {
  if (rows.length < 2) return '[]';
  const headers = rows[0];
  const data = rows.slice(1).map(row =>
    Object.fromEntries(headers.map((h, i) => [h, row[i] ?? '']))
  );
  return JSON.stringify(data, null, 2);
}

function csvToYaml(rows: string[][]): string {
  if (rows.length < 2) return '[]';
  const headers = rows[0];
  const data = rows.slice(1).map(row =>
    Object.fromEntries(headers.map((h, i) => [h, row[i] ?? '']))
  );
  return data.map(obj => '-' + toYaml(obj, 1)).join('\n');
}

function jsonToCsv(jsonStr: string): string {
  try {
    const data = JSON.parse(jsonStr);
    if (!Array.isArray(data) || data.length === 0) return 'Input must be a non-empty JSON array';
    const keys = Object.keys(data[0] as object);
    const escape = (v: string) => v.includes(',') || v.includes('"') || v.includes('\n')
      ? `"${v.replace(/"/g, '""')}"` : v;
    const rows = [keys.join(',')];
    for (const row of data as Record<string, unknown>[]) {
      rows.push(keys.map(k => escape(String(row[k] ?? ''))).join(','));
    }
    return rows.join('\n');
  } catch {
    return 'Invalid JSON';
  }
}

const EXAMPLE_CSV = `name,age,city,score
Alice,30,New York,95
Bob,25,London,88
Carol,35,Tokyo,92
Dave,28,Paris,
Eve,32,Berlin,79`;

export default function CsvTool() {
  const [csv, setCsv] = useState(EXAMPLE_CSV);
  const [tab, setTab] = useState<Tab>('table');
  const [convertMode, setConvertMode] = useState<ConvertMode>('csv-json');
  const [jsonInput, setJsonInput] = useState('');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filter, setFilter] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [copiedOut, setCopiedOut] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const rows = parseCsv(csv);
  const headers = rows[0] ?? [];
  const dataRows = rows.slice(1);

  const filtered = filter
    ? dataRows.filter(row => row.some(cell => cell.toLowerCase().includes(filter.toLowerCase())))
    : dataRows;

  const sorted = sortCol !== null
    ? [...filtered].sort((a, b) => {
        const av = a[sortCol] ?? '';
        const bv = b[sortCol] ?? '';
        const numA = parseFloat(av), numB = parseFloat(bv);
        const cmp = !isNaN(numA) && !isNaN(numB) ? numA - numB : av.localeCompare(bv);
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : filtered;

  const handleSort = (i: number) => {
    if (sortCol === i) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(i); setSortDir('asc'); }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCsv(ev.target?.result as string ?? '');
    reader.readAsText(file);
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCsv(ev.target?.result as string ?? '');
    reader.readAsText(file);
  };

  const convertOutput = convertMode === 'csv-json'
    ? csvToJson(rows)
    : convertMode === 'csv-yaml'
    ? csvToYaml(rows)
    : jsonToCsv(jsonInput);

  const downloadOutput = () => {
    const ext = convertMode === 'csv-json' ? 'json' : convertMode === 'csv-yaml' ? 'yaml' : 'csv';
    const blob = new Blob([convertOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `output.${ext}`; a.click();
    URL.revokeObjectURL(url);
  };

  const copyOutput = async () => {
    await navigator.clipboard.writeText(convertOutput);
    setCopiedOut(true);
    setTimeout(() => setCopiedOut(false), 1500);
  };

  // Stats
  const nullCounts = headers.map((_, ci) => dataRows.filter(r => !r[ci]?.trim()).length);
  const uniqueCounts = headers.map((_, ci) => {
    const vals = dataRows.map(r => r[ci]?.trim() ?? '').filter(Boolean);
    const counts = new Map<string, number>();
    vals.forEach(v => counts.set(v, (counts.get(v) ?? 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  });

  return (
    <div className="csv-tool">
      {/* Input area */}
      <div
        className={`csv-drop-zone${dragOver ? ' drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="csv-drop-header">
          <span className="csv-drop-label">CSV Input</span>
          <div className="csv-drop-actions">
            <button className="btn-ghost-xs" onClick={() => fileRef.current?.click()}>Load File</button>
            <button className="btn-ghost-xs" onClick={() => setCsv(EXAMPLE_CSV)}>Example</button>
            <button className="btn-ghost-xs" onClick={() => setCsv('')}>Clear</button>
          </div>
        </div>
        <textarea
          className="csv-textarea"
          value={csv}
          onChange={e => setCsv(e.target.value)}
          placeholder="Paste CSV here or drag & drop a .csv file…"
          spellCheck={false}
        />
        <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" style={{ display: 'none' }} onChange={handleFile} />
      </div>

      {/* Tabs */}
      <div className="csv-tabs">
        {(['table', 'convert', 'stats'] as Tab[]).map(t => (
          <button key={t} className={`csv-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'table' ? 'Table' : t === 'convert' ? 'Convert' : 'Stats'}
          </button>
        ))}
      </div>

      {/* Table view */}
      {tab === 'table' && (
        <div className="csv-table-section">
          <div className="csv-filter-row">
            <input
              className="csv-filter-input"
              placeholder="Filter rows…"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
            <span className="csv-row-count">{sorted.length} / {dataRows.length} rows</span>
          </div>
          {headers.length > 0 ? (
            <div className="csv-table-wrap">
              <table className="csv-table">
                <thead>
                  <tr>
                    {headers.map((h, i) => (
                      <th key={i} onClick={() => handleSort(i)} className="csv-th sortable">
                        {h}
                        {sortCol === i ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((row, ri) => (
                    <tr key={ri}>
                      {headers.map((_, ci) => (
                        <td key={ci} className={`csv-td${!row[ci]?.trim() ? ' csv-null' : ''}`}>
                          {row[ci] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="csv-empty">Paste CSV data above to see the table.</p>
          )}
        </div>
      )}

      {/* Convert view */}
      {tab === 'convert' && (
        <div className="csv-convert-section">
          <div className="csv-convert-modes">
            {([
              { id: 'csv-json', label: 'CSV → JSON' },
              { id: 'csv-yaml', label: 'CSV → YAML' },
              { id: 'json-csv', label: 'JSON → CSV' },
            ] as { id: ConvertMode; label: string }[]).map(m => (
              <button
                key={m.id}
                className={`csv-mode-btn${convertMode === m.id ? ' active' : ''}`}
                onClick={() => setConvertMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
          {convertMode === 'json-csv' && (
            <textarea
              className="csv-textarea"
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              placeholder='Paste JSON array here, e.g. [{"name":"Alice","age":30}]'
              spellCheck={false}
            />
          )}
          <div className="csv-output-header">
            <span className="csv-output-label">Output</span>
            <div className="csv-output-actions">
              <button className="btn-ghost-xs" onClick={copyOutput}>{copiedOut ? '✓ Copied' : 'Copy'}</button>
              <button className="btn-ghost-xs" onClick={downloadOutput}>Download</button>
            </div>
          </div>
          <textarea className="csv-textarea output" readOnly value={convertOutput} spellCheck={false} />
        </div>
      )}

      {/* Stats view */}
      {tab === 'stats' && headers.length > 0 && (
        <div className="csv-stats-section">
          <div className="csv-stats-summary">
            <div className="csv-stat-card"><span className="csv-stat-val">{dataRows.length}</span><span className="csv-stat-label">Rows</span></div>
            <div className="csv-stat-card"><span className="csv-stat-val">{headers.length}</span><span className="csv-stat-label">Columns</span></div>
            <div className="csv-stat-card"><span className="csv-stat-val">{nullCounts.reduce((a, b) => a + b, 0)}</span><span className="csv-stat-label">Empty Cells</span></div>
          </div>
          <div className="csv-col-stats">
            {headers.map((h, ci) => (
              <div key={ci} className="csv-col-card">
                <div className="csv-col-name">{h}</div>
                <div className="csv-col-meta">
                  <span>Nulls: <strong>{nullCounts[ci]}</strong></span>
                  <span>Unique: <strong>{uniqueCounts[ci].length}</strong></span>
                </div>
                <div className="csv-col-top">
                  {uniqueCounts[ci].map(([val, cnt]) => (
                    <span key={val} className="csv-top-val">{val || '(empty)'} <em>×{cnt}</em></span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === 'stats' && headers.length === 0 && (
        <p className="csv-empty">Paste CSV data above to see stats.</p>
      )}
    </div>
  );
}
