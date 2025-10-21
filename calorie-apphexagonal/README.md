para iniciar api---> npm run dev:api
para iniciar web---> npm run -w apps/web dev
para iniciar los dos---> npm run dev

TEST

TEST BACK DESDE RAIZ

- npm run test --workspace apps/api →para test de api (todos)
- npx vitest run tests/integration/profile.controller.test.ts →para test concretos api


TEST FRONT DESDE RAIZ


- npm run web:test:unit → levanta frontend y ejecuta tests unitarios.

- npm run web:test:e2e → levanta frontend y ejecuta tests E2E.

- npm run web:cypress:open →E2E con cypress visual
