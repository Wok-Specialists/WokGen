'use client';

import { useEffect, useState } from 'react';

interface OpenAPISpec {
  openapi: string;
  info: { title: string; version: string; description: string };
  paths: Record<string, Record<string, {
    summary: string;
    description?: string;
    tags?: string[];
    requestBody?: { content: { 'application/json': { schema: unknown } } };
    responses: Record<string, { description: string }>;
    security?: unknown[];
  }>>;
}

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<OpenAPISpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPath, setExpandedPath] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/openapi')
      .then(r => r.json())
      .then(d => { setSpec(d as OpenAPISpec); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const METHOD_COLORS: Record<string, string> = {
    get: '#22c55e',
    post: '#3b82f6',
    put: '#f59e0b',
    patch: 'var(--accent)',
    delete: '#ef4444',
  };

  if (loading) return <div className="docs-loading">Loading API reference...</div>;
  if (!spec) return <div className="docs-error">Failed to load API spec</div>;

  return (
    <div className="docs-api">
      <div className="docs-api__header">
        <h1 className="docs-api__title">{spec.info.title}</h1>
        <span className="docs-api__version">v{spec.info.version}</span>
        <p className="docs-api__desc">{spec.info.description}</p>
      </div>
      <div className="docs-api__auth">
        <h2>Authentication</h2>
        <p>Pass your API key as a Bearer token in the Authorization header:</p>
        <pre className="docs-api__code">Authorization: Bearer wok_your_api_key</pre>
      </div>
      <div className="docs-api__endpoints">
        {Object.entries(spec.paths ?? {}).map(([path, methods]) => (
          <div key={path} className="docs-api__endpoint">
            {Object.entries(methods).map(([method, op]) => (
              <div key={method} className="docs-api__op">
                <button type="button"
                  className="docs-api__op-header"
                  onClick={() => setExpandedPath(expandedPath === `${method}:${path}` ? null : `${method}:${path}`)}
                >
                  <span className="docs-api__method" style={{ color: METHOD_COLORS[method] ?? '#aaa' }}>{method}</span>
                  <span className="docs-api__path docs-api__path--mono">{path}</span>
                  <span className="docs-api__summary">{op.summary}</span>
                </button>
                {expandedPath === `${method}:${path}` && (
                  <div className="docs-api__op-body">
                    {op.description && <p className="docs-api__desc">{op.description}</p>}
                    {op.security && op.security.length > 0 && (
                      <div className="docs-api__auth-note">Requires authentication</div>
                    )}
                    <div className="docs-api__responses">
                      <strong className="docs-api__responses-label">Responses</strong>
                      <div className="docs-api__response-list">
                        {Object.entries(op.responses ?? {}).map(([code, res]) => (
                          <div key={code} className="docs-api__response-row">
                            <span className={`docs-api__response-code${code.startsWith('2') ? ' docs-api__response-code--ok' : ' docs-api__response-code--err'}`}>{code}</span>
                            <span className="docs-api__response-desc">{res.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
