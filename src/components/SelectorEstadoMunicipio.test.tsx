// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SelectorEstadoMunicipio from "./SelectorEstadoMunicipio";
import { listaEstados } from "@/lib/ubicacionesMexico";

const noop = () => {};

describe("SelectorEstadoMunicipio", () => {
  it("muestra los placeholders y deshabilita municipio sin estado", () => {
    render(<SelectorEstadoMunicipio estado="" municipio="" onEstadoChange={noop} onMunicipioChange={noop} />);

    expect(screen.getByText("Buscar estado...")).toBeInTheDocument();
    const municipioBtn = screen.getByText("Primero elige un estado").closest("button");
    expect(municipioBtn).toBeDisabled();
  });

  it("habilita municipio cuando ya hay un estado", () => {
    render(
      <SelectorEstadoMunicipio estado={listaEstados[0]} municipio="" onEstadoChange={noop} onMunicipioChange={noop} />,
    );

    expect(screen.getByText(listaEstados[0])).toBeInTheDocument();
    const municipioBtn = screen.getByText("Buscar municipio...").closest("button");
    expect(municipioBtn).not.toBeDisabled();
  });

  it("muestra los mensajes de error cuando se pasan", () => {
    render(
      <SelectorEstadoMunicipio
        estado=""
        municipio=""
        onEstadoChange={noop}
        onMunicipioChange={noop}
        errorEstado="Selecciona un estado"
        errorMunicipio="Selecciona un municipio"
      />,
    );

    expect(screen.getByText("Selecciona un estado")).toBeInTheDocument();
    expect(screen.getByText("Selecciona un municipio")).toBeInTheDocument();
  });

  it("al elegir un estado notifica el valor y reinicia el municipio", async () => {
    const user = userEvent.setup();
    const onEstadoChange = vi.fn();
    const onMunicipioChange = vi.fn();

    render(
      <SelectorEstadoMunicipio
        estado=""
        municipio=""
        onEstadoChange={onEstadoChange}
        onMunicipioChange={onMunicipioChange}
      />,
    );

    await user.click(screen.getByText("Buscar estado..."));
    await user.click(await screen.findByRole("option", { name: listaEstados[0] }));

    expect(onEstadoChange).toHaveBeenCalledWith(listaEstados[0]);
    expect(onMunicipioChange).toHaveBeenCalledWith(""); // se reinicia el municipio
  });
});
