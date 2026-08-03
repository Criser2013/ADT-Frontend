import { jest, expect, describe, test } from "@jest/globals";
import Usuario from "../../../../src/models/Usuario";

describe("Validar los métodos de la clase 'Usuario'", () => {
    describe("Validar los getters de la clase 'Usuario'", () => {
        test("CP - 174", () => {
            const fechaRegistro = new Date("2026-04-09");
            const fechaUltimoAcceso = new Date("2026-04-10");
            const usuario = new Usuario("1", "test@example.com", "Test User", false, true,
                "09/04/2026 00:00 AM", "10/04/2026 00:00 AM");
            expect(usuario.uid).toBe("1");
            expect(usuario.correo).toBe("test@example.com");
            expect(usuario.nombre).toBe("Test User");
            expect(usuario.esAdmin).toBe(false);
            expect(usuario.estado).toBe(true);
            expect(usuario.fechaRegistro).toEqual(fechaRegistro);
            expect(usuario.fechaUltimoAcceso).toEqual(fechaUltimoAcceso);
        });
    });
});