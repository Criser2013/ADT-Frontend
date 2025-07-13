import { jest, expect, describe, test } from '@jest/globals';
import { generarDiagnostico } from "../../../src/services/Api";

describe("Validar la funcion 'descargarArchivo'", () => {
    test("CP - 70", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() =>
            Promise.resolve({
                ok: true, status: 200,
                json: () => Promise.resolve({ prediccion: true, probabilidad: 0.90812 })
            })
        );
        const res = await generarDiagnostico({ vih: 0, edad: 1, trombofilia: 2 }, "token");
        expect(res).toEqual({ success: true, data: { prediccion: true, probabilidad: 0.90812 }, error: null });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:5000/diagnosticar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer token"
            },
            body: JSON.stringify({ vih: 0, edad: 1, trombofilia: 2 })
        });
    });

    test("CP - 71", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() =>
            Promise.resolve({
                ok: false, status: 500,
                json: () => Promise.resolve({ error: "Token inválido" })
            })
        );
        const res = await generarDiagnostico({ vih: 0, edad: 1, trombofilia: 2 }, "token invalido");
        expect(res).toEqual({ success: false, error: "Token inválido", data: null });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:5000/diagnosticar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer token invalido"
            },
            body: JSON.stringify({ vih: 0, edad: 1, trombofilia: 2 })
        });
    });

    test("CP - 72", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() => {
            throw new Error("Error ocurrido.")
        });
        const res = await generarDiagnostico({ vih: 0, edad: 1, trombofilia: 2 }, "token invalido");
        expect(res).toEqual({ success: false, data: null, error: "Ha ocurrido un error al generar el diagnóstico. Por favor reintenta nuevamente." });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:5000/diagnosticar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer token invalido"
            },
            body: JSON.stringify({ vih: 0, edad: 1, trombofilia: 2 })
        });
    });
});