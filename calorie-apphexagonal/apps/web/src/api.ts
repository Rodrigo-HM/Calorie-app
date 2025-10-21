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
export async function getEntries(date?: string) {
  const qs = date ? `?date=${encodeURIComponent(date)}` : "";
  return http<EntriesResponse>(`${API}/api/entries${qs}`, {
    headers: authHeaders(),
  });
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
export async function getProfile() {
  return http<Profile | null>(`${API}/api/users/me/profile`, {
    headers: authHeaders(),
  });
}

export async function setProfile(body: Profile) {
  return http<{ profile: Profile; goals: Goals }>(`${API}/api/users/me/profile`, {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify(body),
  });
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
