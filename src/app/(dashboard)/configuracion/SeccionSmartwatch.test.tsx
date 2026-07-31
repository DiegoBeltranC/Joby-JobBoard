// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/actions/smartwatch", () => ({
  vincularRelojAction: vi.fn(),
  desvincularRelojAction: vi.fn(),
}));

import SeccionSmartwatch from "./SeccionSmartwatch";

describe("SeccionSmartwatch", () => {
  it("muestra el estado conectado cuando el reloj está vinculado", () => {
    render(<SeccionSmartwatch isOpen relojVinculado onToggle={() => {}} />);

    expect(screen.getByText("Reloj Conectado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Desvincular Reloj/ })).toBeInTheDocument();
  });

  it("muestra el formulario de vinculación cuando no hay reloj", () => {
    render(<SeccionSmartwatch isOpen relojVinculado={false} onToggle={() => {}} />);

    expect(screen.getByText("Vincular Smartwatch")).toBeInTheDocument();
  });

  it("habilita el botón solo con un código de 6 caracteres", async () => {
    const user = userEvent.setup();
    render(<SeccionSmartwatch isOpen relojVinculado={false} onToggle={() => {}} />);

    const boton = screen.getByRole("button", { name: /Vincular Reloj/ });
    expect(boton).toBeDisabled();

    await user.type(screen.getByPlaceholderText("Ej. 123456"), "abc123");
    expect(boton).not.toBeDisabled();
  });

  it("llama onToggle al hacer clic en el encabezado", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<SeccionSmartwatch isOpen={false} relojVinculado={false} onToggle={onToggle} />);

    await user.click(screen.getByRole("button", { name: /Reloj Inteligente/ }));
    expect(onToggle).toHaveBeenCalled();
  });
});
