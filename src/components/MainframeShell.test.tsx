import React from "react";
import { MemoryRouter } from "react-router-dom";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MainframeShell from "./MainframeShell";

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
      <MemoryRouter>
        <MainframeShell />
      </MemoryRouter>
    );

    const crewTab = screen.getByRole("tab", { name: /crew & sheets/i });
    await user.click(crewTab);

    expect(localStorage.getItem("mainframe_active_tab")).toBe("crew");
  });

  it("restores stored tab on load", () => {
    localStorage.setItem("mainframe_active_tab", "vehicles");

    render(
      <MemoryRouter>
        <MainframeShell />
      </MemoryRouter>
    );

    const vehiclesTab = screen.getByRole("tab", { name: /vehicles & spaceships/i });
    expect(vehiclesTab).toHaveAttribute("aria-selected", "true");
  });
});
