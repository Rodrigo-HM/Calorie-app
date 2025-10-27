# 🍽️ Calorie App (Arquitectura Hexagonal)

Aplicación fullstack para gestionar calorías y hábitos alimenticios, organizada como monorepo. El backend está migrado a Arquitectura Hexagonal (puertos y adaptadores), con test unitarios, de integración y E2E. El frontend (React + Vite) convive en el mismo repo.

Principales módulos backend:

* Auth, Foods, Entries, Goals, Profile, WeightLogs

* Capa application con casos de uso/servicios

* Repositorios (puertos) e implementaciones LowDB (adaptadores)

* Controllers HTTP (Express) delgados, con validación via Zod

* DI (container) para cablear repos/servicios/controllers

## 📂 Estructura del monorepo

calorie-app/

* apps/

  * api/ → Backend (Node/Express + Arquitectura Hexagonal)

  * web/ → Frontend (React + Vite + Tailwind)

* package.json (workspaces)

* README.md

apps/api/src (backend)

* module/

  * shared/ (db, config, http AppBuilder, di, token, error middleware)

  * auth/ (services, repository, http)

  * foods/ (aplication/ports, infrastructure/http)

  * entries/ (aplication: casos de uso; infra: repos y http)

  * goals/ (aplication: GoalsService; infra: repo y http)

  * profile/ (domain: GoalsCalculator; infra: repo y http)

  * weightLogs/ (aplication/ports; infra: repo y http)

* tests

  * test/unit/ (application, controller, infrastructure)

  * test/integration/ (supertest contra AppBuilder con mocks de lowdb)

  * test/e2e/ (servidor real con lowdb/bcrypt/JWT reales y DB temporal)

## 🚀 Tecnologías

* Backend: Node.js, Express, Zod, Arquitectura Hexagonal (Puertos/Adaptadores)

* Persistencia: LowDB (fácil de sustituir por SQL)

* DI: container propio por módulo

* JWT/Bcrypt: autenticación real en integración/E2E

* Testing (apps/api):

  * Unit + Integration + E2E con Jest + Supertest

  * Mocks por test type (lowdb/uuid en integración; reales en E2E)

* Frontend (apps/web): React + Vite + Tailwind (opcional en esta guía)

## ⚙️ Requisitos y variables de entorno (backend)

* Node 18+

* Variables (apps/api):

  * JWT_SECRET (obligatorio en prod; en test/dev se setea en config o setup)

  * JWT_EXPIRES_IN (ej. 1h)

  * DB_PATH (ruta al JSON de LowDB; en integración/E2E se crea temporalmente)

## 🛠️ Instalación

Desde la raíz del monorepo:

git clone <https://github.com/TU-USUARIO/calorie-app.git> cd calorie-app npm install

## ▶️ Desarrollo

* Levantar frontend + backend (si tienes scripts de orquestación en la raíz): npm run dev

* Solo backend: cd apps/api npm run dev (si tienes script) o node/tsx tu entry (según tu setup)

* Solo frontend: cd apps/web npm run dev

## 🧪 Testing (apps/api)

Estructura de la pirámide:

* Unit: prueba lógica de application/domain/controllers con fakes (sin infra real)

* Integración: Express + rutas reales con supertest y mocks de lowdb/uuid

* E2E: servidor real con lowdb/bcrypt/JWT reales y DB temporal

Desde apps/api:

* Todos (unit + integration): npx jest

* Solo unit: npx jest test/unit

* Solo integración: npx jest test/integration

* E2E (servidor real en puerto efímero, lowdb real): npx jest -c jest.e2e.config.js

Scripts recomendados en apps/api/package.json: { "scripts": { "test": "jest", "test:unit": "jest test/unit", "test:int": "jest test/integration", "test:e2e": "jest -c jest.e2e.config.js", "test:watch": "jest --watch" } }

Notas:

* Integración usa mocks de lowdb/uuid definidos en test/mocks para evitar ESM y controlar datos seed (foods).

* E2E usa lowdb y steno reales (ESM). Se requiere babel-jest y ts-jest ESM (ya configurado). El setup E2E crea DB_PATH temporal por suite, setea JWT_SECRET y arranca el app.listen(0).

## 🔩 Arquitectura (resumen)

* Controller (HTTP): valida con Zod, orquesta casos de uso/servicios, mapea errores a HTTP. No contiene lógica de negocio ni acceso a DB.

* Application (casos de uso/servicios): contiene reglas de negocio puras (p. ej., Entries list con totales; GoalsService normaliza calories→kcal; validaciones de rango en WeightLogs).

* Ports (interfaces): contratos de acceso a datos (ej. EntriesRepository, FoodsReadRepository, GoalsRepository, WeightLogsRepository).

* Adapters/Infra: implementaciones concretas (LowDB) que satisfacen los puertos.

* DI/Container: crea repos + servicios + controllers por módulo (punto único de cableado).

* Shared: AppBuilder (Express + middlewares + rutas), errorMiddleware (Zod/AppError), token service, config/env.

Módulos destacados:

* Auth: AuthService (register/login) con PasswordHasher y TokenService; UserRepository LowDB.

* Entries: casos de uso UpdateEntryGrams, RemoveEntry, ListEntriesByDay (calcula totales).

* Goals: GoalsService (set/get) con normalización; controller añade alias calories.

* Profile: ProfileController persiste perfil y usa calculateGoals de dominio para recalcular metas y guardarlas.

* WeightLogs: Controller valida y persiste; repo filtra por rango inclusivo (YYYY-MM-DD→T00/T23:59:59.999Z).

* Foods: Controller filtra por query search; repositorio solo-lectura.

## ✅ Cobertura de tests (apps/api)

* Unit

  * AuthService (register/login, EMAIL_TAKEN, INVALID_CREDENTIALS)

  * Entries (update/remove/list-with-totals)

  * GoalsService (set/get, normalización)

  * ProfileController (update calcula metas y persiste goals)

  * WeightLogsController (validaciones, fecha actual)

  * calculateGoals (dominio)

  * Repos WeightLogs (infra): rangos inclusivos

* Integración

  * Auth (register/login)

  * Foods (list, getById 404)

  * Entries (crear + listar con totales)

  * Goals (set/get con alias calories)

* E2E

  * Flujo principal: register → login → update profile (calcula goals) → create entry → list entries con totales → create weight-log → list por rango

## 📌 Próximos pasos

* Crear caso de uso CreateEntry (application) y añadir tests unit (happy + FOOD_NOT_FOUND).

* Tests de errorMiddleware (ZodError → 400; códigos a status).

* Migrar LowDB a Postgres (cambiando solo adaptadores y container).

* Despliegue:

  * Frontend: Vercel

  * Backend: Render / Railway (setear JWT_SECRET, DB_PATH persistente)

## ✍️ Autor

Rodrigo Hernández Martín\
Proyecto en desarrollo continuo 🚀
