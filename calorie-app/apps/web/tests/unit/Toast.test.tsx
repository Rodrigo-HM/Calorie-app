import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToastContainer } from "../../src/components/ui/Toast";
import { Toast } from "../../src/hooks/useToast";

describe("ToastContainer", () => {
  it("renderiza todos los toasts pasados", () => {
    const remove = vi.fn();
    const toasts: Toast[] = [
  { id: "1", message: "Éxito", type: "success" },
  { id: "2", message: "Error", type: "error" },
  { id: "3", message: "Info", type: "info" },
];

    render(<ToastContainer toasts={toasts} remove={remove} />);

    expect(screen.getByText("Éxito")).toBeInTheDocument();
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Info")).toBeInTheDocument();
  });

  it("llama a remove al hacer click en un toast", () => {
    const remove = vi.fn();
    const toasts: Toast[] = [{ id: "1", message: "Éxito", type: "success" }];

    render(<ToastContainer toasts={toasts} remove={remove} />);

    fireEvent.click(screen.getByText("Éxito"));
    expect(remove).toHaveBeenCalledWith("1");
  });

  it("aplica la clase correcta según el type", () => {
    const remove = vi.fn();
    const toasts: Toast[] = [
      { id: "1", message: "Éxito", type: "success" },
      { id: "2", message: "Error", type: "error" },
      { id: "3", message: "Info", type: "info" },
    ];

    render(<ToastContainer toasts={toasts} remove={remove} />);

    expect(screen.getByText("Éxito")).toHaveClass("bg-emerald-50");
    expect(screen.getByText("Error")).toHaveClass("bg-rose-50");
    expect(screen.getByText("Info")).toHaveClass("bg-indigo-50");
  });
});
