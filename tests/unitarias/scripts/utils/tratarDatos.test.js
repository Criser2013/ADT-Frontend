import dayjs from "dayjs";
import Diagnostico from "../../../../src/models/Diagnostico";
import ExplicacionLime from "../../../../src/models/ExplicacionLime";
import { jest, beforeEach, expect, describe, test } from '@jest/globals';
import {
    obtenerDatosMesActual, detTextoPersona, establecerTextoMeses, evaluarIntervalo,
    convertirDiagnosticoExportable, decoderOtraEnfermedad, procBool, obtenerDatosPorMes
} from "../../../../src/utils/TratarDatos";

describe("Validar la función 'decoderOtraEnfermedad'", () => {
    // --------------------------- Parámetros -----------------------
    const params1 = {
        "Enfermedad vascular": 1, "Diabetes Mellitus": 1, "Trombofilia": 0, "Enfermedad renal": 0,
        "Enfermedad pulmonar": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0,
        "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
        "Enfermedad coronaria": 0, "Enfermedad endocrina": 0,
        "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0
    };
    const params2 = {
        "Enfermedad vascular": 0, "Diabetes Mellitus": 0, "Trombofilia": 0, "Enfermedad renal": 0,
        "Enfermedad pulmonar": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0,
        "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
        "Enfermedad coronaria": 0, "Enfermedad endocrina": 0,
        "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0
    };
    // --------------------------- Resultados esperados -----------------------
    const res1 = ["Enfermedad vascular", "Diabetes Mellitus"];
    const res2 = [];

    test.each([
        ["51", params1, res1],
        ["52", params2, res2]
    ])("CP - 51", (idPrueba, params, resEsperada) => {
        const res = decoderOtraEnfermedad(params);
        expect(res).toEqual(resEsperada);
    });
});

describe("Validar la función 'evaluarIntervalo'", () => {
    // --------------------------- Parámetros -----------------------
    const params1 = { valor: 37, intervalos: [[30, 50, 1], [60, 70, 2], [70, 100, 3]] };
    const params2 = { valor: 12, intervalos: [[-Infinity, 15, 3], [15, 20, 2], [21, Infinity, 1]] };
    const params3 = { valor: 20, intervalos: [[19, Infinity, 4], [10, 19, 1]] };

    test.each([
        ["62", params1, 1],
        ["63", params2, 3],
        ["64", params3, 4]
    ])("CP - %s", (id, params, resEsperada) => {
        const res = evaluarIntervalo(params.valor, params.intervalos);
        expect(res).toEqual(resEsperada);
    });
});

describe("Validar la función 'procBool'", () => {
    test.each([
        ["65", true, 1],
        ["66", false, 0]
    ])("CP - %s", (id, input, expected) => {
        const res = procBool(input);
        expect(res).toEqual(expected);
    });
});

describe("Validar la función 'convertirDiagnosticoExportable'", () => {
    // --------------------------- Parámetros -----------------------
    const instancia = new Diagnostico(
        "ID", "Usuario Test", "1f073a07-6630-6d90-ac94-34c18cc96549",
        ["Enfermedad hematológica", "Hipertensión arterial"],
        new Date("2023-10-01T00:00:00Z"), 0, true,
        {
            bebedor: false, fumador: false,
            proc_quirurgico_traumatismo: false, viaje_prolongado: false,
            tos: false, fiebre: false, crepitaciones: false,
            dolor_toracico: true, malignidad: false, hemoptisis: false,
            disnea: true, sibilancias: false, derrame: false,
            TEP_TVP_previo: false, edema_de_m_inferiores: false, sintomas_disautonomicos: false,
            inmovilidad_de_m_inferiores: false, soplos: false,
        },
        {
            presion_sistolica: 129, presion_diastolica: 93, frecuencia_respiratoria: 26,
            frecuencia_cardiaca: 128, edad: 60,
            saturacion_de_la_sangre: 80, plt: 211100, hb: 13.8, wbc: 12300,
        }, true, null, 0.5, new ExplicacionLime([{ "VIH": 51.85, "Hepatopatía crónica": -48.2 }]),
        "Usuario", "Paciente", "123456789", "N/A"
    );
    const params1 = { esAdmin: false, preprocesar: false, idioma: "es" };
    const params2 = { esAdmin: true, preprocesar: true, idioma: "en" };

    // --------------------------- Resultados esperados -----------------------
    const res1 = {
        "Edad": 60, "Sexo": "M", "Bebedor": 0, "Fumador": 0,
        "Procedimiento quirúrgico o traumatismo reciente": 0, "Viaje prolongado": 0,
        "Tos": 0, "Fiebre": 0, "Crepitaciones": 0,
        "Dolor torácico": 1, "Malignidad": 0, "Hemoptisis": 0,
        "Disnea": 1, "Sibilancias": 0, "Derrame": 0,
        "TEP - TVP previo": 0, "Edema de miembros inferiores": 0, "Síntomas disautonómicos": 0,
        "Inmovilidad de miembros inferiores": 0, "Otra enfermedad": 1, "Soplos": 0,
        "Presión sistólica": 129, "Presión diastólica": 93, "Frecuencia respiratoria": 26,
        "Frecuencia cardíaca": 128, "Saturación de la sangre (SO2)": 80, "Conteo de plaquetas": 211100,
        "Hemoglobina": 13.8, "Conteo glóbulos blancos": 12300,
        "Enfermedad hematológica": 1, "Enfermedad vascular": 0,
        "Enfermedad pulmonar": 0, "Enfermedad renal": 0,
        "Enfermedad cardíaca": 0, "Enfermedad coronaria": 0,
        "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0,
        "Enfermedad urológica": 0, "Enfermedad neurológica": 0,
        "Trombofilia": 0, "VIH": 0, "Paciente": "Paciente", "Probabilidad": "50.00",
        "Diabetes Mellitus": 0, "Hepatopatía crónica": 0, "Hipertensión arterial": 1,
        "Diagnóstico médico": "N/A", "ID": "ID", "Fecha": "1/10/2023", "Diagnóstico modelo": 1,
        "Campos significativos para el diagnóstico": '[{"VIH":51.85,"Hepatopatía crónica":-48.2}]'
    };
    const res2 = {
        "Edad": 2, "Sexo": 0, "Bebedor": 0, "Fumador": 0,
        "Procedimiento quirúrgico o traumatismo reciente": 0, "Viaje prolongado": 0,
        "Tos": 0, "Fiebre": 0, "Crepitaciones": 0,
        "Dolor torácico": 1, "Malignidad": 0, "Hemoptisis": 0,
        "Disnea": 1, "Sibilancias": 0, "Derrame": 0,
        "TEP - TVP previo": 0, "Edema de miembros inferiores": 0, "Síntomas disautonómicos": 0,
        "Inmovilidad de miembros inferiores": 0, "Otra enfermedad": 1, "Soplos": 0,
        "Presión sistólica": 4, "Presión diastólica": 6, "Frecuencia respiratoria": 3,
        "Frecuencia cardíaca": 4, "Saturación de la sangre (SO2)": 7, "Conteo de plaquetas": 4,
        "Hemoglobina": 4, "Conteo glóbulos blancos": 3,
        "Enfermedad hematológica": 1, "Enfermedad vascular": 0,
        "Enfermedad pulmonar": 0, "Enfermedad renal": 0,
        "Enfermedad cardíaca": 0, "Enfermedad coronaria": 0,
        "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0,
        "Enfermedad urológica": 0, "Enfermedad neurológica": 0,
        "Trombofilia": 0, "VIH": 0,
        "Diabetes Mellitus": 0, "Hepatopatía crónica": 0, "Hipertensión arterial": 1,
        "Diagnóstico médico": "N/A", "ID": "ID-Usuario Test", "Usuario": "Usuario Test", "Fecha": "10/1/2023",
        "Diagnóstico modelo": 1
    };

    beforeEach(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    edad: "Edad",
                    txtPaciente: "Paciente",
                    txtUsuario: "Usuario",
                    txtCamposSignificativos: "Campos significativos para el diagnóstico",
                    txtCampoProbabilidad: "Probabilidad",
                    txtCampoSexo: "Sexo",
                    otra_enfermedad: "Otra enfermedad",
                    txtCampoDiagModelo: "Diagnóstico modelo",
                    txtCampoDiagMedico: "Diagnóstico médico",
                    txtFecha: "Fecha",
                    txtEliminado: "Eliminado",
                    txtAnonimo: "Anónimo",
                    bebedor: "Bebedor",
                    fumador: "Fumador",
                    proc_quirurgico_traumatismo: "Procedimiento quirúrgico o traumatismo reciente",
                    viaje_prolongado: "Viaje prolongado",
                    tos: "Tos",
                    fiebre: "Fiebre",
                    crepitaciones: "Crepitaciones",
                    dolor_toracico: "Dolor torácico",
                    malignidad: "Malignidad",
                    hemoptisis: "Hemoptisis",
                    disnea: "Disnea",
                    sibilancias: "Sibilancias",
                    derrame: "Derrame",
                    TEP_TVP_previo: "TEP - TVP previo",
                    edema_de_m_inferiores: "Edema de miembros inferiores",
                    sintomas_disautonomicos: "Síntomas disautonómicos",
                    inmovilidad_de_m_inferiores: "Inmovilidad de miembros inferiores",
                    soplos: "Soplos",
                    presion_sistolica: "Presión sistólica",
                    presion_diastolica: "Presión diastólica",
                    frecuencia_respiratoria: "Frecuencia respiratoria",
                    frecuencia_cardiaca: "Frecuencia cardíaca",
                    saturacion_de_la_sangre: "Saturación de la sangre (SO2)",
                    plt: "Conteo de plaquetas",
                    hb: "Hemoglobina",
                    wbc: "Conteo glóbulos blancos",
                    "Enfermedad hematológica": "Enfermedad hematológica",
                    "Enfermedad vascular": "Enfermedad vascular",
                    "Enfermedad pulmonar": "Enfermedad pulmonar",
                    "Enfermedad renal": "Enfermedad renal",
                    "Enfermedad cardíaca": "Enfermedad cardíaca",
                    "Enfermedad coronaria": "Enfermedad coronaria",
                    "Enfermedad endocrina": "Enfermedad endocrina",
                    "Enfermedad gastrointestinal": "Enfermedad gastrointestinal",
                    "Enfermedad urológica": "Enfermedad urológica",
                    "Enfermedad neurológica": "Enfermedad neurológica",
                    Trombofilia: "Trombofilia",
                    VIH: "VIH",
                    "Diabetes Mellitus": "Diabetes Mellitus",
                    "Hepatopatía crónica": "Hepatopatía crónica",
                    "Hipertensión arterial": "Hipertensión arterial"
                })
            })
        );
    });

    test.each([
        ["79", params1, res1],
        ["80", params2, res2]
    ])("CP - %s", async (idPrueba, params, resEsperada) => {
        const res = await convertirDiagnosticoExportable(instancia, params.esAdmin, params.preprocesar, params.idioma);
        expect(res).toEqual(resEsperada);
    });
});

describe("Validar la función 'detTextoPersona'", () => {
    const func = (x) => {
        const textos = {
            "txtPaciente": "Paciente", "txtUsuario": "Usuario",
            "txtEliminado": "Eliminado", "txtAnonimo": "Anónimo"
        };
        return textos[x] || x;
    };
    // --------------------------- Parámetros -----------------------
    const params1 = ["paciente", "paciente eliminado"];
    const params2 = ["paciente", "paciente anónimo"];
    const params3 = ["usuario", "usuario eliminado"];
    const params4 = ["usuario", "Juan Pérez"];
    // --------------------------- Resultados esperados -----------------------
    const res1 = "Paciente Eliminado";
    const res2 = "Paciente Anónimo";
    const res3 = "Usuario Eliminado";
    const res4 = "Juan Pérez";

    test.each([
        ["76", params1, res1],
        ["77", params2, res2],
        ["78", params3, res3],
        ["53", params4, res4]
    ])("CP - %s", (idPrueba, params, resEsperada) => {
        const res = detTextoPersona(params[0], params[1], func);
        expect(res).toEqual(resEsperada);
    });
});

describe("Validar la función 'obtenerDatosPorMes'", () => {
    // --------------------------- Parámetros -----------------------
    const params1 = {
        datos: [
            { fecha: new Date(2023, 1, 1) },
            { fecha: new Date(2023, 2, 15) },
            { fecha: new Date(2023, 3, 20) },
            { fecha: new Date(2023, 4, 5) }
        ], clave: "fecha", fechaInicio: dayjs(new Date(2023, 1, 1)), fechaFinal: dayjs(new Date(2023, 4, 30))
    };
    const params2 = {
        datos: [
            { fecha: new Date(2023, 0, 1) },
            { fecha: new Date(2023, 1, 15) },
            { fecha: new Date(2023, 2, 20) }
        ], clave: "fecha", fechaInicio: dayjs(new Date(2023, 1, 1)), fechaFinal: dayjs(new Date(2023, 3, 30))
    };
    // --------------------------- Resultados esperados -----------------------
    const res1 = { 1: 1, 2: 1, 3: 1, 4: 1 };
    const res2 = { 1: 1, 2: 1, 3: 0 };

    test.each([
        ["85", params1, res1],
        ["86", params2, res2]
    ])("CP - %s", (idPrueba, params, resEsperada) => {
        const res = obtenerDatosPorMes(params.datos, params.clave, params.fechaInicio, params.fechaFinal);
        expect(res).toEqual(resEsperada);
    });
});

describe("Validar la función 'establecerTextoMeses'", () => {
    test("CP - 81", () => {
        const func = (x) => {
            const claves = { "txtEnero": "Enero", "txtFebrero": "Febrero", "txtMarzo": "Marzo" };
            return (x in claves) ? claves[x] : x;
        };
        const res = establecerTextoMeses({ 0: 5, 1: 10, 2: 15 }, func);
        expect(res).toEqual({ "Enero": 5, "Febrero": 10, "Marzo": 15 });
    });
});

describe("Validar la función 'obtenerDatosMesActual'", () => {
    test("CP - 82", () => {
        const res = obtenerDatosMesActual({ "txtEnero": 5, "txtFebrero": 10, "txtMarzo": 15 });
        expect(res).toEqual(15);
    });
});