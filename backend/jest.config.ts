import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { isolatedModules: true }],
  },
  collectCoverageFrom: [
    '**/*.ts',
    '!main.ts',
    '!**/*.module.ts',
    '!**/*.dto.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@app/shared$': '<rootDir>/../../shared/src/index.ts',
  },
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      // Branches set to 75% — TypeScript emitDecoratorMetadata generates
      // `typeof Reflect === "object"` conditionals in compiled helpers that
      // are structurally uncoverable in unit tests (NestJS/TS known limitation).
      branches: 75,
      statements: 80,
    },
  },
};

export default config;
