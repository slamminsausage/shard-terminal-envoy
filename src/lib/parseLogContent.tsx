/**
 * parseLogContent — converts a log's text into a list of React nodes,
 * replacing `[[redacted …]] … [[/redacted]]` markers with RedactedBlock
 * components that gate the hidden text behind a dice roll.
 *
 * Marker syntax (attributes optional):
 *
 *   [[redacted diff=10 skill="Electronics (Computers)" attempts=3]]
 *   hidden content (may span multiple lines)
 *   [[/redacted]]
 *
 * Unrecognised text is returned as a plain string node so callers can
 * still run a typewriter over the whole document if they truncate
 * the joined text.
 */

import React from 'react';
import RedactedBlock from '@/components/terminal/RedactedBlock';
import TerminalLink from '@/components/terminal/TerminalLink';

const OPEN_RE =
  /\[\[redacted(?:\s+([^\]]+))?\]\]/i;
const CLOSE = '[[/redacted]]';

// Inline link markers:  [[log: Some Log Title]]  [[connect: terminal_code]]
const LINK_RE = /\[\[(log|connect):\s*([^\]]+)\]\]/i;

interface ParseOptions {
  accentColor?: string;
  dimColor?: string;
  /** Called when the player clicks a [[log: title]] link */
  onNavigateLog?: (title: string) => void;
  /** Called when the player clicks a [[connect: code]] link */
  onConnectTerminal?: (code: string) => void;
}

interface Attrs {
  difficulty?: number;
  skill?: string;
  maxAttempts?: number;
}

function parseAttrs(attrString: string | undefined): Attrs {
  if (!attrString) return {};
  const out: Attrs = {};
  const diffMatch = attrString.match(/diff(?:iculty)?\s*=\s*(\d+)/i);
  if (diffMatch) out.difficulty = Number(diffMatch[1]);
  const attemptsMatch = attrString.match(/attempts\s*=\s*(\d+)/i);
  if (attemptsMatch) out.maxAttempts = Number(attemptsMatch[1]);
  const skillMatch =
    attrString.match(/skill\s*=\s*"([^"]+)"/i) ||
    attrString.match(/skill\s*=\s*'([^']+)'/i) ||
    attrString.match(/skill\s*=\s*(\S+)/i);
  if (skillMatch) out.skill = skillMatch[1];
  return out;
}

/**
 * Parse a log content string into React nodes. Plain text is returned
 * as a single string segment (preserve newlines with whitespace-pre-wrap).
 */
export function parseLogContent(
  raw: string,
  opts: ParseOptions = {}
): React.ReactNode[] {
  if (!raw) return [];
  const out: React.ReactNode[] = [];
  let cursor = 0;
  let keyIdx = 0;

  while (cursor < raw.length) {
    const remaining = raw.slice(cursor);

    // Find the earliest of: [[redacted…]] or [[log:…]] / [[connect:…]]
    const redactMatch = remaining.match(OPEN_RE);
    const linkMatch = remaining.match(LINK_RE);

    const redactIdx = redactMatch?.index ?? Infinity;
    const linkIdx = linkMatch?.index ?? Infinity;

    if (redactIdx === Infinity && linkIdx === Infinity) {
      // No more special markers — push the rest as plain text
      out.push(raw.slice(cursor));
      break;
    }

    if (linkIdx < redactIdx && linkMatch && linkMatch.index !== undefined) {
      // ── Inline link comes first ──────────────────────────────────────────
      const abs = cursor + linkMatch.index;
      if (abs > cursor) out.push(raw.slice(cursor, abs));

      const variant = linkMatch[1].toLowerCase() as 'log' | 'connect';
      const target = linkMatch[2].trim();

      out.push(
        <TerminalLink
          key={`link-${keyIdx++}`}
          variant={variant}
          target={target}
          onNavigateLog={opts.onNavigateLog}
          onConnectTerminal={opts.onConnectTerminal}
          accentColor={opts.accentColor}
        />
      );
      cursor = abs + linkMatch[0].length;
      continue;
    }

    if (redactMatch && redactMatch.index !== undefined) {
      // ── Redacted block ───────────────────────────────────────────────────
      const openAbs = cursor + redactMatch.index;
      if (openAbs > cursor) out.push(raw.slice(cursor, openAbs));

      const tagEnd = openAbs + redactMatch[0].length;
      const closeIdx = raw.indexOf(CLOSE, tagEnd);
      if (closeIdx === -1) {
        out.push(raw.slice(openAbs));
        break;
      }
      const inner = raw.slice(tagEnd, closeIdx);
      const attrs = parseAttrs(redactMatch[1]);
      out.push(
        <RedactedBlock
          key={`redacted-${keyIdx++}`}
          content={inner.trim()}
          difficulty={attrs.difficulty ?? 10}
          skill={attrs.skill ?? 'Electronics (Computers)'}
          maxAttempts={attrs.maxAttempts ?? 3}
          accentColor={opts.accentColor}
          dimColor={opts.dimColor}
        />
      );
      cursor = closeIdx + CLOSE.length;
      continue;
    }

    // Shouldn't reach here
    break;
  }

  return out;
}

/**
 * Does the text contain at least one redacted marker? Used to decide
 * whether to bypass the typewriter animation (redacted blocks can't
 * be usefully streamed by a char-by-char typewriter).
 */
export function hasRedactedMarkers(raw: string | undefined): boolean {
  if (!raw) return false;
  return OPEN_RE.test(raw);
}
