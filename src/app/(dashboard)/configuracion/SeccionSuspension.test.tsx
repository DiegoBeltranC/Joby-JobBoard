// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/actions/perfil", () => ({
  suspenderCuentaEstudiante: vi.fn(),
}));
vi.mock("@/actions/auth", () => ({
  logoutAction: vi.fn(),
}));

import SeccionSuspension from "./SeccionSuspension";

describe("SeccionSuspension", () => {
  it("abre el modal de confirmación al pulsar Suspender cuenta", async () => {
    const user = userEvent.setup();
    render(<SeccionSuspension isOpen onToggle={() => {}} />);

    expect(screen.queryByText("Suspender Cuenta")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Suspender cuenta" }));
    expect(screen.getByText("Suspender Cuenta")).toBeInTheDocument();
  });

  it("mantiene deshabilitado el botón de confirmar sin contraseña ni CONFIRMAR", async () => {
    const user = userEvent.setup();
    render(<SeccionSuspension isOpen onToggle={() => {}} />);

    await user.click(screen.getByRole("button", { name: "Suspender cuenta" }));
    const botones = screen.getAllByRole("button", { name: "Suspender cuenta" });
    expect(botones.some((b) => (b as HTMLButtonElement).disabled)).toBe(true);
  });

  it("llama onToggle al pulsar el encabezado Ajustes", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<SeccionSuspension isOpen={false} onToggle={onToggle} />);

    await user.click(screen.getByRole("button", { name: /Ajustes/ }));
    expect(onToggle).toHaveBeenCalled();
  });
});
