import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SearchInput from "../../src/components/ui/SearchInput";
describe("SearchInput component", () => {
  it("renderiza con valor inicial y placeholder", () => {
    render(<SearchInput value="hola" onChange={() => {}} placeholder="Buscar algo..." />);
    const input = screen.getByPlaceholderText("Buscar algo...") as HTMLInputElement;
    expect(input.value).toBe("hola");
  });

  it("muestra label si se pasa prop label", () => {
    render(<SearchInput value="" onChange={() => {}} label="Buscar" />);
    expect(screen.getByText("Buscar")).toBeInTheDocument();
  });

  it("renderiza leftIcon y rightIcon si se pasan", () => {
    render(
      <SearchInput
        value=""
        onChange={() => {}}
        leftIcon={<span data-testid="left">L</span>}
        rightIcon={<span data-testid="right">R</span>}
      />
    );

    expect(screen.getByTestId("left")).toBeInTheDocument();
    expect(screen.getByTestId("right")).toBeInTheDocument();
  });

  it("cambia valor y llama a onChange después del delay", async () => {
    let val = "";
    const handleChange = (v: string) => (val = v);

    render(<SearchInput value="" onChange={handleChange} delay={100} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "nuevo" } });
    expect(input.value).toBe("nuevo");

    await waitFor(() => expect(val).toBe("nuevo"), { timeout: 200 });
  });

  it("actualiza el valor si cambia la prop externa", () => {
    const { rerender } = render(<SearchInput value="inicial" onChange={() => {}} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("inicial");

    rerender(<SearchInput value="externo" onChange={() => {}} />);
    expect(input.value).toBe("externo");
  });
});
