import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MainframeShell from "./MainframeShell";

vi.mock("./interfaces/MissionControlInterface", () => ({
  MissionControlInterface: () => <div>MissionMock</div>
}));

vi.mock("./interfaces/TerminalInterface", () => ({
  __esModule: true,
  default: () => <div>TerminalMock</div>
}));

vi.mock("./interfaces/CrewInterface", () => ({
  __esModule: true,
  default: () => <div>CrewMock</div>
}));

vi.mock("./interfaces/VehicleInterface", () => ({
  __esModule: true,
  default: () => <div>VehicleMock</div>
}));

vi.mock("./layout/AppHeader", () => ({
  __esModule: true,
  default: ({ tabs, activeTab, onTabChange }: any) => (
    <nav role="tablist">
      {tabs.map((tab: any) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}));

vi.mock("./layout/AppFooter", () => ({
  __esModule: true,
  default: () => <footer>FooterMock</footer>
}));

vi.mock("./KeyboardShortcutOverlay", () => ({
  KeyboardShortcutOverlay: () => null
}));

vi.mock("./TerminalLoadingSkeleton", () => ({
  __esModule: true,
  default: () => <div>LoadingMock</div>
}));

describe("MainframeShell tabs", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("persists last active tab to localStorage", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/app/mission"]}>
        <Routes>
          <Route path="/app/:tabId" element={<MainframeShell />} />
        </Routes>
      </MemoryRouter>
    );

    const crewTab = screen.getByRole("tab", { name: /crew/i });
    await user.click(crewTab);

    expect(localStorage.getItem("mainframe_active_tab")).toBe("crew");
  });

  it("selects the tab from the nested route", () => {
    localStorage.setItem("mainframe_active_tab", "vehicles");

    render(
      <MemoryRouter initialEntries={["/app/vehicles"]}>
        <Routes>
          <Route path="/app/:tabId" element={<MainframeShell />} />
        </Routes>
      </MemoryRouter>
    );

    const vehiclesTab = screen.getByRole("tab", { name: /hangar/i });
    expect(vehiclesTab).toHaveAttribute("aria-selected", "true");
  });
});
