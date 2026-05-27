import { expect, describe, test } from '@jest/globals';
import { validarNombre, validarTelefono, validarNumero, validarFecha, validarFloatPos, validarId } from '../../../src/utils/Validadores';

describe("Validar la función 'validarNumero'", () => {
    // ----------------- Parámetros -----------------
    const params1 = "2323";
    const params2 = "2h7d@#";
    const params3 = "";

    // ----------------- Resultados esperados -----------------
    const res1 = true;
    const res2 = false;

   test.each([
    ["1", params1, res1],
    ["2", params2, res2],
    ["3", params3, res2]
   ])("CP - %s", (idPrueba, param, resEsperada) => {
        const res = validarNumero(param);
        expect(res).toBe(resEsperada);
   });
});

describe("Validar la función 'validarNombre'", () => {
    // ----------------- Parámetros -----------------
    const params1 = "Juan Pérez";
    const params2 = "1234";
    const params3 = "a".repeat(150);

    // ----------------- Resultados esperados -----------------
    const res1 = true;
    const res2 = false;

    test.each([
        ["4", params1, res1],
        ["5", params2, res2],
        ["6", params3, res2]
    ])("CP - %s", (idPrueba, param, resEsperada) => {
        const res = validarNombre(param);
        expect(res).toBe(resEsperada);
    });
});

describe("Validar la función 'validarTelefono'", () => {
    // ----------------- Parámetros -----------------
    const params1 = "1234567";
    const params2 = "ajo11";
    const params3 = "1234567890";

    // ----------------- Resultados esperados -----------------
    const res1 = true;
    const res2 = false;

    test.each([
        ["7", params1, res1],
        ["8", params2, res2],
        ["9", params3, res1]
    ])("CP - %s", (idPrueba, param, resEsperada) => {
        const res = validarTelefono(param);
        expect(res).toBe(resEsperada);
    });
});

describe("Validar la función 'validarFecha'", () => {
    // ----------------- Parámetros -----------------
    const params1 = "31-12-2020";
    const params2 = "20-02-2020";
    const params3 = "01-01-2025";
    const params4 = "32-13-0000";
    const params5 = "ho-la-amigos";

    // ----------------- Resultados esperados -----------------
    const res1 = true;
    const res2 = false;

    test.each([
        ["10", params1, res1],
        ["11", params2, res1],
        ["12", params3, res1],
        ["13", params4, res2],
        ["14", params5, res2]
    ])("CP - %s", (idPrueba, param, resEsperada) => {
        const res = validarFecha(param);
        expect(res).toBe(resEsperada);
    });
});

describe("Validar la función 'validarFloatPos'", () => {
    // ----------------- Parámetros -----------------
    const params1 = "1.2";
    const params2 = "-20.901";
    const params3 = "111";

    // ----------------- Resultados esperados -----------------
    const res1 = true;
    const res2 = false;

    test.each([
        ["67", params1, res1],
        ["68", params2, res2],
        ["69", params3, res1]
    ])("CP - %s", (idPrueba, param, resEsperada) => {
        const res = validarFloatPos(param);
        expect(res).toBe(resEsperada);
    });
});

describe("Validar la función 'validarId'", () => {
    // ----------------- Parámetros -----------------
    const params1 = "1f0619a9-8fe0-6ed0-b203-f50d2557fd26";
    const params2 = "1f061#a9-8$e0-6ed0-b203-f50d2557fd26";

    // ----------------- Resultados esperados -----------------
    const res1 = true;
    const res2 = false;

    test.each([
        ["74", params1, res1],
        ["75", params2, res2]
    ])("CP - %s", (idPrueba, param, resEsperada) => {
        const res = validarId(param);
        expect(res).toBe(resEsperada);
    });
});