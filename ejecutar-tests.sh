#!/bin/sh

npm test -- --json --outputFile=./tests/unitarias/resultados/testRun-output-$(date +%Y-%m-%d_%H-%M-%S).json --passWithNoTests