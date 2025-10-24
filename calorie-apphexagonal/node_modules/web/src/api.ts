//Este archivo centraliza toda la lógica de API

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

type HttpOptions = RequestInit; //alias para claridad y tipar (method, headers, body, etc.)

async function http<T>(url: string, options?: HttpOptions): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    // Manejo centralizado de 401: limpiar sesión y redirigir
    if (res.status === 401) {
      try {
        localStorage.removeItem("token");
      } catch { /* empty */ }
      // redirige a la landing (Auth)
      window.location.href = "/";
    }
    const txt = await res.text().catch(() => "");
    const err = new Error(txt || `HTTP ${res.status}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}

function authHeaders(withJson = false): Headers { //devuelve headers con Authorization
  const h = new Headers();
  if (withJson) h.set("Content-Type", "application/json");
  const t = localStorage.getItem("token");
  if (t) h.set("Authorization", `Bearer ${t}`);
  return h;
}




// Tipos
type EntriesApi = Entry[] | { items: Entry[]; totals?: { kcal: number; protein: number; carbs: number; fat: number } };

export type Food = { id: string; name: string; kcal: number;
  protein: number; carbs: number; fat: number;
};

export type Entry = { id: string; userId: string; foodId: string; grams: number; date: string;}; // ISO

export type Totals = { kcal: number; protein: number; carbs: number; fat: number };

export type EntriesResponse = { items: Entry[]; totals: Totals };

export type Goals = { calories: number; protein?: number; carbs?: number; fat?: number };

export type Activity = "sedentary" | "light" | "moderate" | "active" | "veryActive";

export type GoalKind = "cut" | "maintain" | "bulk";

export type Profile = {sex: "male" | "female"; age: number; heightCm: number; weightKg: number;
  bodyFat?: number; activity: Activity; goal: GoalKind;
};

export type WeightLog = { id: string; userId: string; date: string; weightKg: number; bodyFat?: number; createdAt: string };

const PROFILE_CACHE_KEY = "profileCache";

export function getProfileCache(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function setProfileCache(p: Profile | null): void {
  try {
    if (!p) {
      localStorage.removeItem(PROFILE_CACHE_KEY);
    } else {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(p));
    }
  } catch {
    // ignore
  }
}


// Auth
export async function login(email: string, password: string) {
  return http<{ token: string; user: { id: string; email: string } }>(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email: string, password: string) {
  return http<{ id: string; email: string }>(`${API}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

// Foods
export async function listFoods(search = "") {
  const url = `${API}/api/foods${search ? `?search=${encodeURIComponent(search)}` : ""}`;
  return http<Food[]>(url);
}

// Entries

function isEntriesArray(data: unknown): data is Entry[] {
  return Array.isArray(data);
}
function isEntriesObject(data: unknown): data is { items: Entry[] } {
  return !!data && typeof data === 'object' && 'items' in (data as Record<string, unknown>);
}
export async function getEntries(date?: string) {
  const qs = date ? `?date=${encodeURIComponent(date)}` : '';
  const data = await http<EntriesApi>(`${API}/api/entries${qs}`, {
    headers: authHeaders(),
  });

  if (isEntriesArray(data)) return data;
  if (isEntriesObject(data)) return data.items;

  return [];
}

export async function addEntry(body: { foodId: string; grams: number; date?: string }) {
  return http<Entry>(`${API}/api/entries`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(body),
  });
}

export async function deleteEntry(id: string) {
  return http<Entry>(`${API}/api/entries/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}
export async function updateEntry(id: string, grams: number) {
  return http<Entry>(`${API}/api/entries/${id}`, {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify({ grams }),
  });
}


// Goals (perfil)
export async function getGoals() {
  return http<Goals | null>(`${API}/api/users/me/goals`, {
    headers: authHeaders(),
  });
}

export async function setGoals(body: Goals) {
  return http<Goals>(`${API}/api/users/me/goals`, {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify(body),
  });
}

// Profile

export async function getProfile(): Promise<Profile | null> {
  const cached = getProfileCache();

  const p = await http<
    {
      userId: string;
      name?: string;
      age?: number;
      sex?: "M" | "F" | "O";
      heightCm?: number;
      weightKg?: number;
      bodyFat?: number;
      activity?: Activity;
      goal?: GoalKind;
    } | null
  >(`${API}/api/users/me/profile`, {
    headers: authHeaders(),
  });

  if (!p) return cached ?? null;

  const profile: Profile = {
    sex: mapSexFromApi(p.sex),
    age: p.age ?? cached?.age ?? 0,
    heightCm: p.heightCm ?? cached?.heightCm ?? 0,
    weightKg: p.weightKg ?? cached?.weightKg ?? 0,
    bodyFat: p.bodyFat ?? cached?.bodyFat,
    activity: p.activity ?? cached?.activity ?? "moderate",
    goal: p.goal ?? cached?.goal ?? "maintain",
  };

  // Actualiza cache con lo mejor que tenemos
  setProfileCache(profile);

  return profile;
}

export async function setProfile(
  body: Profile
): Promise<{ profile: Profile; goals: Goals }> {
  const payload = {
    sex: mapSexToApi(body.sex),
    age: body.age,
    heightCm: body.heightCm,
    weightKg: body.weightKg,
    bodyFat: body.bodyFat,
    activity: body.activity,
    goal: body.goal,
  };

  const saved = await http<{
    userId: string;
    name?: string;
    age?: number;
    sex?: "M" | "F" | "O";
    heightCm?: number;
    weightKg?: number;
    bodyFat?: number;
    activity?: Activity;
    goal?: GoalKind;
  }>(`${API}/api/users/me/profile`, {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  });

  // Merge: si el backend no llena algo, usamos lo que enviamos
  const merged: Profile = {
    sex: mapSexFromApi(saved.sex) ?? body.sex,
    age: saved.age ?? body.age,
    heightCm: saved.heightCm ?? body.heightCm,
    weightKg: saved.weightKg ?? body.weightKg,
    bodyFat: saved.bodyFat ?? body.bodyFat,
    activity: saved.activity ?? body.activity,
    goal: saved.goal ?? body.goal,
  };

  // Actualiza cache y devuelve goals para compatibilidad con el componente
  setProfileCache(merged);

  const goals = (await getGoals()) ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
  return { profile: merged, goals };
}


// Weight logs

export async function getWeightLogs(from?: string, to?: string) {
  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return http<WeightLog[]>(`${API}/api/users/me/weight-logs${suffix}`, {
    headers: authHeaders(),
  });
}

export async function addWeightLog(body: { date?: string; weightKg: number; bodyFat?: number }) {
  return http<WeightLog>(`${API}/api/users/me/weight-logs`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(body),
  });
}

// Helpers y tipos internos


function mapSexFromApi(sex?: 'M' | 'F' | 'O'): Profile['sex'] {
  if (sex === 'F') return 'female';
  // Si viene 'M' o 'O' (otros), mostramos 'male' para mantener compat
  return 'male';
}

function mapSexToApi(sex?: Profile['sex']): 'M' | 'F' | 'O' | undefined {
  if (sex === 'female') return 'F';
  if (sex === 'male') return 'M';
  return undefined; // si no viene, no lo enviamos
}