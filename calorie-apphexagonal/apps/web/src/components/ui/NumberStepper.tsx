import { useCallback, useEffect, useState } from "react";

type Props = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  className?: string;
};

export default function NumberStepper({
  value,
  min = 1,
  max = 5000,
  step = 5,
  onChange,
  className = "",
}: Props) {
const [text, setText] = useState<string>(String(value));

// Sincroniza buffer cuando el value externo cambia (por ejemplo tras guardar o recargar)
useEffect(() => {
  setText(String(value));
}, [value]);

const dec = useCallback(() => {
  const next = Math.max(min, value - step);
  onChange(next);
}, [value, min, step, onChange]);

const inc = useCallback(() => {
  const next = Math.min(max, value + step);
  onChange(next);
}, [value, max, step, onChange]);

// Confirmar al perder foco o al pulsar Enter: clamp y aplica
const commit = useCallback(() => {
  const n = parseInt(text, 10);
  if (Number.isNaN(n)) {
    // si está vacío o no numérico, vuelve al último value
    setText(String(value));
    return;
  }
  const clamped = Math.min(max, Math.max(min, n));
  if (clamped !== value) onChange(clamped);
  setText(String(clamped));
}, [text, value, min, max, onChange]);

return (
<div className={["inline-flex shrink-0 items-center overflow-hidden rounded-md border border-gray-300", className].join(" ")}>
<button type="button" onClick={dec} className="min-w-[36px] bg-gray-100 px-3 py-1.5 hover:bg-gray-200" aria-label="Disminuir" >
−
</button>

  <input
    type="text"
    inputMode="numeric"
    value={text}
    onChange={(e) => {
      const v = e.target.value;
      // Permitimos vacío o dígitos; bloquea otros caracteres
      if (v === "" || /^[0-9]+$/.test(v)) {
        setText(v);
      }
    }}
    onBlur={commit}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        (e.currentTarget as HTMLInputElement).blur();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        inc();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        dec();
      }
    }}
    className="w-28 border-0 px-2 py-1.5 text-center text-sm outline-none"
    aria-label="Cantidad"
  />

  <button
    type="button"
    onClick={inc}
    className="min-w-[36px] bg-gray-100 px-3 py-1.5 hover:bg-gray-200"
    aria-label="Aumentar"
  >
    +
  </button>
</div>
);
}