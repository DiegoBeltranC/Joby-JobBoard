// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SelectorHabilidades from "./SelectorHabilidades";

const PLACEHOLDER = "Ej: React, Cocina Mexicana...";

describe("SelectorHabilidades", () => {
  it("agrega una habilidad capitalizada al presionar Enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SelectorHabilidades habilidades={[]} onChange={onChange} />);

    await user.type(screen.getByPlaceholderText(PLACEHOLDER), "react{Enter}");

    expect(onChange).toHaveBeenCalledWith(["React"]);
  });

  it("no agrega duplicados (case-insensitive)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SelectorHabilidades habilidades={["React"]} onChange={onChange} />);

    await user.type(screen.getByPlaceholderText(PLACEHOLDER), "react{Enter}");

    expect(onChange).not.toHaveBeenCalled();
  });

  it("respeta el límite de 15 habilidades", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const quince = Array.from({ length: 15 }, (_, i) => `Hab${i}`);
    render(<SelectorHabilidades habilidades={quince} onChange={onChange} />);

    await user.type(screen.getByPlaceholderText(PLACEHOLDER), "Nueva{Enter}");

    expect(onChange).not.toHaveBeenCalled();
  });

  it("quita una habilidad existente", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SelectorHabilidades habilidades={["React", "Node"]} onChange={onChange} />);

    await user.click(screen.getByLabelText("Quitar React"));

    expect(onChange).toHaveBeenCalledWith(["Node"]);
  });
});
