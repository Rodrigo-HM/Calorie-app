import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Input from "../../src/components/ui/Input";

describe("Input component", () => {
  it("renderiza correctamente", () => {
    render(<Input placeholder="Escribe algo" />);
    const input = screen.getByPlaceholderText("Escribe algo");
    expect(input).toBeInTheDocument();
  });

  it("aplica clase extra pasada por props", () => {
    render(<Input placeholder="Test" className="extra-class" />);
    const input = screen.getByPlaceholderText("Test");
    expect(input).toHaveClass("extra-class");
  });

  it("dispara onChange al cambiar el valor", () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Cambio" onChange={handleChange} />);
    const input = screen.getByPlaceholderText("Cambio");
    fireEvent.change(input, { target: { value: "Hola" } });
    expect(handleChange).toHaveBeenCalled();
  });
});
