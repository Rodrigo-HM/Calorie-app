import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
//import '@testing-library/jest-dom';


export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: './tests/setupTests.ts',
  }
});
