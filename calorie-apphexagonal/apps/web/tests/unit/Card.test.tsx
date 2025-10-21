import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from "../../src/components/ui/Card";

describe("Card component", () => {
  it("renderiza children dentro del Card", () => {
    render(<Card>Hola mundo</Card>);
    expect(screen.getByText("Hola mundo")).toBeInTheDocument();
  });

  it("aplica la clase extra pasada por props", () => {
  render(<Card className="extra-class">Contenido</Card>);
  const card = screen.getByText("Contenido").closest("div"); // busca el div padre más cercano
  expect(card).toHaveClass("extra-class");
});
});

describe("Card subcomponents", () => {
  it("CardHeader renderiza children y clase extra", () => {
    render(<CardHeader className="extra-header">Header</CardHeader>);
    const header = screen.getByText("Header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass("extra-header");
  });

  it("CardTitle renderiza children y clase extra", () => {
    render(<CardTitle className="extra-title">Título</CardTitle>);
    const title = screen.getByText("Título");
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass("extra-title");
  });

  it("CardContent renderiza children y clase extra", () => {
    render(<CardContent className="extra-content">Contenido interno</CardContent>);
    const content = screen.getByText("Contenido interno");
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass("extra-content");
  });

  it("CardFooter renderiza children y clase extra", () => {
    render(<CardFooter className="extra-footer">Footer</CardFooter>);
    const footer = screen.getByText("Footer");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass("extra-footer");
  });

  it("CardFooter puede reaccionar a eventos", () => {
    const handleClick = vi.fn();
    render(
      <CardFooter>
        <button onClick={handleClick}>Botón</button>
      </CardFooter>
    );
    fireEvent.click(screen.getByText("Botón"));
    expect(handleClick).toHaveBeenCalled();
  });
});
