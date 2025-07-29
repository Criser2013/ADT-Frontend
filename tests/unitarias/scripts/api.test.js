import { jest, expect, describe, test } from '@jest/globals';
import { generarDiagnostico, verUsuario, verUsuarios } from "../../../src/services/Api";

describe("Validar la funcion 'generarDiagnostico'", () => {
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

describe("Validar la funcion 'verUsuarios'", () => {
    test("CP - 81", async () => {
        const resEsperada = [
            { nombre: "persona1", estado: true, rol: 0, "ultima_conexion": "13/07/2025 05:25 PM", correo: "correo@correo.com" },
            { nombre: "persona2", estado: false, rol: 1001, "ultima_conexion": "14/07/2025 05:25 PM", correo: "correo1@correo.com" }
        ];
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() =>
            Promise.resolve({
                ok: true, status: 200,
                json: () => Promise.resolve({ usuarios: resEsperada })
            })
        );
        const res = await verUsuarios("token");
        expect(res).toEqual({ success: true, data: resEsperada, error: null });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:5000/admin/usuarios", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer token"
            },
        });
    });

    test("CP - 82", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() =>
            Promise.resolve({
                ok: false, status: 403,
                json: () => Promise.resolve({ error: "Token inválido" })
            })
        );
        const res = await verUsuarios("token invalido");
        expect(res).toEqual({ success: false, error: "Token inválido", data: null });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:5000/admin/usuarios", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer token invalido"
            }
        });
    });

    test("CP - 83", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() => {
            throw new Error("Error ocurrido.")
        });
        const res = await verUsuarios("token invalido");
        expect(res).toEqual({ success: false, data: null, error: "Ha ocurrido un error al cargar los usuarios. Por favor reintenta nuevamente." });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:5000/admin/usuarios", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer token invalido"
            }
        });
    });
});


describe("Validar la funcion 'verUsuario'", () => {
    test("CP - 84", async () => {
        const resEsperada = {
            correo: "correo1@gmail.com",
            nombre: "persona1", rol: 0, estado: true,
            ultima_conexion: "23/06/2025 11:19 AM"
        };

        global.fetch = jest.fn();
        global.fetch.mockImplementation(() =>
            Promise.resolve({
                ok: true, status: 200,
                json: () => Promise.resolve(resEsperada)
            })
        );
        const res = await verUsuario("token", "correo1@gmail.com");
        expect(res).toEqual({ success: true, data: resEsperada, error: null });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:5000/admin/usuarios/correo1%40gmail%2Ecom", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer token"
            },
        });
    });

    test("CP - 85", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() =>
            Promise.resolve({
                ok: false, status: 404,
                json: () => Promise.resolve({error: "El usuario no existe"})
            })
        );
        const res = await verUsuario("token valido", "correo1@gmail.com");
        expect(res).toEqual({ success: false, error: "El usuario no existe", data: null });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:5000/admin/usuarios/correo1%40gmail%2Ecom", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer token valido"
            }
        });
    });

    test("CP - 86", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() => {
            throw new Error("Error ocurrido.")
        });
        const res = await verUsuario("token invalido", "correo1@gmail.com");
        expect(res).toEqual({ success: false, data: null, error: "Ha ocurrido un error al cargar los datos del usuario. Por favor reintenta nuevamente." });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:5000/admin/usuarios/correo1%40gmail%2Ecom", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer token invalido"
            }
        });
    });
});