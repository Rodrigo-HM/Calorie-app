import { useState } from "react";
export type Toast = { id: string; message: string; type?: "success" | "error" | "info" };
export function useToasts() {
const [toasts, setToasts] = useState<Toast[]>([]); //lista de toasts, empezando vacía
const genId = () =>
typeof crypto !== "undefined" && "randomUUID" in crypto //genera un id único, usando crypto si está disponible, si no un string aleatorio
? crypto.randomUUID()
: Math.random().toString(36).slice(2);
function push(message: string, type: Toast["type"] = "info") { //añade un toast y lo elimina tras 2.5s
const id = genId();
setToasts((t) => [...t, { id, message, type }]);
setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
}
function remove(id: string) {
setToasts((t) => t.filter((x) => x.id !== id));
}
return { toasts, push, remove };
}