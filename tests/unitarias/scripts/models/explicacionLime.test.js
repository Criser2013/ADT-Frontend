import ExplicacionLime from "../../../../src/models/ExplicacionLime";
import { jest, expect, describe, test } from "@jest/globals";

describe("Validar los métodos de la clase 'ExplicacionLime'", () => {
    describe("Validar el método 'toJson'", () => {
        test("CP - 172", () => {
            const exp = [
                {campo: "edad", contribucion: 0.5}, {campo: "sexo", contribucion: -0.3}
            ];
            const explicacion = new ExplicacionLime(exp);
            const res = explicacion.toJson();
            expect(res).toEqual(exp);
        });
    });

    describe("Validar el getter 'datosGrafico'", () => {
        test("CP - 173", () => {
            const exp = [
                {campo: "edad", contribucion: 0.5}, {campo: "sexo", contribucion: -0.3}
            ];
            const explicacion = new ExplicacionLime(exp);
            const res = explicacion.datosGrafico;
            expect(res).toEqual({
                campos: ["edad", "sexo"],
                datosPositivos: [0.5, 0],
                datosNegativos: [0, 0.3]
            });
        });
    });
});