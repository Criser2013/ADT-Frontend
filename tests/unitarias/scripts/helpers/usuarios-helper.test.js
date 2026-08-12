import { jest, expect, describe, beforeEach, test } from "@jest/globals";
import Usuario from "../../../../src/models/Usuario";

jest.unstable_mockModule("../../../../src/services/Api", () => ({
    peticionApi: jest.fn()
}));

const { peticionApi } = await import("../../../../src/services/Api");
const UsuariosHelper = (await import("../../../../src/helpers/usuarios-helper")).default;

describe("Validar los métodos de la clase 'UsuariosHelper'", () => {
    describe("Validar el método 'cargarUsuario'", () => {
        // ---------------------- Parámetros ----------------------
        const param = "174"
        // ---------------------- Respuestas esperadas ----------------------
        const res1 = {
            success: true, data: new Usuario(
                "174", "correo@correo.com", "Usuario de prueba", true, true, "01/01/2023 12:00", "01/01/2023 12:00"
            )
        };
        const res2 = { success: false, error: "Error al cargar el usuario" };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test.each([
            ["174", res1, param, res1],
            ["184", res2, param, res2]
        ])("CP - %s", async (idPrueba, mock, params, resObtenida) => {
            peticionApi.mockResolvedValue(mock);
            const helper = new UsuariosHelper("token");
            const res = await helper.cargarUsuario(idPrueba, "es");
            expect(res).toEqual(resObtenida);
            expect(peticionApi).toHaveBeenCalledWith(
                `admin/usuarios/${idPrueba}`, "GET", {}, null, "token", "es",
                "errCargarDatosUsuarios"
            );
        });
    });

    describe("Validar el método 'cargarUsuarios'", () => {
        // ---------------------- Respuestas esperadas ----------------------
        const res1 = {
            success: true, data: [
                new Usuario(
                    "174", "correo@correo.com", "Usuario de prueba", true, true, "01/01/2023 12:00", "01/01/2023 12:00"
                )]
        };
        const res2 = { success: false, error: "Error al cargar los usuarios" };
        // ---------------------- Mocks ----------------------
        const mock1 = {
            success: true, data: {
                usuarios: [
                    new Usuario(
                        "174", "correo@correo.com", "Usuario de prueba", true, true, "01/01/2023 12:00", "01/01/2023 12:00"
                    )]
            }
        };
        const mock2 = { success: false, error: "Error al cargar los usuarios" };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test.each([
            ["185", mock1, res1],
            ["186", mock2, res2]
        ])("CP - %s", async (idPrueba, mock, resEsperada) => {
            peticionApi.mockResolvedValue(mock);
            const helper = new UsuariosHelper("token");
            const res = await helper.cargarUsuarios("es");
            expect(res).toEqual(resEsperada);
            expect(peticionApi).toHaveBeenCalledWith(
                "admin/usuarios", "GET", {}, null, "token", "es",
                "errCargarUsuarios"
            );
        });
    });

    describe("Validar el método 'eliminarUsuarios'", () => {
        // ---------------------- Parámetros ----------------------
        const param = [{ uid: "174", nombre: "Usuario de prueba", esAdmin: true }, { uid: "175", nombre: "Usuario de prueba 2", esAdmin: false }];
        // ---------------------- Respuestas esperadas ----------------------
        const res1 = { success: true, error: null };
        const res2 = { success: false, error: "Error al desactivar el usuario" };
        // ---------------------- Mocks ----------------------
        const mocks1 = [{ success: true }, { success: true }];
        const mocks2 = [{ success: true }, { success: false, error: "Error al desactivar el usuario" }];

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test.each([
            ["187", mocks1, param, res1],
            ["188", mocks2, param, res2]
        ])("CP - %s", async (idPrueba, mock, params, resEsperada) => {
            for (const m of mock) {
                peticionApi.mockResolvedValueOnce(m);
            }
            const helper = new UsuariosHelper("token");
            const res = await helper.eliminarUsuarios(params, "es");
            expect(res).toEqual(resEsperada);
            expect(peticionApi).toHaveBeenCalledTimes(params.length);
            for (let i = 1; i < params.length; i++) {
                expect(peticionApi).toHaveBeenCalledWith(
                    `admin/usuarios/${params[i].uid}`, "PATCH", {}, {
                    desactivar: true, eliminado: true, administrador: params[i].esAdmin
                }, "token", "es", ""
                );
            }
        });
    });

    describe("Validar el método 'modificarUsuario'", () => {
        // ---------------------- Parámetros ----------------------
        const param = { id: "174", rol: true, desactivar: true };
        // ---------------------- Respuestas esperadas ----------------------
        const res1 = { success: true };
        const res2 = { success: false, error: "Error al modificar el usuario" };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test.each([
            ["189", res1, param, res1],
            ["190", res2, param, res2]
        ])("CP - %s", async (idPrueba, mock, params, resEsperada) => {
            peticionApi.mockResolvedValue(mock);
            const helper = new UsuariosHelper("token");
            const res = await helper.modificarUsuario(params.id, params.rol, params.desactivar, "es");
            expect(res).toEqual(resEsperada);
            expect(peticionApi).toHaveBeenCalledWith(
                `admin/usuarios/${params.id}`, "PATCH", {}, {
                administrador: params.rol, desactivar: params.desactivar, eliminado: false
            }, "token", "es", ""
            );
        });
    });
});