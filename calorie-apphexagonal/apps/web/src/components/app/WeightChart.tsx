import { useState, useEffect } from "react";

type Point = { x: number; y: number };
type Props = { logs: { date: string; weightKg: number }[]; width?: number; height?: number };

export default function WeightChart({ logs, width = 420, height = 160 }: Props) {
  const pageSize = 10; // registros por “página”
  const [startIndex, setStartIndex] = useState(0);

// Cuando cambian los logs, ajustamos para mostrar últimos 10
useEffect(() => {
  setStartIndex(Math.max(0, logs.length - pageSize));
}, [logs]);

  if (logs.length === 0) return <div className="text-sm text-gray-500">Sin datos de peso</div>;

  const displayLogs = logs.slice(startIndex, startIndex + pageSize);
  const xs = displayLogs.map((_, i) => i);
  const ws = displayLogs.map(l => l.weightKg);
  const minW = Math.min(...ws);
  const maxW = Math.max(...ws);
  const pad = 24; // espacio para etiquetas
  const W = width, H = height;

  const points: Point[] = xs.map((x, i) => {
    const normX = pad + (x / Math.max(1, xs.length - 1)) * (W - 2 * pad);
    const normY = pad + (1 - (ws[i] - minW) / Math.max(0.001, maxW - minW)) * (H - 2 * pad);
    return { x: normX, y: normY };
  });

  const path = points
    .map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`))
    .join(" ");

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {/* Botón anterior */}
        <button
          onClick={() => setStartIndex(prev => Math.max(prev - pageSize, 0))}
          disabled={startIndex === 0}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          ← Anteriores
        </button>

        {/* Botón siguiente */}
        <button
          onClick={() => setStartIndex(Math.max(logs.length - pageSize, 0))}
          disabled={startIndex + pageSize >= logs.length}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          Últimos 10 →
        </button>
      </div>

      <svg width={W} height={H} className="rounded-md border border-gray-200 bg-white">
        <path d={path} fill="none" stroke="#2563eb" strokeWidth={2} />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={2.5} fill="#2563eb" />
            {/* Peso encima */}
            <text x={p.x} y={p.y - 6} textAnchor="middle" fontSize="10" fill="#111">{ws[i].toFixed(1)}kg</text>
            {/* Fecha debajo */}
            <text x={p.x} y={H - 6} textAnchor="middle" fontSize="10" fill="#555">
              {displayLogs[i].date.slice(5, 10)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
