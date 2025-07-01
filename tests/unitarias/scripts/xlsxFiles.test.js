import { expect, describe, test } from '@jest/globals';
import { crearArchivoXlsx, descargarArchivoXlsx, leerArchivoXlsx, validarXlsx, validarFilas } from '../../../src/utils/XlsxFiles';

describe("Validar la funcion 'validarXlsx", () => {
    test("CP - 25", () => {
        const res = validarXlsx({
            SheetNames: ["Datos"]
        }, [{
            cedula: 1230123, nombre: "Juan Nombre", sexo: 0, telefono: "1234567890", fechaNacimiento: "12-12-2025",
            "Enfermedad vascular": 0, "Trombofilia": 0, "Enfermedad renal": 0, "Enfermedad pulmonar": 0, "otraEnfermedad": 0,
            "Diabetes": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0, "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
            "Enfermedad coronaria": 0, "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0
        }]);

        expect(res).toBe(true);
    });

    test("CP - 26", () => {
        const res = validarXlsx({
            SheetNames: ["Hola", "Datos"]
        }, [{
            cedula: "texto", nombre: "Juan", sexo: 0, telefono: "1234567890", fechaNacimiento: "12-12-2025",
            "Enfermedad vascular": 0, "Trombofilia": 0, "Enfermedad renal": 0, "Enfermedad pulmonar": 0, "otraEnfermedad": 0,
            "Diabetes": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0, "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
            "Enfermedad coronaria": 0, "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0,
            "campo malo": 1
        }]);

        expect(res).toBe(false);
    });
});

describe("Validar la funcion 'validarFilas", () => {
    test("CP - 27", () => {
        const res = validarFilas([{
            cedula: 1230123, nombre: "Juan Nombre", sexo: 0, telefono: "1234567890", fechaNacimiento: "12-12-2025",
            "Enfermedad vascular": 0, "Trombofilia": 0, "Enfermedad renal": 0, "Enfermedad pulmonar": 0, "otraEnfermedad": 0,
            "Diabetes": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0, "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
            "Enfermedad coronaria": 0, "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0
        }]);

        expect(res).toBe(true);
    });
    
    test("CP - 28", () => {
        const res = validarFilas([{
            cedula: "asd", nombre: "Juan Nombre", sexo: 0, telefono: "1234567890", fechaNacimiento: "12-12-2025",
            "Enfermedad vascular": 0, "Trombofilia": 0, "Enfermedad renal": 0, "Enfermedad pulmonar": 0, "otraEnfermedad": 0,
            "Diabetes": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0, "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
            "Enfermedad coronaria": 0, "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0
        }]);

        expect(res).toBe(false);
    });

    test("CP - 29", () => {
        const res = validarFilas([{
            cedula: 1230123, nombre: "Juan", sexo: 0, telefono: "1234567890", fechaNacimiento: "12-12-2025",
            "Enfermedad vascular": 0, "Trombofilia": 0, "Enfermedad renal": 0, "Enfermedad pulmonar": 0, "otraEnfermedad": 0,
            "Diabetes": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0, "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
            "Enfermedad coronaria": 0, "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0
        }]);

        expect(res).toBe(false);
    });

    test("CP - 30", () => {
        const res = validarFilas([{
            cedula: 1230123, nombre: "Juan Nombre", sexo: 0, telefono: "1234", fechaNacimiento: "12-12-2025",
            "Enfermedad vascular": 0, "Trombofilia": 0, "Enfermedad renal": 0, "Enfermedad pulmonar": 0, "otraEnfermedad": 0,
            "Diabetes": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0, "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
            "Enfermedad coronaria": 0, "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0
        }]);

        expect(res).toBe(false);
    });

    test("CP - 31", () => {
        const res = validarFilas([{
            cedula: 1230123, nombre: "Juan Nombre", sexo: 0, telefono: "1234567890", fechaNacimiento: "2025-20-10",
            "Enfermedad vascular": 0, "Trombofilia": 0, "Enfermedad renal": 0, "Enfermedad pulmonar": 0, "otraEnfermedad": 0,
            "Diabetes": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0, "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
            "Enfermedad coronaria": 0, "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0
        }]);

        expect(res).toBe(false);
    });

    test("CP - 32", () => {
        const res = validarFilas([{
            cedula: 1230123, nombre: "Juan Nombre", sexo: 5, telefono: "1234567890", fechaNacimiento: "20-10-2025",
            "Enfermedad vascular": 0, "Trombofilia": 0, "Enfermedad renal": 0, "Enfermedad pulmonar": 0,"otraEnfermedad": 0,
            "Diabetes": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0, "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
            "Enfermedad coronaria": 0, "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0
        }]);

        expect(res).toBe(false);
    });

    test("CP - 33", () => {
        const res = validarFilas([{
            cedula: 1230123, nombre: "Juan Nombre", sexo: 0, telefono: "1234567890", fechaNacimiento: "20-10-2025",
            "Enfermedad vascular": 6, "Trombofilia": 7, "Enfermedad renal": 3, "Enfermedad pulmonar": 10, "otraEnfermedad": 11,
            "Diabetes": 2, "Hipertensión arterial": 8, "Hepatopatía crónica": 4, "Enfermedad hematológica": 7, "VIH": 6, "Enfermedad cardíaca": 4,
            "Enfermedad coronaria": 67, "Enfermedad endocrina": 9, "Enfermedad gastrointestinal": 9, "Enfermedad urológica": 8
        }]);

        expect(res).toBe(false);
    });
});
/*
describe("Validar la funcion 'crearArchivoXlsx", () => {
    beforeAll(() => {
        jest.clearAllMocks();
    });

    test("CP - 34", () => {
        const instancia = [{
            cedula: 1230123, nombre: "Juan Nombre", sexo: 0, telefono: "1234567890", fechaNacimiento: "20-10-2025",
            "Enfermedad vascular": 6, "Trombofilia": 7, "Enfermedad renal": 3, "Enfermedad pulmonar": 10,
            "Diabetes": 2, "Hipertensión arterial": 8, "Hepatopatía crónica": 4, "Enfermedad hematológica": 7, "VIH": 6, "Enfermedad cardíaca": 4,
            "Enfermedad coronaria": 67, "Enfermedad endocrina": 9, "Enfermedad gastrointestinal": 9, "Enfermedad urológica": 8
        }];
        const res = crearArchivoXlsx(instancia);

        expect(res).toEqual({
            success: true, data: {
                "book": {
                    Sheets: { "Datos": instancia }, SheetNames: ["Datos"]
                }, "props": {
                    bookType: "xlsx", type: "buffer", cellDates: true
                }
            }
        });

    });
});*/
