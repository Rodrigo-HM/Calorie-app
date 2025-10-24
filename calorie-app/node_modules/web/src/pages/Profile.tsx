import { useEffect, useRef, useState } from "react";
import {
    getProfile,
    setProfile,
    getGoals,
    getWeightLogs,
    addWeightLog,
    type Profile as ApiProfile,
    type Goals,
    type WeightLog,
} from "../api";
import Card, { CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { ToastContainer } from "../components/ui/Toast";
import { useToasts } from "../hooks/useToast";
import WeightChart from "../components/app/WeightChart";

// Tipos para el formulario
type Sex = "male" | "female";
type Activity = "sedentary" | "light" | "moderate" | "active" | "veryActive";
type GoalKind = "cut" | "maintain" | "bulk";

type Form = {
    sex: Sex;
    age: number | "";
    heightCm: number | "";
    weightKg: number | "";
    bodyFat: number | ""; // opcional
    activity: Activity;
    goal: GoalKind;
};

const emptyForm: Form = {
    sex: "male",
    age: "",
    heightCm: "",
    weightKg: "",
    bodyFat: "",
    activity: "moderate",
    goal: "maintain",
};

export default function Profile() {
    // estados del formulario
    const [form, setForm] = useState<Form>(emptyForm); //valores del formulario vacíos al inicio
    const [hasProfile, setHasProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    // estados de metas y peso
    const [goals, setGoalsState] = useState<Goals | null>(null);
    const [logs, setLogs] = useState<WeightLog[]>([]);
    const [newWeight, setNewWeight] = useState<string>("");
    const [addingWeight, setAddingWeight] = useState(false);

    // Manejo de toasts
    const { toasts, push, remove } = useToasts();
    const pushRef = useRef(push);
    useEffect(() => { pushRef.current = push; }, [push]);

    // Cargar perfil inicial (una vez)
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const p = await getProfile();
                if (!active) return;
                if (p) {
                    setForm({
                    sex: p.sex,
                    age: p.age,
                    heightCm: p.heightCm,
                    weightKg: p.weightKg,
                    bodyFat: p.bodyFat ?? "",
                    activity: p.activity,
                    goal: p.goal,
                    });
                    setHasProfile(true);
                } else {
                    setForm(emptyForm);
                    setHasProfile(false);
                }
            } catch (e) {
                const msg = (e as Error).message || "Error al cargar perfil";
                setErr(msg);
                pushRef.current?.(msg, "error");
            } finally {
                if (active) setLoading(false);
            }
        })();
            return () => { active = false; };
    }, []);

    // Cargar metas y weight logs solo cuando hay perfil
    useEffect(() => {
        if (!hasProfile) return;
        let active = true; //evitar actualizar el estado si el componente se desmonta antes de que termine la petición asíncrona.
        (async () => {
            try {
                const [g, wl] = await Promise.all([getGoals(), getWeightLogs()]); //carga paralela de metas y logs
                if (!active) return; //si el componente se ha desmontado, no actualiza el estado y asi no da error
                setGoalsState(g);
                setLogs(wl);
            } catch (e) {
                pushRef.current?.((e as Error).message || "Error cargando metas/peso", "error");
            }
        })();
            return () => { active = false; }; //cuando se desmonte, active pasa a false
    }, [hasProfile]);

    // Helpers: enteros (edad/altura), decimales (peso/%grasa), selects
    function setInt<K extends keyof Form>(key: K, raw: string) {
        if (raw === "") {
            setForm((f) => ({ ...f, [key]: "" } as Form));
            return;
        }
        const n = parseInt(raw, 10);
        if (!Number.isNaN(n)) setForm((f) => ({ ...f, [key]: n } as Form));
    }

    function setFloat<K extends keyof Form>(key: K, raw: string) {
        if (raw === "") {
            setForm((f) => ({ ...f, [key]: "" } as Form));
            return;
        }
        const n = parseFloat(raw);
        if (!Number.isNaN(n)) setForm((f) => ({ ...f, [key]: n } as Form));
    }

    function setSelect<K extends keyof Form>(key: K, value: Form[K]) {
        setForm((f) => ({ ...f, [key]: value }));
    }

    // Actualiza logs desde la API
    async function refreshLogs() {
        try {
            const wl = await getWeightLogs();
            setLogs(wl);
        } catch (e) {
            pushRef.current?.((e as Error).message || "No se pudo refrescar el peso", "error");
        }
    }

    // Vincular ambos flujos de peso:
    // - Si guardas perfil con peso distinto -> crea weight log
    // - Si añades weight log -> actualiza el perfil con ese peso, recalcula metas y sincroniza UI
    async function onSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);
        try {
            if (form.age === "" || form.heightCm === "" || form.weightKg === "") {
                throw new Error("Completa edad, altura y peso");
            }
            const body: ApiProfile = {
                sex: form.sex,
                age: form.age as number,
                heightCm: form.heightCm as number,
                weightKg: form.weightKg as number,
                bodyFat: form.bodyFat === "" ? undefined : (form.bodyFat as number),
                activity: form.activity,
                goal: form.goal,
            };

            const prev = await getProfile();
            const prevWeight = prev?.weightKg;

            await setProfile(body);
            setHasProfile(true);

            // Si cambió el peso, crea un log de hoy
            if (prevWeight == null || prevWeight !== body.weightKg) {
                await addWeightLog({ weightKg: body.weightKg });
                await refreshLogs();
            }

            // Refrescar metas
            const g = await getGoals();
            setGoalsState(g);

            pushRef.current?.("Perfil y metas actualizados", "success");
        } catch (e) {
            const msg = (e as Error).message || "No se pudieron guardar";
            setErr(msg);
        pushRef.current?.(msg, "error");
        } finally {
            setSaving(false);
        }
    }

    // Accion centralizada para añadir peso y actualizar perfil/metas/logs
    async function addWeightAndUpdateProfile(n: number) {
        // 1) Log de peso
        await addWeightLog({ weightKg: n });
        // 2) Actualizar perfil con el nuevo peso
        const body: ApiProfile = {
            sex: form.sex,
            age: form.age as number,
            heightCm: form.heightCm as number,
            weightKg: n,
            bodyFat: form.bodyFat === "" ? undefined : (form.bodyFat as number),
            activity: form.activity,
            goal: form.goal,
        };
        await setProfile(body);
        // 3) Sincronizar UI local
        setForm((f) => ({ ...f, weightKg: n }));
        await refreshLogs();
        const g = await getGoals();
        setGoalsState(g);
    }

    return (
    <div className="grid gap-4">
        <ToastContainer toasts={toasts} remove={remove} />
        <h1 className="m-0 text-xl font-semibold text-gray-900">Perfil</h1>

        <Card>
            <CardHeader>
            <CardTitle>{hasProfile ? "Resumen de perfil" : "Completa tu perfil"}</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-sm text-gray-500">Cargando...</div>
                ) : hasProfile ? (
                    <ProfileSummary
                        goals={goals}
                        formGoal={form.goal}
                        logs={logs}
                        onChangeObjective={() => setHasProfile(false)}
                        newWeight={newWeight}
                        setNewWeight={setNewWeight}
                        age={form.age}
                        heightCm={form.heightCm}
                        weightKg={form.weightKg}
                        bodyFat={form.bodyFat}
                        activity={form.activity}
                        addingWeight={addingWeight}
                        onAddWeight={async () => {
                            if (!newWeight) return;
                            const n = parseFloat(newWeight);
                            if (!Number.isFinite(n) || n <= 0 || n > 200) {
                                pushRef.current?.("Peso inválido", "error");
                                return;
                            }
                            try {
                                setAddingWeight(true);
                                await addWeightAndUpdateProfile(n);
                                setNewWeight("");
                                pushRef.current?.("Peso añadido y perfil actualizado", "success");
                            } catch (e) {
                                pushRef.current?.((e as Error).message || "No se pudo añadir el peso", "error");
                            } finally {
                                setAddingWeight(false);
                            }
                        }}
                    />
                ) : (
                    <form onSubmit={onSave} className="grid max-w-lg gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <label className="text-sm text-gray-700">
                            Sexo
                            <select
                                value={form.sex}
                                onChange={(e) => setSelect("sex", e.target.value as Sex)}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            >
                                <option value="male">Hombre</option>
                                <option value="female">Mujer</option>
                            </select>
                        </label>

                        <label className="text-sm text-gray-700">
                        Edad
                        <Input
                            type="number"
                            min={12}
                            max={99}
                            value={form.age}
                            onChange={(e) => setInt("age", e.target.value)}
                            className="mt-1"
                        />
                        </label>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <label className="text-sm text-gray-700">
                        Altura (cm)
                        <Input
                            type="number"
                            min={100}
                            max={250}
                            value={form.heightCm}
                            onChange={(e) => setInt("heightCm", e.target.value)}
                            className="mt-1"
                        />
                        </label>

                        <label className="text-sm text-gray-700">
                        Peso (kg)
                        <Input
                            type="number"
                            min={30}
                            step={0.1}
                            value={form.weightKg}
                            onChange={(e) => setFloat("weightKg", e.target.value)}
                            className="mt-1"
                        />
                        </label>

                        <label className="text-sm text-gray-700">
                        % Grasa (opcional)
                        <Input
                            type="number"
                            min={0}
                            max={60}
                            step={0.1}
                            value={form.bodyFat}
                            onChange={(e) => setFloat("bodyFat", e.target.value)}
                            className="mt-1"
                        />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="text-sm text-gray-700">
                        Actividad
                        <select
                            value={form.activity}
                            onChange={(e) => setSelect("activity", e.target.value as Activity)}
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="sedentary">Sedentario</option>
                            <option value="light">Ligero (1-3 d/sem)</option>
                            <option value="moderate">Moderado (3-5 d/sem)</option>
                            <option value="active">Activo (6-7 d/sem)</option>
                            <option value="veryActive">Muy activo (2 sesiones/día)</option>
                        </select>
                        </label>

                        <label className="text-sm text-gray-700">
                        Objetivo
                        <select
                            value={form.goal}
                            onChange={(e) => setSelect("goal", e.target.value as GoalKind)}
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="cut">Pérdida (definición)</option>
                            <option value="maintain">Mantenimiento</option>
                            <option value="bulk">Volumen</option>
                        </select>
                        </label>
                    </div>

                    <Button type="submit" disabled={saving} className="mt-2 w-full">
                        {saving ? "Guardando..." : hasProfile ? "Actualizar perfil y metas" : "Calcular y guardar metas"}
                    </Button>

                    {err && <div className="text-sm text-rose-600">{err}</div>}
                    </form>
                )}
            </CardContent>
        </Card>
    </div>
    );
}

// Resumen: metas, fase y gráfico de peso + añadir peso
function ProfileSummary(props: {
    goals: Goals | null;
    formGoal: "cut" | "maintain" | "bulk";
    logs: WeightLog[];
    onChangeObjective: () => void;
    newWeight: string;
    setNewWeight: (v: string) => void;
    addingWeight: boolean;
    onAddWeight: () => Promise<void>;
    age: number | "";
    heightCm: number | "";
    weightKg: number | "";
    bodyFat: number | "";
    activity: Activity;
}) {
const { goals, formGoal, logs, onChangeObjective, newWeight, setNewWeight, addingWeight, onAddWeight } = props;

const fase =
formGoal === "cut" ? "Definición"
: formGoal === "bulk" ? "Volumen"
: "Mantenimiento";

// Estado para la imagen del usuario (placeholder local)
const [userImage, setUserImage] = useState<string | null>(null);

const uploadNewImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => setUserImage(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };
    input.click();
};

return (
<>
{/* Bloque superior: Objetivo y Peso */}
<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 text-base font-semibold text-gray-900">Objetivo actual</div>
        <div className="text-sm text-gray-700">
            Fase: <strong>{fase}</strong>
        </div>
        {goals ? (
            <ul className="mt-2 text-sm space-y-2 text-gray-800">
            <li><strong>{goals.calories}</strong> kcal</li>
            <li>Proteína: <strong>{goals.protein}</strong> g</li>
            <li>Carbohidratos: <strong>{goals.carbs}</strong> g</li>
            <li>Grasas: <strong>{goals.fat}</strong> g</li>
            </ul>
        ) : (
            <div className="text-sm text-gray-500">Sin metas</div>
        )}
        <div className="mt-3">
            <Button onClick={onChangeObjective} className="w-full">Cambiar objetivo</Button>
        </div>
    </div>

    <div>
        <div className="mb-2 text-base font-semibold text-gray-900">Peso</div>
        <WeightChart logs={logs} />
        <div className="mt-3 flex items-center gap-2">
            <Input
                type="number"
                step={0.1}
                min={20}
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Peso de hoy (kg)"
                className="w-40"
            />
            <Button onClick={onAddWeight} disabled={addingWeight || !newWeight}>
                {addingWeight ? "Añadiendo..." : "Añadir peso"}
            </Button>
        </div>
    </div>
</div>

  {/* Bloque inferior: Estadísticas y foto */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
    {/* Estadísticas del usuario */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 text-base font-semibold text-gray-900">Estadísticas del usuario</div>
            <ul className="text-sm text-gray-800 space-y-2">
                <li><strong>Objetivo:</strong>{formGoal === "cut" ? " Definición" : formGoal === "bulk" ? " Volumen" : " Mantenimiento"}</li>
                <li><strong>Peso actual:</strong>{" "}{logs.length > 0 ? logs[logs.length - 1].weightKg + " kg" : props.weightKg !== "" ? props.weightKg + " kg" : "-"}</li>
                <li><strong>Altura:</strong>{" "}{props.heightCm !== "" ? props.heightCm + " cm" : "-"}</li>
                <li><strong>Edad:</strong>{" "}{props.age !== "" ? props.age : "-"}</li>
                <li><strong>% Grasa:</strong>{" "}{props.bodyFat !== "" ? props.bodyFat + " %" : "-"}</li>
                <li><strong>Actividad:</strong>{" "}
                    {props.activity === "sedentary" ? "Sedentario"
                    : props.activity === "light" ? "Ligero (1-3 d/sem)"
                        : props.activity === "moderate" ? "Moderado (3-5 d/sem)"
                        : props.activity === "active" ? "Activo (6-7 d/sem)"
                            : "Muy activo (2 sesiones/día)"}
                </li>
            </ul>
        </div>

        {/* Imagen */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col items-center justify-center">
            {userImage ? (
            <>
                <img src={userImage} alt="Usuario" className="w-40 h-40 object-cover rounded-md mb-3" />
                <Button onClick={uploadNewImage}>Subir nueva imagen</Button>
            </>
            ) : (
            <>
                <div className="w-40 h-40 flex items-center justify-center bg-gray-100 rounded-md mb-3 text-gray-500">
                No hay imagen
                </div>
                <Button onClick={uploadNewImage}>Subir imagen</Button>
            </>
            )}
        </div>
    </div>
</>
);
}