import { jest, describe, expect, test, beforeEach } from '@jest/globals';
import DiagnosticoDto from "../../../../src/dto/DiagnosticoDto";

jest.unstable_mockModule("firebase/firestore", () => ({
    Timestamp: {
        toDate: jest.fn((timestamp) => timestamp),
        fromDate: jest.fn((date) => ({ toDate: () => date }))
    }
}));

const firebase = await import("firebase/firestore");
const { Diagnostico, ExplicacionLime } = await import("../../../../src/models");

const sintomasBinarios = {
    fumador: false, bebedor: false, tos: false, fiebre: false,
    crepitaciones: false, dolor_toracico: true, malignidad: false, hemoptisis: false,
    disnea: true, sibilancias: false, derrame: false, TEP_TVP_previo: false,
    edema_de_m_inferiores: false, sintomas_disautonomicos: false,
    inmovilidad_de_m_inferiores: false, viaje_prolongado: false,
    proc_quirurgico_traumatismo: false, soplos: false
};
const sintomasNumericos = {
    saturacion_de_la_sangre: 80, plt: 211100, hb: 13.8, wbc: 12300, edad: 60,
    presion_sistolica: 129, presion_diastolica: 93, frecuencia_respiratoria: 26,
    frecuencia_cardiaca: 128
};
const comorbilidades = ["Diabetes Mellitus", "Hipertensión arterial"];

describe("Validar los métodos de la clase 'Diagnostico'", () => {
    describe("Validar el setter 'comorbilidades'", () => {
        test("CP - 166", () => {
            const diag = new Diagnostico(
                "1", "1", "1", comorbilidades,
                new Date("2026-04-23"), 0, true, sintomasBinarios, sintomasNumericos
            );

            expect(diag.comorbilidadesCodificadas).toEqual({
                "Diabetes Mellitus": 1, "Hipertensión arterial": 1,
                "Enfermedad vascular": 0, "Trombofilia": 0,
                "Enfermedad renal": 0, "Enfermedad pulmonar": 0,
                "Hepatopatía crónica": 0, "Enfermedad hematológica": 0,
                "VIH": 0, "Enfermedad cardíaca": 0,
                "Enfermedad coronaria": 0, "Enfermedad endocrina": 0,
                "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0,
                "Enfermedad neurológica": 0
            });
            expect(diag.comorbilidades).toEqual(comorbilidades);
        });
    });

    describe("Validar el método 'toJsonApi'", () => {
        test("CP - 73", () => {
            const diag = new Diagnostico(
                "1", "1", "1", comorbilidades, new Date("2026-04-23"), 0, true, sintomasBinarios, sintomasNumericos
            );
            const respuesta = {
                edad: 60, sexo: 0, bebedor: 0, fumador: 0, proc_quirurgico_traumatismo: 0,
                viaje_prolongado: 0, tos: 0, fiebre: 0, crepitaciones: 0, dolor_toracico: 1,
                malignidad: 0, hemoptisis: 0, disnea: 1, sibilancias: 0, derrame: 0,
                TEP_TVP_previo: 0, edema_de_m_inferiores: 0, sintomas_disautonomicos: 0,
                inmovilidad_de_m_inferiores: 0, otra_enfermedad: 1, soplos: 0,
                presion_sistolica: 129, presion_diastolica: 93, frecuencia_respiratoria: 26,
                frecuencia_cardiaca: 128, saturacion_de_la_sangre: 80, plt: 211100, hb: 13.8, wbc: 12300,
                hematologica: 0, vascular: 0, pulmonar: 0, renal: 0, cardiaca: 0, enfermedad_coronaria: 0,
                endocrina: 0, gastrointestinal: 0, urologica: 0, neurologica: 0, trombofilia: 0, vih: 0,
                diabetes_mellitus: 1, hepatopatia_cronica: 0, hipertension_arterial: 1
            };

            const res = diag.toJsonApi();
            expect(res).toEqual(respuesta);
        });
    });

    describe("Validar el método 'validar", () => {
        // ---------------------- Parámetros -------------------------
        const params = 1;

        // ---------------------- Resultados esperados -------------------------
        const resEsperada = { diagMedico: 1, validado: true };

        // ---------------------- Mocks -------------------------
        const inst1 = new Diagnostico(
            "1", "1", "1", comorbilidades, new Date("2026-04-23"), 0, true, sintomasBinarios, sintomasNumericos
        );
        const inst2 = new Diagnostico(
            "2", "1", "1", comorbilidades, new Date("2026-04-23"), 0, true, sintomasBinarios, sintomasNumericos,
            1, 0, 0.5, new ExplicacionLime({ campo: "edad", contribucion: 0.5 })
        );

        test.each([
            ["167", inst1, params, resEsperada],
            ["168", inst2, params, resEsperada]
        ])("CP - %s", (idPrueba, instancia, params, resEsperada) => {
            if (instancia.validado) {
                expect(() => instancia.validar(params)).toThrow("El diagnóstico ya ha sido validado previamente.");
            } else {
                instancia.validar(params);
                expect(instancia.diagnosticoMedico).toEqual(resEsperada.diagMedico);
                expect(instancia.validado).toEqual(resEsperada.validado);
            }
        });
    });

    describe("Validar el método 'toJson'", () => {
        test("CP - 169", () => {
            const comorbilidades = ["Enfermedad hematológica", "Hipertensión arterial"];
            const inst = new Diagnostico(
                "1", "1", "1", comorbilidades, Date("2026-04-23"), 0, true, sintomasBinarios, sintomasNumericos
            );
            const resEsperada = {
                sexo: 0,
                otraEnfermedad: true,
                fecha: expect.any(Object),
                paciente: "1",
                diagnosticoModelo: null,
                diagnosticoMedico: null,
                probabilidad: null,
                explicacion: undefined,
                comorbilidades: ["Hipertensión arterial", "Enfermedad hematológica"],
                ...sintomasBinarios,
                ...sintomasNumericos
            };

            const res = inst.toJson();
            expect(res).toStrictEqual(resEsperada);
        });
    });

    describe("Validar el método 'fromJson'", () => {
        test("CP - 170", () => {
            const json = {
                id: "1", usuario: "1", paciente: "1", comorbilidades: ["Hipertensión arterial", "Enfermedad hematológica"],
                fecha: firebase.Timestamp.fromDate(new Date("2026-04-23")), otraEnfermedad: true,
                diagnosticoModelo: 1, diagnosticoMedico: 0, probabilidad: 0.5,
                explicacion: [{ campo: "edad", contribucion: 0.5 }],
                sexo: 0, fumador: false, bebedor: false, tos: false, fiebre: false,
                crepitaciones: false, dolor_toracico: true, malignidad: false, hemoptisis: false,
                disnea: true, sibilancias: false, derrame: false, TEP_TVP_previo: false,
                edema_de_m_inferiores: false, sintomas_disautonomicos: false,
                inmovilidad_de_m_inferiores: false, viaje_prolongado: false,
                proc_quirurgico_traumatismo: false, otraEnfermedad: false, soplos: false,
                saturacion_de_la_sangre: 80, plt: 211100, hb: 13.8, wbc: 12300, edad: 60,
                presion_sistolica: 129, presion_diastolica: 93, frecuencia_respiratoria: 26,
                frecuencia_cardiaca: 128
            };

            const res = Diagnostico.fromJson(json);
            expect(res.id).toEqual(json.id);
            expect(res.usuario).toEqual(json.usuario);
            expect(res.paciente).toEqual(json.paciente);
            expect(res.comorbilidades).toEqual(json.comorbilidades);
            expect(res.sexo).toEqual(json.sexo);
            expect(res.otraEnfermedad).toEqual(json.otraEnfermedad);
            expect(res.fecha).toEqual(json.fecha.toDate());
            expect(res.diagnosticoModelo).toEqual(json.diagnosticoModelo);
            expect(res.diagnosticoMedico).toEqual(json.diagnosticoMedico);
            expect(res.probabilidad).toEqual(json.probabilidad);
            expect(res.explicacion).toBeInstanceOf(ExplicacionLime);
            expect(res.sintomasBinarios).toEqual({
                fumador: false, bebedor: false, tos: false, fiebre: false,
                crepitaciones: false, dolor_toracico: true, malignidad: false, hemoptisis: false,
                disnea: true, sibilancias: false, derrame: false, TEP_TVP_previo: false,
                edema_de_m_inferiores: false, sintomas_disautonomicos: false,
                inmovilidad_de_m_inferiores: false, viaje_prolongado: false,
                proc_quirurgico_traumatismo: false, soplos: false
            });
            expect(res.sintomasNumericos).toEqual({
                saturacion_de_la_sangre: 80, plt: 211100, hb: 13.8, wbc: 12300, edad: 60,
                presion_sistolica: 129, presion_diastolica: 93, frecuencia_respiratoria: 26,
                frecuencia_cardiaca: 128
            });
        });
    });

    describe("Validar el getter 'fechaFormateada'", () => {
        test("CP - 171", () => {
            const inst = new Diagnostico(
                "1", "1", "1", comorbilidades, new Date("2026-04-23"), 0, true, sintomasBinarios, sintomasNumericos
            );

            expect(inst.fechaFormateada).toEqual("23-04-2026");
        });
    });

    describe("Validar el método 'deepClone'", () => {
        test("CP - 191", () => {
            const original = new Diagnostico(
                "1", "1", "1", comorbilidades,
                new Date("2026-04-23"), 0, true, sintomasBinarios, sintomasNumericos,
                true, false, 0.5, new ExplicacionLime([{ campo: "edad", contribucion: 0.5 }])
            );
            const clon = original.deepClone();

            expect(clon).not.toBe(original);
            expect(clon).toEqual(original);
        });
    });
});