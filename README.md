# 🍽️ Calorie App API (TypeScript + Express) — Arquitectura Hexagonal

API para gestionar calorías, alimentos, metas, perfil y registros de peso. Basada en Arquitectura Hexagonal, validación con Zod y pruebas por capas.

## 🧭️ Resumen técnico

* 🧩 **Arquitectura:** Hexagonal (domain / application / infra) con puertos y adaptadores.
* 🌐 **HTTP:** Express + controllers delgados y presenters (compatibilidad de shape).
* ✅ **Validación:** Zod en el borde (acepta formatos *legacy* donde aplica).
* 🚡️ **Errores:** middleware global + patrones `parse/assert`.
* 💮 **Persistencia:** LowDB (dev/test), ficheros de datos separados por entorno.
* 🥪 **Testing:** Unit, Integración Infra, Integración HTTP, E2E (mínimos).

---

## 🔧 Requisitos

* Node 18+ (ideal 20+)
* npm 8+

---

## 🚀 Ejecución

Monorepo:

* Dev (API + Web):

  ```bash
  npm run dev
  ```
* Solo API (desde raíz):

  ```bash
  npm -w apps/api run dev
  ```
* Solo Web:

  ```bash
  npm -w apps/web run dev
  ```

**Puertos:**

* 🔌 API: por defecto `3000` (usa `PORT` para cambiar).
* ⚡ Web: Vite en `5173+`.

---

## 🌱 Entorno y datos

Variables (apps/api):

* `NODE_ENV`: `development` | `test` | `production` (default: `development`)
* `DB_PATH`: ruta absoluta opcional al JSON (si no, usa rutas por entorno)
* `JWT_SECRET`: obligatorio en prod (en dev hay uno por defecto)
* `JWT_EXPIRES_IN`: default `2h`

Rutas de datos por defecto:

* 🧑‍💻 **Desarrollo:** `apps/api/data/dev/.db.dev.json`
* 🧫 **Test:** `apps/api/data/test/.db.test.json`

**Override puntual (Windows CMD):**

```cmd
set DB_PATH=D:\...\mi-db.json && npm -w apps/api run dev
```

---

## 🗂️ Estructura (API)

```
apps/api/
  entry_point/
    server.ts
  src/module/
    shared/
      infrastructure/
        config/config.ts
        db/database.ts
        http/express/
          appBuilder.ts
          middlewares/...
    auth/
      aplication/            # puertos + AuthService
      infrastructure/        # BcryptHasher, JwtTokenService, UsersRepoLowdb, controller
    foods/
    entries/
    goals/
    profile/
    weightLogs/
      domain/                # VOs/entidades si aplica
      aplication/            # casos de uso + puertos
      infrastructure/        # repos LowDB, controllers, presenters
test/
  unit/
  integration/
    infra/                   # repos LowDB con DB temporal (withTempDb)
    http/                    # rutas con supertest, sin auth real
  e2e/
  helpers/withTempDb.ts
  setup.ts
```

---

## Convenciones

* 👷️ **application** depende de **puertos (interfaces)**, no de infraestructura.
* 🔌 **infrastructure** implementa los puertos (LowDB / HTTP).
* 🧼 **Controllers:** validan con Zod, llaman casos de uso y usan presenters (alias date, calories, etc.).
* 🧯 **Errores:** `AppError` + middleware; controllers usan `parse(schema)` + `next(err)`.
* 🔁 **Migraciones (legacy)** — se ejecutan al arrancar (dev/test):

  * `migrateEntriesDateToDateISO()` — copia `date` → `dateISO` si falta.
  * `migrateWeightLogsDateToDateISO()` — copia `date` → `dateISO` si falta.
  * `migrateWeightLogsUserToSingleUser()` — si hay 1 usuario, reasigna weightLogs legacy (userId vacío/u1) a ese usuario.
  * ℹ️ Migraciones “puntuales por email” → como scripts de mantenimiento, **no** en el arranque.

---

## 🥪 Testing

Ejecutar toda la suite:

```bash
npx jest --runInBand
```

**Tipos de tests:**

* 🔹 **Unit:** casos de uso con fakes de puertos (rápidos, abundantes).
* 🔸 **Integración Infra:** adaptadores LowDB usando `withTempDb` (JSON temporal por prueba).
* 🔶 **Integración HTTP:** `supertest` + `buildApp`, sin auth real (fallback `userId`), DB temporal.
* 🭫 **E2E:** 1–2 flujos completos con auth real (máximo).

**Aislamiento DB en tests:**

* `NODE_ENV=test` → `apps/api/data/test/.db.test.json` por defecto.
* `withTempDb` → fichero temporal por test y se elimina al terminar.

---

## 🧰 Recetas frecuentes

**“No se ven datos antiguos (peso/entries) en la web”**

* 🧭️ **Causas:** `userId` distinto (otro usuario) o datos legacy (`date` sin `dateISO`).
* 🛠️ **Soluciones:**

  * `migrate*DateToDateISO()` (legacy).
  * `migrateWeightLogsUserToSingleUser()` si hay 1 usuario.
  * Presenters → exponen `date` además de `dateISO`.
  * Tests de integración: sin auth real (fallback `userId`).
  * Cambiar ruta de datos: usar `DB_PATH` para forzar un fichero concreto.
  * En dev/test, usar las rutas por defecto (`apps/api/data/...`).

---

## 🧩 Añadir un módulo nuevo (6 pasos)

1. **Dominio:** VOs / entidades y lógica pura (si aplica).
2. **Application:** casos de uso y puertos (interfaces).
3. **Infra:** repositorio LowDB que implemente el puerto.
4. **Controller HTTP:** valida con Zod, llama caso de uso, usa presenters si hace falta.
5. **Composición:** `buildXxxService` inyecta repositorios concretos en casos de uso.
6. **Tests:**

   * Unit: casos de uso con fakes.
   * Integración Infra: repos LowDB + withTempDb.
   * Integración HTTP: rutas con supertest (sin auth real), withTempDb.

---

## ✅ Calidad y mejoras recomendadas

* 🧹 ESLint + Prettier + lint-staged (Husky)
* 📜 Logger estructurado: pino + `requestId`
* 📄 OpenAPI: `zod-to-openapi` o spec manual en `/docs` (dev)
* 🔐 Seguridad: CORS explícito, rate limit en auth, política de contraseñas
* 🗄️ Persistencia real: Postgres/Prisma o Drizzle, migraciones versionadas
* 📈 Métricas: contadores por ruta/estado, latencias p95

---

## 🛠️ Comandos útiles

* **API en puerto alternativo:**

  ```cmd
  set PORT=3001 && npm -w apps/api run dev
  ```
* **Mover DB antigua a la nueva ubicación (ejemplo Windows CMD):**

  ```cmd
  move /Y apps\api\apps\api\db.json apps\api\data\dev\.db.dev.json
  ```

---

## 📜 Licencia

Uso educativo y de aprendizaje. Ajusta según tus necesidades.
