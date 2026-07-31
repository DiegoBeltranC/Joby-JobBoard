// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/actions/perfil", () => ({
  actualizarPasswordEstudiante: vi.fn(),
}));

import SeccionSeguridad from "./SeccionSeguridad";

describe("SeccionSeguridad", () => {
  it("muestra errores de validación al enviar vacío", async () => {
    const user = userEvent.setup();
    render(<SeccionSeguridad isOpen onToggle={() => {}} />);

    await user.click(screen.getByRole("button", { name: /Actualizar contraseña/ }));

    expect(screen.getByText("La contraseña actual es requerida")).toBeInTheDocument();
  });

  it("exige que la confirmación coincida", async () => {
    const user = userEvent.setup();
    render(<SeccionSeguridad isOpen onToggle={() => {}} />);

    await user.type(screen.getByLabelText("Contraseña actual *"), "vieja123");
    await user.type(screen.getByLabelText("Nueva contraseña *"), "nueva1234");
    await user.type(screen.getByLabelText("Confirmar nueva contraseña *"), "otra1234");
    await user.click(screen.getByRole("button", { name: /Actualizar contraseña/ }));

    expect(screen.getByText("Las contraseñas no coinciden")).toBeInTheDocument();
  });

  it("llama onToggle al hacer clic en el encabezado", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<SeccionSeguridad isOpen={false} onToggle={onToggle} />);

    await user.click(screen.getByRole("button", { name: /Seguridad/ }));

    expect(onToggle).toHaveBeenCalled();
  });
});
