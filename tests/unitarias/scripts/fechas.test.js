import { expect, test, describe } from "@jest/globals";
import { obtenerMesActualStr, obtenerDatosMesActual, obtenerDatosPorMes } from "../../../src/utils/Fechas";
import dayjs from "dayjs";

describe("Validar la función 'obtenerMesActualStr'", () => {
    test("CP - 81", () => {
        const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const res = obtenerMesActualStr(dayjs(new Date(2023,5,6)));

        expect(res).toBe(meses[5]);
    });
});

describe("Validar la función 'obtenerDatosMesActual'", () => {
    test("CP - 82", () => {
        const datos = null;
        const res = obtenerDatosMesActual(datos, dayjs(new Date(2023, 2, 15)));

        expect(res).toBe(0);
    });

    test("CP - 83", () => {
        const datos = {};
        const res = obtenerDatosMesActual(datos, dayjs(new Date(2023, 2, 15)));

        expect(res).toBe(0);
    });

    test("CP - 84", () => {
        const datos = { Enero: 5, Febrero: 3, Marzo: 8 };
        const fecha = dayjs(new Date(2023, 2, 15));
        const res = obtenerDatosMesActual(datos, fecha);

        expect(res).toBe(8);
    });
});

describe("Validar la función 'obtenerDatosPorMes'", () => {
    test("CP - 85", () => {
        const datos = [
            { fecha: "01-02-2023" },
            { fecha: "15-03-2023" },
            { fecha: "20-04-2023" },
            { fecha: "05-05-2023" }
        ];
        const clave = "fecha";
        const numMesesAtras = 3;
        const fechaActual = dayjs(new Date(2023, 4, 1));
        const res = obtenerDatosPorMes(datos, clave, numMesesAtras, fechaActual);

        expect(res).toEqual({
            "Febrero": 1, "Marzo": 1, "Abril": 1, "Mayo": 1
        });
    });

    test("CP - 86", () => {
        const datos = [
            { fecha: { toDate: () => new Date(2023,0,1)} },
            { fecha: { toDate: () => new Date(2023,1,15)} },
            { fecha: { toDate: () => new Date(2023,2,20)} }
        ];
        const clave = "fecha";
        const numMesesAtras = 2;
        const fechaActual = dayjs(new Date(2023, 3, 1));
        const res = obtenerDatosPorMes(datos, clave, numMesesAtras, fechaActual);

        expect(res).toEqual({
            "Febrero": 1, "Marzo": 1, "Abril": 0
        });
    });
});