# 🍽️ Calorie App

Aplicación **fullstack** para gestionar calorías, comidas y usuarios.  
El proyecto está organizado como **monorepo** e incluye tanto el **frontend (React + Vite)** como el **backend (Node/Express)**.  

✔️ La app permite:  
- Registro y autenticación de usuarios.  
- Gestión de comidas y calorías.  
- Interfaz web responsiva con **React + TailwindCSS**.  
- **Tests unitarios** (Vitest + React Testing Library).  
- **Tests end-to-end** (Cypress).  

---

## 📂 Estructura del proyecto
```
calorie-app/
│── apps/
│ ├── api/ # Backend (Node/Express + DB en JSON/SQL)
│ └── web/ # Frontend (React + Vite + Tailwind)
│
│── package.json # Configuración del monorepo con workspaces
│── README.md
```

---

## 🚀 Tecnologías usadas

- **Frontend**: React 19, Vite, React Router DOM, TailwindCSS  
- **Backend**: Node.js, Express, Base de datos en JSON (fácil de migrar a SQL)  
- **Testing**:  
  - Unitarios → Vitest + React Testing Library  
  - E2E → Cypress  
- **Herramientas extra**:  
  - Monorepo con **npm workspaces**  
  - `start-server-and-test` → automatización de tests  
  - `concurrently` → levantar frontend y backend en paralelo  

---

## 🛠️ Instalación

Clona el repositorio y entra al proyecto:

```bash
git clone https://github.com/TU-USUARIO/calorie-app.git
cd calorie-app
npm install
```

---

## 📦 Scripts principales

Ejecutables desde la raíz del proyecto:

▶️ Desarrollo
npm run dev       # Levanta frontend + backend en paralelo

🖥️ Frontend
npm run web:dev      # Levanta solo el frontend
npm run web:build    # Build del frontend

🧪 Testing
npm run test --workspace apps/api # Tests Api (Todos)
npm run web:test                  # Tests unitarios (Vitest)
npm run web:test:unit             # Test unitarios
npm run web:test:watch            # Tests unitarios en modo watch
npm run web:test:e2e              # Tests end-to-end (Cypress) con servidor levantado automáticamente

---

## ✅ Tests automáticos

Tests unitarios → validan lógica de componentes y hooks.

Tests E2E → simulan el flujo real del usuario (registro, login, errores, etc.).

Ejemplo de test E2E (Cypress):

```Typescript
it("muestra error si las contraseñas no coinciden en registro", () => {
  cy.contains("Registro").click();
  cy.get('input[type="email"]').type("nuevo@example.com");
  cy.get('input[type="password"]').eq(0).type("password123");
  cy.get('input[type="password"]').eq(1).type("password321");
  cy.get('button[type="submit"]').click();
  cy.contains("Las contraseñas no coinciden").should("be.visible");
});
```
## 📌 Próximos pasos

Migrar la base de datos de JSON a un sistema más robusto (ej: PostgreSQL).

Implementar versión móvil con React Native o Expo.

Desplegar gratuitamente:

Frontend → Vercel

Backend → Render / Railway

✍️ Autor: Rodrigo Hernández Martín

📅 Proyecto en desarrollo continuo 🚀
