import { expect, describe, test } from '@jest/globals';
import { validarNombre, validarTelefono, validarNumero, validarFecha, validarFloatPos } from '../../../src/utils/Validadores';

describe("Validar número ", () => {
   test("CP - 1", () => {
        const res = validarNumero("2323");
       expect(res).toBe(true);
   });

   test("CP - 2", () => {
        const res = validarNumero("2h7d@#");
       expect(res).toBe(false);
   });

   test("CP - 3", () => {
       const res = validarNumero("");
       expect(res).toBe(false);
   });
});

describe("Validar nombre", () => {
    test("CP - 4",() => {
        const res = validarNombre("Juan Pérez");
        expect(res).toBe(true);
    });

    test("CP - 5",() => {
        const res = validarNombre("1234");
        expect(res).toBe(false);
    });

    test("CP - 6",() => {
        const res = validarNombre("a".repeat(150));
        expect(res).toBe(false);
    });
});

describe("Validar teléfono", () => {
    test("CP - 7", () => {
        const res = validarTelefono("0987654321");
        expect(res).toBe(true);
    });

    test("CP - 8", () => {
        const res = validarTelefono("ajo11");
        expect(res).toBe(false);
    });

    test("CP - 9", () => {
        const res = validarTelefono("09876543210912");
        expect(res).toBe(false);
    });
});

describe("Validar fecha", () => {
    test("CP - 10", () => {
        const res = validarFecha("31-12-2020");
        expect(res).toBe(true);
    });

    test("CP - 11", () => {
        const res = validarFecha("31-02-2020");
        expect(res).toBe(true);
    });

    test("CP - 12", () => {
        const res = validarFecha("01-01-2025");
        expect(res).toBe(true);
    });

    test("CP - 13", () => {
        const res = validarTelefono("32-13-0000");
        expect(res).toBe(false);
    });

    test("CP - 14", () => {
        const res = validarFecha("ho-la-amigos");
        expect(res).toBe(false);
    });
});

describe("Validar un número real positivo", () => {
    test("CP - 67", () => {
        const res = validarFloatPos("1,2");
        expect(res).toBe(true);
    });

    test("CP - 68", () => {
        const res = validarFloatPos("-20,901");
        expect(res).toBe(false);
    });

    test("CP - 69", () => {
        const res = validarFloatPos("111");
        expect(res).toBe(true);
    });
});