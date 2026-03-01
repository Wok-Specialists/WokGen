'use client';

import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode | string;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon = '✦', title, description, action, secondaryAction }: EmptyStateProps) {
  return (
    <div className="empty-state-root">
      <div className="empty-state-icon-box">{icon}</div>
      <div className="empty-state-content">
        <p className="empty-state-title">{title}</p>
        <p className="empty-state-desc">{description}</p>
      </div>
      {(action || secondaryAction) && (
        <div className="empty-state-actions">
          {action && (
            action.href ? (
              <Link href={action.href} className="btn btn-primary empty-state-btn">{action.label}</Link>
            ) : (
              <button type="button" onClick={action.onClick} className="btn btn-primary empty-state-btn">{action.label}</button>
            )
          )}
          {secondaryAction && (
            <Link href={secondaryAction.href} className="btn btn-ghost empty-state-btn">{secondaryAction.label}</Link>
          )}
        </div>
      )}
    </div>
  );
}
