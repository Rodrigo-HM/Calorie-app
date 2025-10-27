module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  // Usa testMatch o testRegex (elige uno)
  testMatch: ["**/test/e2e/**/*.e2e.ts"],
  // testRegex: "test[\\/]+e2e[\\/]+.*\\.e2e\\.ts$",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      { useESM: true, tsconfig: "tsconfig.e2e.json" }
    ],
    "^.+\\.[cm]?js$": "babel-jest"
  },
  // Permitir transformar ESM en node_modules para lowdb y steno
  transformIgnorePatterns: [
    "node_modules/(?!(lowdb|steno)/)"
  ],
  moduleNameMapper: {
    "^([\\.]{1,2}/.*)\\.js$": "$1",
    "^src/(.*)$": "<rootDir>/src/$1"
  },
  clearMocks: true,
  setupFilesAfterEnv: ["<rootDir>/test/e2e/setup.ts"]
};
