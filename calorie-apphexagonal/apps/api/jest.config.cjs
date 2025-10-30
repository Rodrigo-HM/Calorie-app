/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/test/**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"], // crea este archivo si no existe
  clearMocks: true,
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
    "^test/(.*)$": "<rootDir>/test/$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
    "^.+\\.m?js$": "babel-jest", // transforma ESM en node_modules
  },
  transformIgnorePatterns: [
    // Importante: permitir transformar lowdb y steno (ambos ESM)
    "/node_modules/(?!(lowdb|steno)/)",
  ],
};