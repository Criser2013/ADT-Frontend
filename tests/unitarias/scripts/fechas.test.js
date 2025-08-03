import { expect, test, describe } from "@jest/globals";
import { obtenerMesActualStr, obtenerDatosMesActual } from "../../../src/utils/Fechas";

describe("Validar la función 'obtenerMesActualStr'", () => {
    test("CP - 81", () => {
        const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const mesActual = new Date().getMonth();
        const res = obtenerMesActualStr();

        expect(res).toBe(meses[mesActual]);
    });
});