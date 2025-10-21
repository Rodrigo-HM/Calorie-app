import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    specPattern: "tests/e2e/**/*.cy.{js,jsx,ts,tsx}", // 👈 specs en tests/e2e
    baseUrl: "http://localhost:5173", // ajusta al puerto donde levantas tu frontend
    supportFile: false,
  },
});
