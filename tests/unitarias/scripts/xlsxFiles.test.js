import { expect, describe, test } from '@jest/globals';
import { validarXlsxPacientes, validarFilasXlsxPacientes } from '../../../src/utils/XlsxFiles';

describe("Validar la funcion 'validarXlsxPacientes'", () => {
    // ------------------------- Parámetros -------------------------
    const params1 = [{
            cedula: 1230123, nombre: "Juan Nombre", sexo: 0, telefono: "1234567890", fechaNacimiento: "12-12-2025",
            "Enfermedad vascular": 0, "Trombofilia": 0, "Enfermedad renal": 0, "Enfermedad pulmonar": 0, "otraEnfermedad": 0,
            "Diabetes": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0, "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
            "Enfermedad coronaria": 0, "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0,
            "Enfermedad neurológica": 0, fechaCreacion: "12-02-2023",  id: "1f073994-d5df-6880-ad6e-7f6737152867"
        }];
    const params2 = [{
            cedula: "texto", nombre: "Juan", sexo: 0, telefono: "1234567890", fechaNacimiento: "12-12-2025",
            "Enfermedad vascular": 0, "Trombofilia": 0, "Enfermedad renal": 0, "Enfermedad pulmonar": 0, "otraEnfermedad": 0,
            "Diabetes": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0, "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
            "Enfermedad coronaria": 0, "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0,
            "campo malo": 1, fechaCreacion: "2023-13-14"
        }];

    // ------------------------- Respuestas esperadas -------------------------
    const res1 = true;
    const res2 = false;

    test.each([
        ["25", params1, res1],
        ["26", params2, res2],
    ])("CP - %s", (idPrueba, params, resEsperada) => {
        const res = validarXlsxPacientes(params);

        expect(res).toBe(resEsperada);
    });
});

describe("Validar la funcion 'validarFilasXlsxPacientes'", () => {
    // ------------------------- Parámetros -------------------------
    const params1 = [{
            cedula: 1230123, nombre: "Juan Nombre", sexo: 0, telefono: "1234567890", fechaNacimiento: "12-12-2025",
            "Enfermedad vascular": 0, "Trombofilia": 0, "Enfermedad renal": 0, "Enfermedad pulmonar": 0, "otraEnfermedad": 0,
            "Diabetes": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0, "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
            "Enfermedad coronaria": 0, "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0,
            "Enfermedad neurológica": 0, fechaCreacion: "12-02-2023", id: "1f073994-d5df-6880-ad6e-7f6737152867"
        }];
    const params2 = [{
            cedula: 1230123, nombre: "Juan", sexo: 2, telefono: "1234567890", fechaNacimiento: "12-12-2025",
            "Enfermedad vascular": 0, "Trombofilia": 0, "Enfermedad renal": 0, "Enfermedad pulmonar": 0, "otraEnfermedad": 0,
            "Diabetes": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0, "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
            "Enfermedad coronaria": 0, "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0,
            "Enfermedad neurológica": 0, fechaCreacion: "12-02-2023"
        }];

    // ------------------------- Respuestas esperadas -------------------------
    const res1 = true;
    const res2 = false;
    
    test.each([
        ["27", params1, res1],
        ["28", params2, res2],
    ])("CP - %s", (idPrueba, params, resEsperada) => {
        const res = validarFilasXlsxPacientes(params);
        expect(res).toBe(resEsperada);
    });

    // 29, 30, 31,32,33 87,88
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