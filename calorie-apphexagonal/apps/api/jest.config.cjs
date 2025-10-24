// jest.config.js
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/test/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  clearMocks: true,
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
    "^uuid$": "<rootDir>/test/mocks/uuid.ts",
    "^lowdb$": "<rootDir>/test/mocks/lowdb.ts",         // <- ruta correcta con /
    "^lowdb/node$": "<rootDir>/test/mocks/lowdb_node.ts"
  }
};
