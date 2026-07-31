// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SelectorIdiomas from "./SelectorIdiomas";
import catalogos from "@/lib/data/idiomas.json";

const idioma = catalogos.lista[0];
const nivel = catalogos.niveles[0];
const esperado = `${idioma} - ${nivel.split(" - ")[0]}`;

describe("SelectorIdiomas", () => {
  it("agrega un idioma con su nivel", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SelectorIdiomas idiomas={[]} onChange={onChange} />);

    const [selIdioma, selNivel] = screen.getAllByRole("combobox");
    await user.selectOptions(selIdioma, idioma);
    await user.selectOptions(selNivel, nivel);
    await user.click(screen.getByRole("button", { name: /Añadir/ }));

    expect(onChange).toHaveBeenCalledWith([esperado]);
  });

  it("no agrega si falta el idioma o el nivel", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SelectorIdiomas idiomas={[]} onChange={onChange} />);

    const [selIdioma] = screen.getAllByRole("combobox");
    await user.selectOptions(selIdioma, idioma); // sin nivel
    await user.click(screen.getByRole("button", { name: /Añadir/ }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("no duplica un idioma ya agregado", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SelectorIdiomas idiomas={[esperado]} onChange={onChange} />);

    const [selIdioma, selNivel] = screen.getAllByRole("combobox");
    await user.selectOptions(selIdioma, idioma);
    await user.selectOptions(selNivel, nivel);
    await user.click(screen.getByRole("button", { name: /Añadir/ }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("quita un idioma existente", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SelectorIdiomas idiomas={["Inglés - B1", "Francés - A2"]} onChange={onChange} />);

    await user.click(screen.getAllByLabelText("Quitar idioma")[0]);

    expect(onChange).toHaveBeenCalledWith(["Francés - A2"]);
  });
});
