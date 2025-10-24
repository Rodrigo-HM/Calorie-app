import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api";
import Card, { CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
// Opcional: toasts (si los usas)
import { ToastContainer } from "../components/ui/Toast";
import { useToasts } from "../hooks/useToast";

export default function Auth() {
const [mode, setMode] = useState<"login" | "register">("login");
const [email, setEmail] = useState("test@example.com");
const [password, setPassword] = useState("secret123");
const [confirm, setConfirm] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const navigate = useNavigate(); //sirve para redirigir 

// Toaster para mostrar mensajes (si los usas)
const { toasts, push, remove } = useToasts();

// Redirige si ya hay sesión (solo al montar)
useEffect(() => {
if (localStorage.getItem("token")) {
navigate("/diary", { replace: true });
}
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

async function onSubmit(e: React.FormEvent) {
e.preventDefault(); //evita que se recargue la página, ya que por defecto el formulario HTML lo hace
setError(""); 
setLoading(true);
try {
if (mode === "register") {
if (!email || !password) throw new Error("Email y contraseña requeridos");
if (password !== confirm) throw new Error("Las contraseñas no coinciden");
await register(email, password); //llamamos a la API de register
setMode("login");
setError("Registro correcto. Inicia sesión.");
push?.("Registro correcto. Inicia sesión.", "success"); //Toast de registro correcto
} else {
const res = await login(email, password); //llamamos a la API de login
localStorage.setItem("token", res.token); //guardamos el token en el almacenamiento local
push?.("Bienvenido", "success"); //Toast de bienvenida
navigate("/diary", { replace: true }); //redireccionamos al diario y evitamos que el usuario pueda volver a la página de login con el botón de atrás
}
} catch (e) {
const msg = (e as Error).message || "Error";
setError(msg);
push?.(msg, "error");
} finally {
setLoading(false);
}
}

const disabled = //condición para deshabilitar el botón de envío
mode === "login"
? !email || !password
: !email || !password || password !== confirm;

return (
<div className="grid min-h-[70vh] place-items-center">
{/* Toasts*/}
<ToastContainer toasts={toasts} remove={remove} />

  <div className="w-full max-w-sm">
    <Card>
      <CardHeader>
        <CardTitle>Bienvenido</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="mb-4 text-sm text-gray-600">
          Accede a tu cuenta o crea una nueva
        </p>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <Button
            type="button"
            onClick={() => setMode("login")}
            className={
              mode === "login"
                ? ""
                : "bg-gray-100 text-gray-700 hover:bg-gray-700 border border-gray-200"
            }
          >
            Login
          </Button>
          <Button
            type="button"
            onClick={() => setMode("register")}
            className={
              mode === "register"
                ? ""
                : "bg-gray-100 text-gray-700 hover:bg-gray-700 border border-gray-200"
            }
          >
            Registro
          </Button>
        </div>

        <form onSubmit={onSubmit} className="grid gap-3">
          <label className="text-sm text-gray-700">
            Email
            <Input
              className="mt-1"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          <label className="text-sm text-gray-700">
            Contraseña
            <Input
              className="mt-1"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>

          {mode === "register" && (
            <label className="text-sm text-gray-700">
              Confirmar contraseña
              <Input
                className="mt-1"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </label>
          )}

          <Button type="submit" disabled={disabled || loading} className="mt-2 w-full">
            {loading ? "Enviando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
          </Button>

          {error && (
            <div
              className={`text-sm ${
                error.startsWith("Registro correcto") ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              {error}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  </div>
</div>
);
}