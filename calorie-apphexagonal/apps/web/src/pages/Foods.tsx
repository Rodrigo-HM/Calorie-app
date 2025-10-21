import { useEffect, useState } from "react";
import { listFoods, type Food, addEntry } from "../api";
import SearchInput from "../components/ui/SearchInput";
import NumberStepper from "../components/ui/NumberStepper";
import Button from "../components/ui/Button";
import { ToastContainer } from "../components/ui/Toast";
import { useToasts } from "../hooks/useToast";
import Card, { CardHeader, CardTitle, CardContent } from "../components/ui/Card";

export default function Foods() {
const [q, setQ] = useState(""); //lo que escribe el usuario en el buscador
const [foods, setFoods] = useState<Food[]>([]); //lista de alimentos obtenida de la API
const [loading, setLoading] = useState(false);
const [err, setErr] = useState<string | null>(null);

const { toasts, push, remove } = useToasts();

useEffect(() => {
let active = true;
setLoading(true);
setErr(null);
(async () => {
try {
const res = await listFoods(q); //llamamos a la API con el texto de búsqueda
if (active) setFoods(res); //si el componente sigue montado, actualizamos la lista de alimentos
} catch (e) {
if (active) setErr((e as Error).message || "Error");
} finally {
if (active) setLoading(false); 
}
})();
return () => {
active = false;
};
}, [q]); //cada vez que cambie 'q', se vuelve a ejecutar el efecto

return (
<div className="grid gap-4">
<ToastContainer toasts={toasts} remove={remove} />

  <h1 className="m-0 text-xl font-semibold text-gray-900">Alimentos</h1>

  <div className="max-w-md">
    <SearchInput
      value={q}
      onChange={setQ}
      delay={300}
      placeholder="Buscar alimento..."
    />
  </div>

  {loading && <div className="text-sm text-gray-500">Cargando...</div>}
  {err && <div className="text-sm text-rose-600">{err}</div>}

  <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
    {foods.map((f) => (
      <FoodCard
        key={f.id}
        food={f}
        onAdded={(g) => push(`Añadido ${g} g de ${f.name}`, "success")}
        onError={(m) => push(m, "error")}
      />
    ))}
    {!loading && !err && foods.length === 0 && (
      <div className="text-sm text-gray-500">No se encontraron alimentos.</div>
    )}
  </div>
</div>
);
}

// Componente para mostrar cada alimento y permitir añadirlo
function FoodCard({  //props que recibe el componente
food, //el alimento a mostrar
onAdded, //función que se llama cuando se añade el alimento
onError,  //función que se llama si hay un error al añadir
}: { //definimos el tipo de las props
food: Food;
onAdded: (grams: number) => void;
onError: (msg: string) => void;
}) {
const [grams, setGrams] = useState<number>(100); //cantidad en gramos que el usuario quiere añadir, por defecto 100g
const [adding, setAdding] = useState(false); //estado para indicar si se está añadiendo el alimento
const [err, setErr] = useState<string | null>(null); //estado para errores al añadir

return (
<Card>
<CardHeader className="flex items-baseline justify-between">
<CardTitle className="!m-0 text-sm text-gray-900">{food.name}</CardTitle>
<span className="text-xs text-gray-500">{food.kcal} kcal / 100g</span>
</CardHeader>

  <CardContent>
    <div className="flex gap-3 text-xs text-gray-700">
      <span>P {food.protein}g</span>
      <span>C {food.carbs}g</span>
      <span>G {food.fat}g</span>
    </div>

    <div className="mt-3 flex items-center gap-2">
      <NumberStepper value={grams} onChange={setGrams} step={5} min={1} /> {/* Componente para seleccionar gramos */}
      <Button
        type="button" 
        disabled={adding || grams <= 0}    
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm"
        onClick={async () => {
          try {
            setErr(null);
            setAdding(true);
            await addEntry({ foodId: food.id, grams }); //llamamos a la API para añadir la entrada
            onAdded(grams); //llamamos a la función onAdded pasada por props para mostrar el toast
          } catch (e) {
            const msg = (e as Error).message || "Error al añadir";
            setErr(msg);
            onError(msg);
          } finally {
            setAdding(false);
          }
        }}
      >
        {adding ? "Añadiendo..." : "Añadir"}
      </Button>
    </div>

    {err && <div className="mt-2 text-xs text-rose-600">{err}</div>}
  </CardContent>
</Card>
);
}