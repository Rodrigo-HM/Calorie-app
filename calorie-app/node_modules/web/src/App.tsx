import { Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Diary from "./pages/Diary";
import Foods from "./pages/Foods";
import Profile from "./pages/Profile";
import type { JSX } from "react";

function isAuthed() {  // Aquí simplemente verificamos si hay un token en el almacenamiento local
return !!localStorage.getItem("token");
}

function Private({ children }: { children: JSX.Element }) {  // Comprobarr si el usuario está autenticado, si no autorizado redirige a la página de inicio
return isAuthed() ? children : <Navigate to="/" replace />;
}

function Nav() {
const authed = isAuthed(); 
const navigate = useNavigate();
const logout = () => {
localStorage.removeItem("token");
navigate("/", { replace: true });
};

//Estilos reutilizables para los enlaces de navegación
const base = "text-sm transition-colors";
const inactive = "text-gray-200 hover:text-white";
const active = "text-white font-semibold";

return (
<header className="border-b border-gray-800 bg-gray-900">
<nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3"> {/* Contenedor centrado */}
<div className="flex gap-4">
<NavLink to="/" end className={({ isActive }) => [base, isActive ? active : inactive].join(" ")}> {/* El atributo 'end' asegura que este enlace solo esté activo en la ruta raíz */}
Inicio
</NavLink>
<NavLink to="/diary" className={({ isActive }) => [base, isActive ? active : inactive].join(" ")}> {/* Con el ternario, elegimos si resaltar o no, segun si estamos estemos. Lo meetemos con el join */}
Diario
</NavLink>
<NavLink to="/foods" className={({ isActive }) => [base, isActive ? active : inactive].join(" ")}>
Alimentos
</NavLink>
<NavLink to="/profile" className={({ isActive }) => [base, isActive ? active : inactive].join(" ")}>
Perfil
</NavLink>
</div>
    {/* Mostrar botón de cerrar sesión solo si está autenticado */}
    {authed && ( 
      <button
        onClick={logout}
        className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20"
      >
        Salir
      </button>
    )}
  </nav>
</header>
);
}

export default function App() {
return (
<div className="min-h-screen bg-gray-50">
<Nav /> {/* Barra de navegación se muestra siempre(LLama a la función Nav()*/}
<main className="mx-auto max-w-5xl px-4 py-8">
<Routes>
<Route path="/" element={<Auth />} /> {/* Página de autenticación siempre accesible */}
<Route
path="/diary"
element={
<Private>
<Diary />
</Private>
}
/>
<Route
path="/foods"
element={
<Private>
<Foods />
</Private>
}
/>
<Route
path="/profile"
element={
<Private>
<Profile />
</Private>
}
/>
<Route path="*" element={<Navigate to="/" replace />} /> {/* Redirige cualquier ruta desconocida a la página de inicio */}
</Routes>
</main>
</div>
);
}