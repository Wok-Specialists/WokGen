import type { ReactNode } from 'react';
import Link from 'next/link';
import DocsNav from './DocsNav';

// Force dynamic to avoid static generation timeouts on large doc pages.
export const dynamic = 'force-dynamic';

const GITHUB_DOCS_ROOT =
  'https://github.com/wokspec/WokGen/blob/feat/transformation/apps/web/src/app/docs';

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="docs-layout">
      <DocsNav />
      <div className="docs-content-area">
        <div className="docs-content-top-bar">
          <Link
            href={GITHUB_DOCS_ROOT}
            target="_blank"
            rel="noopener noreferrer"
            className="docs-edit-link"
          >
            Edit on GitHub ↗
          </Link>
        </div>
        <div className="docs-content-body">{children}</div>
      </div>
    </div>
  );
}
