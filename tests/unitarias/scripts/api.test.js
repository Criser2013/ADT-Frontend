import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import { peticionApi } from "../../../src/services/Api";

describe("Validar la funcion 'peticionApi'", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    test("CP - 70", async () => {
        const resEsperada = { prediccion: true, probabilidad: 0.90812 };
        const petCuerpo = { vih: 0, edad: 80, trombofilia: 1 };

        global.fetch.mockImplementation(() =>
            Promise.resolve({
                ok: true, status: 200,
                json: () => Promise.resolve(resEsperada)
            })
        );

        const res = await peticionApi(
            "diagnosticar", "POST", {}, petCuerpo, "token", "es", "Ha ocurrido un error"
        );

        expect(res).toEqual({ success: true, data: resEsperada, error: null });
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:5000/diagnosticar?", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer token",
                "Language": "es"
            },
            body: JSON.stringify(petCuerpo)
        });
    });

    test("CP - 71", async () => {
        const cuerpoPet = { vih: 0, edad: 80, trombofilia: 1 };

        global.fetch.mockImplementation(() =>
            Promise.resolve({
                ok: false, status: 403,
                json: () => Promise.resolve({ error: "Acceso no autorizado" })
            })
        );

        const res = await peticionApi(
            "diagnosticar", "POST", {}, cuerpoPet, null, "es", "Formato inválido en los datos"
        );

        expect(res).toEqual(
            { success: false, error: "Acceso no autorizado", data: null }
        );
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:5000/diagnosticar?", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Language": "es"
            },
            body: JSON.stringify(cuerpoPet)
        });
    });

    test("CP - 72", async () => {
        global.fetch.mockImplementation(() => {   
            throw new Error("Error inesperado en la conexión");
        });

        const res = await peticionApi(
            "diagnosticar", "POST", {}, null,
            "token invalido", "es", "Ha ocurrido un error al generar el diagnóstico. Por favor reintenta nuevamente."
        );

        expect(res).toEqual(
            { success: false, data: null, error: "Ha ocurrido un error al generar el diagnóstico. Por favor reintenta nuevamente." }
        );
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:5000/diagnosticar?", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer token invalido",
                "Language": "es",
            },
            body: null
        });
    });
});