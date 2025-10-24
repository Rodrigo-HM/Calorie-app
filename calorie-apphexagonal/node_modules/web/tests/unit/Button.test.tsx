import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../../src/components/ui/Button";
describe("Button", () => {
  it("renderiza el botón con children", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByText("Click me");
    expect(button).toBeInTheDocument();
  });

  it("aplica la clase del variant y size por defecto", () => {
    render(<Button>Test</Button>);
    const button = screen.getByText("Test");
    expect(button).toHaveClass("bg-gray-900"); // primary por defecto
    expect(button).toHaveClass("px-3"); // md por defecto
  });

  it("aplica la clase del variant y size personalizados", () => {
    render(
      <Button variant="danger" size="lg">
        Danger
      </Button>
    );
    const button = screen.getByText("Danger");
    expect(button).toHaveClass("bg-rose-600"); // danger
    expect(button).toHaveClass("px-4"); // lg
  });

  it("llama onClick al hacer click", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    const button = screen.getByText("Click");
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("permite agregar className extra", () => {
    render(<Button className="extra-class">Extra</Button>);
    const button = screen.getByText("Extra");
    expect(button).toHaveClass("extra-class");
  });
});
