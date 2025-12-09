import { act, renderHook } from "@testing-library/react";
import { useTerminalSession } from "./useTerminalSession";

describe("useTerminalSession command history", () => {
  it("records and recalls access codes with arrow-navigation semantics", () => {
    const { result } = renderHook(() => useTerminalSession());

    act(() => {
      result.current.addCommandToHistory("ABC-001");
      result.current.addCommandToHistory("VNG-972-N");
    });

    let recalled = "";
    act(() => {
      recalled = result.current.recallHistory("back");
    });
    expect(recalled).toBe("VNG-972-N");

    act(() => {
      recalled = result.current.recallHistory("back");
    });
    expect(recalled).toBe("ABC-001");

    act(() => {
      recalled = result.current.recallHistory("forward");
    });
    expect(recalled).toBe("VNG-972-N");
  });
});
