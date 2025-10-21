import type { Toast } from "../../hooks/useToast";
export function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: string) => void }) {
return (
<div className="fixed right-4 top-4 z-50 grid gap-2">
{toasts.map((t) => (
<div
key={t.id}
onClick={() => remove(t.id)}
className={[
"cursor-pointer rounded-lg border px-3 py-2 text-sm shadow-sm",
t.type === "success"
? "border-emerald-200 bg-emerald-50 text-emerald-800"
: t.type === "error"
? "border-rose-200 bg-rose-50 text-rose-800"
: "border-indigo-200 bg-indigo-50 text-indigo-800",
].join(" ")}
>
{t.message}
</div>
))}
</div>
);
}