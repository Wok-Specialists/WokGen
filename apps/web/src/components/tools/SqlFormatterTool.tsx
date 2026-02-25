'use client';

import { useState } from 'react';

const KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'CROSS',
  'ON', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'LIKE', 'BETWEEN',
  'INSERT', 'INTO', 'UPDATE', 'DELETE', 'CREATE', 'TABLE', 'INDEX', 'DROP', 'ALTER',
  'ADD', 'SET', 'VALUES', 'HAVING', 'GROUP BY', 'ORDER BY', 'LIMIT', 'OFFSET',
  'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'UNION', 'ALL',
  'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'WITH', 'RETURNING',
];

// Keywords that start a new logical line
const LINE_BREAK_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
  'OUTER JOIN', 'CROSS JOIN', 'ON', 'AND', 'OR', 'HAVING', 'GROUP BY',
  'ORDER BY', 'LIMIT', 'OFFSET', 'UNION', 'RETURNING', 'SET', 'VALUES',
  'INSERT INTO', 'UPDATE', 'DELETE FROM', 'CREATE TABLE', 'DROP TABLE',
]);

function formatSQL(raw: string): string {
  if (!raw.trim()) return '';

  // Normalize whitespace
  let sql = raw.replace(/\s+/g, ' ').trim();

  // Uppercase keywords (handle multi-word first)
  const sortedKeywords = [...KEYWORDS].sort((a, b) => b.length - a.length);
  for (const kw of sortedKeywords) {
    const re = new RegExp('\\b' + kw.replace(/ /g, '\\s+') + '\\b', 'gi');
    sql = sql.replace(re, kw);
  }

  // Insert line breaks before major keywords to make formatting simpler
  const breakers = [...LINE_BREAK_KEYWORDS].sort((a, b) => b.length - a.length);
  for (const br of breakers) {
    const re = new RegExp('\\s+' + br.replace(/ /g, '\\s+') + '\\b', 'gi');
    sql = sql.replace(re, '\n' + br);
  }

  // Split into lines and indent simply
  const lines = sql.split(/\n+/).map(l => l.trim()).filter(Boolean);
  let outLines: string[] = [];
  for (const line of lines) {
    if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|WITH)\b/i.test(line)) {
      outLines.push(line);
      // For SELECT lists, try to break columns onto separate lines
      if (line.startsWith('SELECT')) {
        const rest = line.slice(6).trim();
        if (rest) {
          const cols = rest.split(/,\s*/).map(c => '  ' + c.trim());
          outLines = outLines.concat(cols);
        }
      }
    } else {
      outLines.push('  ' + line);
    }
  }

  return outLines.join('\n');
}

export default function SqlFormatterTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const format = () => setOutput(formatSQL(input));

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="sql-tool">
      <div className="sql-tool__area">
        <label className="tool-label">Input SQL</label>
        <textarea
          className="sql-tool__textarea"
          rows={10}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="SELECT * FROM users WHERE active = 1 ORDER BY created_at DESC;"
          spellCheck={false}
        />
      </div>

      <div className="sql-tool__actions">
        <button className="btn btn-primary" onClick={format} disabled={!input.trim()}>Format SQL</button>
        <button className="btn btn-secondary" onClick={() => { setInput(''); setOutput(''); }}>Clear</button>
      </div>

      {output && (
        <div className="sql-tool__output-wrap">
          <div className="sql-tool__output-header">
            <span className="tool-label" style={{ margin: 0 }}>Formatted SQL</span>
            <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={copy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="sql-tool__output">{output}</pre>
        </div>
      )}

      <style>{`
        .sql-tool { display: flex; flex-direction: column; gap: 16px; }
        .sql-tool__area { display: flex; flex-direction: column; gap: 6px; }
        .sql-tool__textarea {
          padding: 10px 12px; font-size: 13px; font-family: 'Menlo','Consolas',monospace;
          line-height: 1.6; background: var(--bg); color: var(--text);
          border: 1px solid var(--surface-border); border-radius: 6px;
          outline: none; resize: vertical; width: 100%;
        }
        .sql-tool__textarea:focus { border-color: #818cf8; }
        .sql-tool__actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .sql-tool__output-wrap {
          background: var(--bg-surface); border: 1px solid var(--surface-border);
          border-radius: 8px; overflow: hidden;
        }
        .sql-tool__output-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 14px; border-bottom: 1px solid var(--surface-border);
          background: rgba(255,255,255,0.02);
        }
        .sql-tool__output {
          padding: 14px; font-size: 13px; font-family: 'Menlo','Consolas',monospace;
          line-height: 1.7; color: var(--text-secondary); margin: 0;
          overflow: auto; white-space: pre;
        }
      `}</style>
    </div>
  );
}
