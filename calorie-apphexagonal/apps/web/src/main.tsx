import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css"; // si quieres estilos globales mínimos, puedes vaciarlo o poner reset propio.

ReactDOM.createRoot(document.getElementById("root")!).render(
<BrowserRouter>
<App />
</BrowserRouter>
);