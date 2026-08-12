import UsuarioAutenticado from "../../../../src/models/UsuarioAutenticado";
import { jest, expect, test, describe, beforeEach } from "@jest/globals";

describe("Validar la clase 'UsuarioAutenticado'", () => {
    describe("Validar el constructor de la clase, getters y el método privado 'cargarModoUsuarioCache'", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test.each([
            ["127", null],
            ["128", "true"],
            ["129", "false"]
        ])("CP - %s", (idPrueba, mockModoUsuario) => {
            jest.spyOn(Storage.prototype, "getItem").mockReturnValue(mockModoUsuario);
            jest.spyOn(Storage.prototype, "setItem");
            const usuario = new UsuarioAutenticado({
                uid: "123", accessToken: "tokenFirebase", photoURL: "url",
                displayName: "nombre", email: "correo"
            }, "123", true, "tokenDrive"
            );

            expect(usuario.uid).toEqual("123");
            expect(usuario.rol).toEqual(true);
            expect(usuario.tokenDrive).toEqual("tokenDrive");
            expect(usuario.tokenFirebase).toEqual("tokenFirebase");
            expect(usuario.usuarioFirebase).toEqual({
                uid: "123", accessToken: "tokenFirebase", photoURL: "url", displayName: "nombre", email: "correo"
            });
            expect(usuario.fotoUrl).toEqual("url");
            expect(usuario.nombre).toEqual("nombre");
            expect(usuario.correo).toEqual("correo");

            if (mockModoUsuario == "true") {
                expect(usuario.modoUsuario).toEqual(true);
                expect(usuario.rolVisible).toEqual(false);
            } else {
                expect(usuario.modoUsuario).toEqual(false);
                expect(usuario.rolVisible).toEqual(true);
            }
        });
    });

    describe("Validar el setter 'modoUsuario' y el método privado 'guardarModoUsuarioCache'", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test.each([
            ["130", true, false],
            ["131", false, true]
        ])("CP - %s", (idPrueba, modoUsuario, rolVisible) => {
            jest.spyOn(Storage.prototype, "setItem");
            jest.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
            const usuario = new UsuarioAutenticado(
                { uid: "123" }, "123", true, "token"
            );
            usuario.modoUsuario = modoUsuario;
            expect(usuario.rolVisible).toBe(rolVisible);
            expect(sessionStorage.setItem).toHaveBeenCalledTimes(1);
            expect(sessionStorage.setItem).toHaveBeenCalledWith("modo-usuario", `${modoUsuario}`);
        });
    });

    describe("Validar el método 'actualizarEstadoAutenticacion'", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test.each([
            ["132", false],
            ["133", true]
        ])("CP - %s", (idPrueba, cambiarModoUsuario) => {
            jest.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
            const usuario = new UsuarioAutenticado({
                uid: "123", accessToken: "tokenFirebase", photoURL: "url",
                displayName: "nombre", email: "correo" }, "123", true, "tokenDrive"
            );

            if (cambiarModoUsuario) {
                usuario.modoUsuario = true;
            }

            usuario.actualizarEstadoAutenticacion(
                {
                    uid: "456", accessToken: "nuevoTokenFirebase", photoURL: "url",
                    displayName: "nombre", email: "correo"
                }, "456", true, "nuevoTokenDrive"
            );

            expect(usuario.uid).toEqual("456");
            expect(usuario.tokenDrive).toEqual("nuevoTokenDrive");
            expect(usuario.tokenFirebase).toEqual("nuevoTokenFirebase");
            expect(usuario.usuarioFirebase).toEqual({
                uid: "456", accessToken: "nuevoTokenFirebase", photoURL: "url", displayName: "nombre", email: "correo"
            });
            expect(usuario.fotoUrl).toEqual("url");
            expect(usuario.nombre).toEqual("nombre");
            expect(usuario.correo).toEqual("correo");

            if (cambiarModoUsuario) {
                expect(usuario.rolVisible).toEqual(false);
            } else {
                expect(usuario.rolVisible).toEqual(true);
            }
        });
    });

    describe("Validar el método 'deepClone'", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test("CP - 165", () => {
            jest.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
            const usuario = new UsuarioAutenticado(
                {
                    uid: "123", accessToken: "tokenFirebase", photoURL: "url",
                    displayName: "nombre", email: "correo"
                }, "123", true, "tokenDrive"
            );
            const clon = usuario.deepClone();
            expect(clon).toBeInstanceOf(UsuarioAutenticado);
            expect(clon).not.toBe(usuario);
            expect(clon.uid).toEqual(usuario.uid);
            expect(clon.tokenDrive).toEqual(usuario.tokenDrive);
            expect(clon.tokenFirebase).toEqual(usuario.tokenFirebase);
            expect(clon.usuarioFirebase).toEqual(usuario.usuarioFirebase);
            expect(clon.fotoUrl).toEqual(usuario.fotoUrl);
            expect(clon.nombre).toEqual(usuario.nombre);
            expect(clon.correo).toEqual(usuario.correo);
            expect(clon.rolVisible).toEqual(usuario.rolVisible);
            expect(Storage.prototype.getItem).toHaveBeenCalledTimes(2);
            expect(Storage.prototype.getItem).toHaveBeenCalledWith("modo-usuario");
        });
    });
});