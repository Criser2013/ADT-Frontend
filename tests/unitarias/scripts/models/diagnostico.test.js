import { jest, describe, expect, test, beforeEach } from '@jest/globals';
import { Diagnostico } from "../../../../src/models";

describe("Validar los métodos de la clase 'Diagnostico'", () => {
    describe("Validar el método 'toJsonApi'", () => {
        test("CP - 73", () => {
            const comorbilidades = ["Enfermedad hematológica", "Hipertensión arterial"];
            const sintomasBinarios = {
                sexo: 0, fumador: false, bebedor: false, tos: false, fiebre: false,
                crepitaciones: false, dolor_toracico: true, malignidad: false, hemoptisis: false,
                disnea: true, sibilancias: false, derrame: false, TEP_TVP_previo: false,
                edema_de_m_inferiores: false, sintomas_disautonomicos: false,
                inmovilidad_de_m_inferiores: false, viaje_prolongado: false,
                proc_quirurgico_traumatismo: false, otra_enfermedad: false, soplos: false
            };
            const sintomasNumericos = {
                saturacion_de_la_sangre: "80", plt: "211100", hb: "13.8", wbc: "12300", edad: "60",
                presion_sistolica: "129", presion_diastolica: "93", frecuencia_respiratoria: "26",
                frecuencia_cardiaca: "128"
            };
            const inst = new Diagnostico(
                "1", "1", "1", comorbilidades, "23-04-2026", true, sintomasBinarios, sintomasNumericos
            );
            const respuesta = {
                edad: 60, sexo: 0, bebedor: 0, fumador: 0, proc_quirurgico_traumatismo: 0,
                viaje_prolongado: 0, tos: 0, fiebre: 0, crepitaciones: 0, dolor_toracico: 1,
                malignidad: 0, hemoptisis: 0, disnea: 1, sibilancias: 0, derrame: 0,
                TEP_TVP_previo: 0, edema_de_m_inferiores: 0, sintomas_disautonomicos: 0,
                inmovilidad_de_m_inferiores: 0, otra_enfermedad: 0, soplos: 0,
                presion_sistolica: 129, presion_diastolica: 93, frecuencia_respiratoria: 26,
                frecuencia_cardiaca: 128, saturacion_de_la_sangre: 80, plt: 211100, hb: 13.8, wbc: 12300,
                enfermedad_hematologica: 1, enfermedad_vascular: 0, enfermedad_pulmonar: 0,
                enfermedad_renal: 0, enfermedad_cardiaca: 0, enfermedad_coronaria: 0,
                enfermedad_endocrina: 0, enfermedad_gastrointestinal: 0, enfermedad_urologica: 0,
                enfermedad_neurologica: 0, enfermedad_trombofilia: 0, enfermedad_vih: 0,
                enfermedad_diabetes_mellitus: 0, enfermedad_hepatopatia_cronica: 0,
                enfermedad_hipertension_arterial: 1
            };

            const res = inst.toJsonApi();
            expect(res).toEqual(respuesta);
        });
    });
});