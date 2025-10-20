import { defineConfig } from "vitest/config";
export default defineConfig({
test: {
environment: "node", //sin navegador
globals: true, //para no tener que importar describe, it, expect...
include: ["tests/**/*.{test,spec}.ts"], //dónde están los tests
setupFiles: ["./tests/setup.ts"], //lo que se ejecuta antes de cada test
},
});