const fecha = new Date();

export default {
    testEnvironment: "jest-environment-jsdom",
    testMatch: [
        "**/tests/unitarias/scripts/**.test.js"
    ],
    moduleFileExtensions: ["js",],
    coverageDirectory: `tests/unitarias/cobertura/testrun-${fecha.toDateString()} - ${fecha.toLocaleTimeString().replaceAll(":", "-")}`,
    collectCoverage: true,
    testResultsProcessor: "jest-sonar-reporter",
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 85,
            statements: 80
        }
    },
    reporters: ["default", "summary"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    transform: {
        "^.+\\.[t|j]sx?$": "babel-jest",
    },
};