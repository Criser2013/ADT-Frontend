import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import { peticionApi } from "../../../../src/services/Api";

describe("Validar la funcion 'peticionApi'", () => {
    // ------------------------ Mocks ------------------------
    const mock1 = () => Promise.resolve({
        ok: true, status: 200,
        json: () => Promise.resolve({ prediccion: true, probabilidad: 0.90812 })
    });
    const mock2 = () => Promise.resolve({
        ok: false, status: 403,
        json: () => Promise.resolve({ error: "Acceso no autorizado" })
    });
    const mock3 = () => { throw new Error("Error inesperado en la conexión") };

    // ------------------------ Params ------------------------
    const params1 = {
        ruta: "diagnosticar", metodo: "POST", parametros: {},
        cuerpo: { vih: 0, edad: 80, trombofilia: 1 },
        token: "token", idioma: "es", mensajeError: "Ha ocurrido un error"
    };
    const params2 = {
        ruta: "diagnosticar", metodo: "POST", parametros: {},
        cuerpo: { vih: 0, edad: 80, trombofilia: 1 },
        token: null, idioma: "es", mensajeError: "Formato inválido en los datos"
    };
    const params3 = {
        ruta: "diagnosticar", metodo: "POST", parametros: {},
        cuerpo: null,
        token: "token invalido", idioma: "es", mensajeError: "Ha ocurrido un error al generar el diagnóstico. Por favor reintenta nuevamente."
    };

    // ------------------------ Respuestas esperadas ------------------------
    const res1 = {
        success: true, data: { prediccion: true, probabilidad: 0.90812 },
        error: null
    };
    const res2 = { success: false, error: "Acceso no autorizado" };
    const res3 = { success: false, error: "Ha ocurrido un error al generar el diagnóstico. Por favor reintenta nuevamente." };

    const headers1 = {
                "Content-Type": "application/json",
                "Authorization": "Bearer token",
                "Language": "es"
            };
    const headers2 = {
                "Content-Type": "application/json",
                "Language": "es"
            }
    const headers3 = {
                "Content-Type": "application/json",
                "Authorization": "Bearer token invalido",
                "Language": "es"
            }

    const cuerpo1 = JSON.stringify({ vih: 0, edad: 80, trombofilia: 1 });
    const cuerpo2 = null;


    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    test.each([
        ["70", mock1, params1, res1, headers1, cuerpo1],
        ["71", mock2, params2, res2, headers2, cuerpo1],
        ["72", mock3, params3, res3, headers3, cuerpo2]
    ])("CP - %s", async (idPrueba, mock, params, resEsperada, expectedHeaders, expectedBody) => {
        const { ruta, metodo, parametros, cuerpo, token, idioma, mensajeError } = params;

        global.fetch.mockImplementation(mock);

        const res = await peticionApi(
            ruta, metodo, parametros, cuerpo, token, idioma, mensajeError
        );

        expect(res).toEqual(resEsperada);
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:5000/diagnosticar?", {
            method: "POST",
            headers: expectedHeaders,
            body: expectedBody,
            signal: null
        });
    });
});