import { jest, expect, test, describe, beforeEach } from "@jest/globals";
import UsuarioAutenticado from "../../../../src/models/UsuarioAutenticado";

describe("Pruebas para la clase UsuarioAutenticado", () => {
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

            const usuario = new UsuarioAutenticado(
                {
                    uid: "123", accessToken: "tokenFirebase", photoURL: "url",
                    displayName: "nombre", email: "correo"
                }, "123", true, "tokenDrive"
            );

            expect(usuario.uid).toBe("123");
            expect(usuario.rol).toBe(true);
            expect(usuario.tokenDrive).toBe("tokenDrive");
            expect(usuario.tokenFirebase).toBe("tokenFirebase");
            expect(usuario.usuarioFirebase).toEqual({ uid: "123", accessToken: "tokenFirebase", photoURL: "url", displayName: "nombre", email: "correo" });
            expect(usuario.fotoUrl).toBe("url");
            expect(usuario.nombre).toBe("nombre");
            expect(usuario.correo).toBe("correo");

            if (mockModoUsuario == "true") {
                expect(usuario.modoUsuario).toBe(true);
                expect(usuario.rolVisible).toBe(false);
            } else {
                expect(usuario.modoUsuario).toBe(false);
                expect(usuario.rolVisible).toBe(true);
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

            const usuario = new UsuarioAutenticado(
                {
                    uid: "123", accessToken: "tokenFirebase", photoURL: "url",
                    displayName: "nombre", email: "correo"
                }, "123", true, "tokenDrive"
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

            expect(usuario.uid).toBe("456");
            expect(usuario.tokenDrive).toBe("nuevoTokenDrive");
            expect(usuario.tokenFirebase).toBe("nuevoTokenFirebase");
            expect(usuario.usuarioFirebase).toEqual({ uid: "456", accessToken: "nuevoTokenFirebase", photoURL: "url", displayName: "nombre", email: "correo" });
            expect(usuario.fotoUrl).toBe("url");
            expect(usuario.nombre).toBe("nombre");
            expect(usuario.correo).toBe("correo");


            if (cambiarModoUsuario) {
                expect(usuario.rolVisible).toBe(false);
            } else {
                expect(usuario.rolVisible).toBe(true);
            }
        });
    });

    describe("Validar el método 'deepClone'", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test("CP - 165", () => {
            const usuario = new UsuarioAutenticado(
                {
                    uid: "123", accessToken: "tokenFirebase", photoURL: "url",
                    displayName: "nombre", email: "correo"
                }, "123", true, "tokenDrive"
            );

            jest.spyOn(Storage.prototype, "getItem").mockReturnValue(null);

            const clon = usuario.deepClone();

            expect(clon).toBeInstanceOf(UsuarioAutenticado);
            expect(clon).not.toBe(usuario);
            expect(clon.uid).toBe(usuario.uid);
            expect(clon.tokenDrive).toBe(usuario.tokenDrive);
            expect(clon.tokenFirebase).toBe(usuario.tokenFirebase);
            expect(clon.usuarioFirebase).toEqual(usuario.usuarioFirebase);
            expect(clon.fotoUrl).toBe(usuario.fotoUrl);
            expect(clon.nombre).toBe(usuario.nombre);
            expect(clon.correo).toBe(usuario.correo);
            expect(clon.rolVisible).toBe(usuario.rolVisible);

            expect(Storage.prototype.getItem).toHaveBeenCalledTimes(2);
            expect(Storage.prototype.getItem).toHaveBeenCalledWith("modo-usuario");
        });
    });
});