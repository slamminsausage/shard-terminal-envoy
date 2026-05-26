const PREFIX = 'logread:';

function key(terminalCode: string, logTitle: string) {
  return `${PREFIX}${terminalCode}:${logTitle}`;
}

export function incrementLogRead(terminalCode: string, logTitle: string): number {
  const k = key(terminalCode, logTitle);
  const prev = parseInt(localStorage.getItem(k) || '0', 10);
  const next = prev + 1;
  localStorage.setItem(k, String(next));
  return next;
}

export function getLogReadCount(terminalCode: string, logTitle: string): number {
  return parseInt(localStorage.getItem(key(terminalCode, logTitle)) || '0', 10);
}
