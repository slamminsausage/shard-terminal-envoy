/**
 * Panel Component
 *
 * Reusable panel with consistent terminal styling:
 * - Panel header with Orbitron font
 * - Optional status indicator
 * - Border with gradient accent
 * - Scrollable content area
 */

import React, { ReactNode } from 'react';

interface PanelProps {
  title?: string;
  status?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function Panel({
  title,
  status,
  children,
  className = '',
  contentClassName = '',
}: PanelProps) {
  return (
    <div className={`panel ${className}`}>
      {title && (
        <div className="panel-header">
          <span className="panel-title">{title}</span>
          {status && <span className="panel-status">{status}</span>}
        </div>
      )}
      <div className={`panel-content ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}
