import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getEntries, listFoods, deleteEntry, getGoals,updateEntry } from "../api";
import type { Food, Goals } from "../api";
import Card, { CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";
import { ToastContainer } from "../components/ui/Toast";
import { useToasts } from "../hooks/useToast";
import NumberStepper from "../components/ui/NumberStepper";


type EntriesResponse = { //definimos el tipo de la respuesta de la API
  items: { id: string; userId: string; foodId: string; grams: number; date: string }[];
  totals: { kcal: number; protein: number; carbs: number; fat: number };
};

function isoDateToday() {
  return new Date().toISOString().slice(0, 10); //deviuelve la fecha de hoy en formato ISO (YYYY-MM-DD)
}

  export default function Diary() {
  const [date, setDate] = useState<string>(isoDateToday());
  const [data, setData] = useState<EntriesResponse | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [goals, setGoalsState] = useState<Goals | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null); //id de la entrada que se está eliminando para deshabilitar su botón
  // Estado local para edición por fila: id -> { grams, saving }
  const [editing, setEditing] = useState<Record<string, { grams: number; saving: boolean }>>({});

  const { toasts, push, remove } = useToasts();
  const pushRef = useRef(push); //usamos un ref para tener siempre la última versión de push en callbacks
  useEffect(() => { pushRef.current = push; }, [push]);

  const load = useCallback(async (d: string) => {
  let active = true;
  setLoading(true);
  setErr(null);
  try {
    const [entriesRes, foodsRes, goalsRes] = await Promise.all([
    getEntries(d),
    listFoods(""),
    getGoals(),
    ]);
    if (!active) return;
    setData(entriesRes);
    setFoods(foodsRes);
    setGoalsState(goalsRes);
    // Sincroniza estado de edición con lo que viene del backend
    const nextEditing: Record<string, { grams: number; saving: boolean }> = {};
    entriesRes.items.forEach((it) => {
    nextEditing[it.id] = { grams: it.grams, saving: false };
    });
    setEditing(nextEditing);
  } catch (e) {
    const msg = (e as Error).message || "Error al cargar el diario";
    setErr(msg);
    pushRef.current?.(msg, "error");
  } finally {
    if (active) setLoading(false);
  }
  return () => {
    active = false;
  };
  }, []);

  useEffect(() => {
    void load(date);
  }, [date, load]);

  const foodMap = useMemo(() => new Map(foods.map((f) => [f.id, f])), [foods]);
  const totals = data?.totals ?? { kcal: 0, protein: 0, carbs: 0, fat: 0 };

  const kcal = totals.kcal;
  const kcalGoal = goals?.calories ?? 0;
  const pct = kcalGoal > 0 ? Math.min(1, kcal / kcalGoal) : 0;

  function onChangeDate(next: string) {
  const today = isoDateToday();
  if (next > today) {
    setDate(today);
    pushRef.current?.("No puedes seleccionar fechas futuras", "info");
    return;
  }
  setDate(next);
  }

  async function onDelete(id: string) {
    try {
      setRemovingId(id);
      await deleteEntry(id);
      await load(date);
      pushRef.current?.("Entrada eliminada", "success");
    } catch (e) {
      const msg = (e as Error).message || "No se pudo eliminar";
      setErr(msg);
      pushRef.current?.(msg, "error");
    } finally {
      setRemovingId(null);
    }
  }

  function setEditingGrams(id: string, grams: number) {
    setEditing((m) => ({ ...m, [id]: { grams, saving: m[id]?.saving ?? false } }));
  }

  async function onSaveGrams(id: string, originalGrams: number) {
  const current = editing[id];
    if (!current) return;
    const grams = current.grams;
    // Si no hay cambios, no llamamos al backend
    if (grams === originalGrams) return;
    try {
      setEditing((m) => ({ ...m, [id]: { ...m[id], saving: true } }));
      await updateEntry(id, grams);
      await load(date);
      pushRef.current?.("Entrada actualizada", "success");
    } catch (e) {
      const msg = (e as Error).message || "No se pudo actualizar";
      setErr(msg);
      pushRef.current?.(msg, "error");
      // Revertimos a original si falla
      setEditing((m) => ({ ...m, [id]: { grams: originalGrams, saving: false } }));
    } finally {
      setEditing((m) => ({ ...m, [id]: { ...m[id], saving: false } }));
    }
  }

  return (
  <div className="grid gap-4">
  <ToastContainer toasts={toasts} remove={remove} />

    {/* Fecha (solo pasado y hoy) */}
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={date}
        max={isoDateToday()}
        onChange={(e) => onChangeDate(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
      />
      <Button className="px-2.5 py-1 text-sm" onClick={() => setDate(isoDateToday())} title="Ir a hoy">
        Hoy
      </Button>
    </div>

    {/* Totales + Progreso */}
    <Card>
      <CardHeader>
        <CardTitle>Totales del día</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-lg font-semibold">
          {kcal.toFixed(0)} kcal
          <span className="ml-3 text-sm text-gray-500">
            P {totals.protein.toFixed(1)} • C {totals.carbs.toFixed(1)} • G {totals.fat.toFixed(1)}
          </span>
        </div>

        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-gray-600">Calorías</span>
            <span className="text-gray-700">
              {kcal.toFixed(0)} / {kcalGoal || "—"} kcal
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${pct * 100}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>

    {loading && <div className="text-sm text-gray-500">Cargando...</div>}
    {err && <div className="text-sm text-rose-600">{err}</div>}

    {/* Lista editable */}
    <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
      {data?.items.map((it) => {
        const f = foodMap.get(it.foodId);
        const row = editing[it.id];
        const gramsValue = row ? row.grams : it.grams;
        const saving = row ? row.saving : false;

        return (
          <li key={it.id} className="flex items-center justify-between px-4 py-2">
            <div className="text-sm text-gray-800">
              <span className="font-medium">{f ? f.name : it.foodId}</span>
              <span className="ml-2 text-gray-500">{it.date.slice(11, 16)}</span>
            </div>

            <div className="flex items-center gap-2">
              <NumberStepper value={gramsValue} onChange={(v) => setEditingGrams(it.id, v)} step={5} min={1} />
              <Button
                size="sm"
                disabled={saving}
                onClick={() => onSaveGrams(it.id, it.grams)}
                className="text-sm"
              >
                {saving ? "Guardando..." : "Guardar"}
              </Button>

              <Button
                variant="danger"
                size="sm"
                disabled={removingId === it.id}
                onClick={() => onDelete(it.id)}
                className="text-sm"
              >
                {removingId === it.id ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </li>
        );
      })}
      {(!data || data.items.length === 0) && !loading && !err && (
        <li className="px-4 py-3 text-sm text-gray-500">Sin entradas en esta fecha.</li>
      )}
    </ul>
  </div>
  );
}