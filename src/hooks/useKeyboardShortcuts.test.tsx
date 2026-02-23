import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

function TestComponent({ action }: { action: () => void }) {
  useKeyboardShortcuts([
    {
      key: 'k',
      meta: true,
      action,
    },
  ]);

  return <div>shortcuts</div>;
}

describe('useKeyboardShortcuts', () => {
  it('triggers shortcuts that require the meta key', () => {
    const action = vi.fn();
    render(<TestComponent action={action} />);

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    });

    document.dispatchEvent(event);

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('does not trigger when meta is not pressed for meta shortcuts', () => {
    const action = vi.fn();
    render(<TestComponent action={action} />);

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      bubbles: true,
    });

    document.dispatchEvent(event);

    expect(action).not.toHaveBeenCalled();
  });
});
