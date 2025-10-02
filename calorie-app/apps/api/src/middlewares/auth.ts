import jwt from "jsonwebtoken"; //libreria fimrar y verificar tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me"; //clave secreta para firmar y verificar tokens, en produccion debe ser larga y segura

export function auth(req: any, res: any, next: any) {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null; //extrae el token del header Authorization (si el header empieza por Bearer )
    //con este ternario quita Bearer y el espacio, dejando solo el token

        // BYPASS para tests
    if (process.env.NODE_ENV === "test") {
        if (!token) {
            req.user = { sub: "test-user" };
            return next();
        }
        if (token === "test") { //si el token es "test", simula un usuario autenticado con id "test-user"
            req.user = { sub: "test-user" };
            return next();
        }
        // Si envías un token real en tests, también lo puedes verificar:
        try {
            req.user = jwt.verify(token, JWT_SECRET);
            return next();
        } catch {
        // Incluso en test, si token viene mal, considera permitir pasar o responder 401
        return res.status(401).json({ error: "Token inválido" });
        }
    }

    if (!token) return res.status(401).json({ error: "No token" });//si no hay token, responde 401
    try {
    (req as any).user = jwt.verify(token, JWT_SECRET);//verifica el token (si no es valido, lanza error)
    next();
    } catch {
    return res.status(401).json({ error: "Token inválido" });
    }
}

//Este middleware se utiliza para asegurar que solo usuarios autenticados puedan acceder a ciertas rutas de la API.