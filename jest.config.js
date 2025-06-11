const fecha = new Date();

export default {
    testEnvironment: "jest-environment-node",
    transform: {},
    testMatch: [
        "**/tests/unitarias/**.test.js"
    ],
    moduleFileExtensions: ["js",],
    coverageDirectory: `tests/unitarias/cobertura/testrun-${fecha.toDateString()} - ${fecha.toLocaleTimeString().replaceAll(":","-")}`,
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
};