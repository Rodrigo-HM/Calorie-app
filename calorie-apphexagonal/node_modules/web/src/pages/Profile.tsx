import { useEffect, useRef, useState } from "react";
import {
  getProfile,
  setProfile,
  getGoals,
  getWeightLogs,
  addWeightLog,
  getProfileCache,
  setProfileCache,
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

type Sex = "male" | "female";
type Activity = "sedentary" | "light" | "moderate" | "active" | "veryActive";
type GoalKind = "cut" | "maintain" | "bulk";

type Form = {
  sex: Sex;
  age: number | "";
  heightCm: number | "";
  weightKg: number | "";
  bodyFat: number | "";
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

type ProfileSummaryProps = {
  goals: Goals | null;
  formGoal: GoalKind;
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
};

function ProfileSummary(props: ProfileSummaryProps) {
  const {
    goals,
    formGoal,
    logs,
    onChangeObjective,
    newWeight,
    setNewWeight,
    addingWeight,
    onAddWeight,
  } = props;

  const fase =
    formGoal === "cut" ? "Definición" : formGoal === "bulk" ? "Volumen" : "Mantenimiento";


  const uploadNewImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <>
      {/* Bloque objetivo y peso */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 text-base font-semibold text-gray-900">Objetivo actual</div>
          <div className="text-sm text-gray-700">
            Fase: <strong>{fase}</strong>
          </div>
          {goals ? (
            <ul className="mt-2 space-y-2 text-sm text-gray-800">
              <li>
                <strong>{goals.calories}</strong> kcal
              </li>
              <li>Proteína: <strong>{goals.protein}</strong> g</li>
              <li>Carbohidratos: <strong>{goals.carbs}</strong> g</li>
              <li>Grasas: <strong>{goals.fat}</strong> g</li>
            </ul>
          ) : (
            <div className="text-sm text-gray-500">Sin metas</div>
          )}
          <div className="mt-3">
            <Button onClick={onChangeObjective} className="w-full">
              Cambiar objetivo
            </Button>
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

      {/* Bloque estadísticas y foto */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 text-base font-semibold text-gray-900">Estadísticas del usuario</div>
          <ul className="space-y-2 text-sm text-gray-800">
            <li>
              <strong>Objetivo:</strong>
              {formGoal === "cut"
                ? " Definición"
                : formGoal === "bulk"
                ? " Volumen"
                : " Mantenimiento"}
            </li>
            <li>
              <strong>Peso actual:</strong>{" "}
              {logs.length > 0
                ? `${logs[logs.length - 1].weightKg} kg`
                : props.weightKg !== ""
                ? `${props.weightKg} kg`
                : "-"}
            </li>
            <li>
              <strong>Altura:</strong> {props.heightCm !== "" ? `${props.heightCm} cm` : "-"}
            </li>
            <li>
              <strong>Edad:</strong> {props.age !== "" ? props.age : "-"}
            </li>
            <li>
              <strong>% Grasa:</strong> {props.bodyFat !== "" ? `${props.bodyFat} %` : "-"}
            </li>
            <li>
              <strong>Actividad:</strong>{" "}
              {props.activity === "sedentary"
                ? "Sedentario"
                : props.activity === "light"
                ? "Ligero (1-3 d/sem)"
                : props.activity === "moderate"
                ? "Moderado (3-5 d/sem)"
                : props.activity === "active"
                ? "Activo (6-7 d/sem)"
                : "Muy activo (2 sesiones/día)"}
            </li>
          </ul>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex h-40 w-40 items-center justify-center rounded-md bg-gray-100 text-gray-500">
            No hay imagen
          </div>
          <Button onClick={uploadNewImage}>Subir imagen</Button>
        </div>
      </div>
    </>
  );
}

export default function Profile() {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Form>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [goals, setGoalsState] = useState<Goals | null>(null);
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [newWeight, setNewWeight] = useState<string>("");
  const [addingWeight, setAddingWeight] = useState(false);

  const { toasts, push, remove } = useToasts();
  const pushRef = useRef(push);
  useEffect(() => {
    pushRef.current = push;
  }, [push]);

  // Cache inmediato
  useEffect(() => {
    const cached = getProfileCache();
    if (cached) {
      setForm({
        sex: cached.sex as Sex,
        age: cached.age,
        heightCm: cached.heightCm,
        weightKg: cached.weightKg,
        bodyFat: cached.bodyFat ?? "",
        activity: cached.activity as Activity,
        goal: cached.goal as GoalKind,
      });
      setEditMode(false);
    }
  }, []);

  // Carga backend
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const p = await getProfile();
        if (!active) return;
        if (p) {
          setForm({
            sex: p.sex as Sex,
            age: p.age,
            heightCm: p.heightCm,
            weightKg: p.weightKg,
            bodyFat: p.bodyFat ?? "",
            activity: p.activity as Activity,
            goal: p.goal as GoalKind,
          });
          setEditMode(false);
          setProfileCache(p);
        } else {
          const hadCache = !!getProfileCache();
          setEditMode(!hadCache);
          if (!hadCache) setProfileCache(null);
        }
      } catch (e) {
        const msg = (e as Error).message || "Error al cargar perfil";
        setErr(msg);
        pushRef.current?.(msg, "error");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Carga metas y logs
  useEffect(() => {
    if (editMode) return;
    let active = true;
    (async () => {
      try {
        const [g, wl] = await Promise.all([getGoals(), getWeightLogs()]);
        if (!active) return;
        setGoalsState(g);
        setLogs(wl);
      } catch (e) {
        pushRef.current?.((e as Error).message || "Error cargando metas/peso", "error");
      }
    })();
    return () => {
      active = false;
    };
  }, [editMode]);

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

  async function refreshLogs() {
    try {
      const wl = await getWeightLogs();
      setLogs(wl);
    } catch (e) {
      pushRef.current?.((e as Error).message || "No se pudo refrescar el peso", "error");
    }
  }

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

      const prev = getProfileCache() ?? (await getProfile());
      const prevWeight = prev?.weightKg;

      const { profile: savedProfile, goals: savedGoals } = await setProfile(body);

      setEditMode(false);

      setForm({
        sex: savedProfile.sex as Sex,
        age: savedProfile.age,
        heightCm: savedProfile.heightCm,
        weightKg: savedProfile.weightKg,
        bodyFat: savedProfile.bodyFat ?? "",
        activity: savedProfile.activity as Activity,
        goal: savedProfile.goal as GoalKind,
      });
      setGoalsState(savedGoals);
      setProfileCache(savedProfile);

      if (prevWeight == null || prevWeight !== body.weightKg) {
        await addWeightLog({ weightKg: body.weightKg });
        await refreshLogs();
      }

      pushRef.current?.("Perfil y metas actualizados", "success");
    } catch (e) {
      const msg = (e as Error).message || "No se pudieron guardar";
      setErr(msg);
      pushRef.current?.(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  async function addWeightAndUpdateProfile(n: number) {
    await addWeightLog({ weightKg: n });
    const body: ApiProfile = {
      sex: form.sex,
      age: form.age as number,
      heightCm: form.heightCm as number,
      weightKg: n,
      bodyFat: form.bodyFat === "" ? undefined : (form.bodyFat as number),
      activity: form.activity,
      goal: form.goal,
    };
    const { profile: savedProfile, goals: savedGoals } = await setProfile(body);
    setForm((f) => ({ ...f, weightKg: savedProfile.weightKg }));
    setProfileCache(savedProfile);
    await refreshLogs();
    setGoalsState(savedGoals);
  }

  return (
    <div className="grid gap-4">
      <ToastContainer toasts={toasts} remove={remove} />
      <h1 className="m-0 text-xl font-semibold text-gray-900">Perfil</h1>

      <Card>
        <CardHeader>
          <CardTitle>{editMode ? "Completa tu perfil" : "Resumen de perfil"}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-gray-500">Cargando...</div>
          ) : !editMode ? (
            <ProfileSummary
              goals={goals}
              formGoal={form.goal}
              logs={logs}
              onChangeObjective={() => setEditMode(true)}
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
                  pushRef.current?.(
                    (e as Error).message || "No se pudo añadir el peso",
                    "error"
                  );
                } finally {
                  setAddingWeight(false);
                }
              }}
            />
          ) : (
            <form onSubmit={onSave} className="grid max-w-lg gap-3">
              {/* Sexo + Edad */}
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

              {/* Altura, peso, grasa */}
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

              {/* Actividad + objetivo */}
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

              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="mt-2">
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  className="mt-2"
                  onClick={() => setEditMode(false)}
                >
                  Cancelar
                </Button>
              </div>

              {err && <div className="text-sm text-rose-600">{err}</div>}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
