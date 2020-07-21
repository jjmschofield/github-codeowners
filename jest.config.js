module.exports = {
    "roots": [
        "./src"
    ],
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "globals": {
        "__HOST__": "localhost",
        "__HTTP_PORT__": "3000",
        "__HTTPS_PORT__": "3001",
    },
    "testEnvironment": "node",
    "reporters": [
        "default",
        "jest-junit"
    ],
    "coverageReporters": [
        "html",
        "lcov",
        "text"
    ],
    "coverageDirectory": "./tests/reports/unit/coverage",
    "collectCoverageFrom": [
        "src/**/*.ts"
    ],
    "coveragePathIgnorePatterns": [
        "__mock__",
        ".test.int.ts"
    ]
};
