import { expect, describe, test, jest } from '@jest/globals';
import { detTxtDiagnostico, evaluarIntervalo, nombresCampos, oneHotEncondingOtraEnfermedad, oneHotInversoOtraEnfermedad, procBool, quitarDatosPersonales, transformarDatos } from "../../../src/utils/TratarDatos";

describe("Validar oneHotEncoder de 'otra enfermedad'", () => {
    test("CP - 15", () => {
        const res = oneHotEncondingOtraEnfermedad(["Enfermedad vascular", "Diabetes"]);
        expect(res).toEqual({
            "Enfermedad vascular": 1, "Diabetes": 1, "Trombofilia": 0, "Enfermedad renal": 0,
            "Enfermedad pulmonar": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0,
            "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
            "Enfermedad coronaria": 0, "Enfermedad endocrina": 0,
            "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0, "Enfermedad neurológica": 0
        });
    });

    test("CP - 16", () => {
        const res = oneHotEncondingOtraEnfermedad([]);
        expect(res).toEqual({
            "Enfermedad vascular": 0, "Diabetes": 0, "Trombofilia": 0, "Enfermedad renal": 0,
            "Enfermedad pulmonar": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0,
            "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
            "Enfermedad coronaria": 0, "Enfermedad endocrina": 0,
            "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0, "Enfermedad neurológica": 0
        });
    });
});

describe("Validar la función 'oneHotInversoOtraEnfermedad'", () => {
    test("CP - 51", () => {
        const res = oneHotInversoOtraEnfermedad({
            "Enfermedad vascular": 1, "Diabetes": 1, "Trombofilia": 0, "Enfermedad renal": 0,
            "Enfermedad pulmonar": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0,
            "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
            "Enfermedad coronaria": 0, "Enfermedad endocrina": 0,
            "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0
        });
        expect(res).toEqual(["Enfermedad vascular", "Diabetes"]);
    });

    test("CP - 52", () => {
        const res = oneHotInversoOtraEnfermedad({
            "Enfermedad vascular": 0, "Diabetes": 0, "Trombofilia": 0, "Enfermedad renal": 0,
            "Enfermedad pulmonar": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0,
            "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
            "Enfermedad coronaria": 0, "Enfermedad endocrina": 0,
            "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0
        });
        expect(res).toEqual([]);
    });
});

describe("Validar la función 'quitarDatosPersonales'", () => {
    test("CP - 53", () => {
        const res = quitarDatosPersonales({
            nombre: "Nombre de persona", sexo: 0, fechaNacimiento: "20/12/2025",
            telefono: "12345678", cedula: "123456789", "Enfermedad vascular": 1,
            "Enfermedad vascular": 1, "Diabetes": 0, "Trombofilia": 0,
            "Enfermedad pulmonar": 0, "Hipertensión arterial": 1, "Hepatopatía crónica": 0,
            "Enfermedad hematológica": 1, "VIH": 1, "Enfermedad cardíaca": 0,
            "Enfermedad coronaria": 1, "Enfermedad endocrina": 1,
            "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0
        });

        expect(res).toEqual({
            nombre: "Nombre de persona", sexo: 0, fechaNacimiento: "20/12/2025",
            telefono: "12345678", cedula: "123456789"
        });
    });

    test("CP - 54", () => {
        const res = quitarDatosPersonales({
            nombre: "Nombre de persona", sexo: 0, fechaNacimiento: "20/12/2025",
            telefono: "12345678", cedula: "123456789", "Enfermedad vascular": 1,
            "Enfermedad vascular": 1, "Diabetes": 0, "Trombofilia": 0,
            "Enfermedad pulmonar": 0, "Hipertensión arterial": 1, "Hepatopatía crónica": 0,
            "Enfermedad hematológica": 1, "VIH": 1, "Enfermedad cardíaca": 0,
        });

        expect(res).toEqual({
            nombre: "Nombre de persona", sexo: 0, fechaNacimiento: "20/12/2025",
            telefono: "12345678", cedula: "123456789"
        });
    });
});

describe("Validar la función 'evaluarIntervalo'", () => {
    test("CP - 62", () => {
        const res = evaluarIntervalo(37, [[30, 50, 1], [60, 70, 2], [70, 100, 3]]);
        expect(res).toBe(1);
    });

    test("CP - 63", () => {
        const res = evaluarIntervalo(12, [[null, 15, 3], [15, 20, 2], [21, null, 1]]);
        expect(res).toBe(3);
    });

    test("CP - 64", () => {
        const res = evaluarIntervalo(20, [[19, null, 4], [10, 19, 1]]);
        expect(res).toBe(4);
    });
});

describe("Validar la función 'procBool'", () => {
    test("CP - 65", () => {
        const res = procBool(true);
        expect(res).toBe(1);
    });

    test("CP - 66", () => {
        const res = procBool(false);
        expect(res).toBe(0);
    });
});

describe("Validar la función 'tratarDatos'", () => {
    test("CP - 73", () => {
        const params = {
            sexo: 0, bebedor: false, fumador: false,
            cirugiaReciente: false, viajeProlongado: false,
            tos: false, fiebre: false, crepitaciones: false,
            dolorToracico: true, malignidad: false, hemoptisis: false,
            disnea: true, sibilancias: false, derrame: false,
            tepPrevio: false, edema: false, disautonomicos: false,
            inmovilidad: false, otraEnfermedad: false, soplos: false,
            edad: "60", presionSis: "129", presionDias: "93", frecRes: "26",
            frecCard: "128", so2: "80", plaquetas: "211100", hemoglobina: "13,8", wbc: "12300",
        }
        const comor = {
            "Enfermedad hematológica": 1, "Enfermedad vascular": 0,
            "Enfermedad pulmonar": 0, "Enfermedad renal": 0,
            "Enfermedad cardíaca": 0, "Enfermedad coronaria": 0,
            "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0,
            "Enfermedad urológica": 0, "Enfermedad neurológica": 0,
            "Enfermedad hepática": 0, "Trombofilia": 0, "VIH": 0,
            "Diabetes": 0, "Hepatopatía crónica": 0, "Hipertensión arterial": 1
        };
        const respuesta = {
            edad: 2, sexo: 0, bebedor: 0, fumador: 0,
            "cirugia_reciente": 0, "viaje_prolongado": 0,
            tos: 0, fiebre: 0, crepitaciones: 0,
            "dolor_toracico": 1, malignidad: 0, hemoptisis: 0,
            disnea: 1, sibilancias: 0, derrame: 0,
            "TEP_TVP_previo": 0, "edema_de_m_inferiores": 0, "sintomas_disautonomicos": 0,
            "inmovilidad_de_m_inferiores": 0, "otra_enfermedad": 0, soplos: 0,
            "presion_sistolica": 4, "presion_diastolica": 6, "frecuencia_respiratoria": 3,
            "frecuencia_cardiaca": 4, "saturacion_de_la_sangre": 7, "plt": 4, "hb": 4, "wbc": 3,
            "hematologica": 1, "vascular": 0,
            "pulmonar": 0, "renal": 0,
            "cardiaca": 0, "enfermedad_coronaria": 0,
            "endocrina": 0, "gastrointestinal": 0,
            "urologica": 0, "neurologica": 0,
            "trombofilia": 0, "vih": 0,
            "diabetes_mellitus": 0, "hepatopatia_cronica": 0, "hipertension_arterial": 1
        }

        const res = transformarDatos(params, comor);
        expect(res).toEqual(respuesta);
    });
});

describe("Validar la función 'detTxtDiagnostico'", () => {
    test("CP - 76", () => {
        const res = detTxtDiagnostico(0);
        expect(res).toEqual("Negativo");
    });

    test("CP - 77", () => {
        const res = detTxtDiagnostico(1);
        expect(res).toEqual("Positivo");
    });

    test("CP - 78", () => {
        const res = detTxtDiagnostico(2);
        expect(res).toEqual("No validado");
    });
});

describe("Validar que las función 'nombresCampos' retorne correctamente la instancia", () => {
    test("CP - 79", () => {
        const mockFecha = {
            toDate: () => new Date("2023-10-01T00:00:00Z")
        };

        const instancia = {
            sexo: 0, bebedor: 0, fumador: 0,
            cirugiaReciente: 0, viajeProlongado: 0,
            tos: 0, fiebre: 0, crepitaciones: 0,
            dolorToracico: 1, malignidad: 0, hemoptisis: 0,
            disnea: 1, sibilancias: 0, derrame: 0,
            tepPrevio: 0, edema: 0, disautonomicos: 0,
            inmovilidad: 0, otraEnfermedad: 0, soplos: 0,
            edad: 60, presionSis: 129, presionDias: 93, frecRes: 26,
            frecCard: 128, so2: 80, plaquetas: 211100, hemoglobina: 13.8, wbc: 12300,
            "Enfermedad hematológica": 1, "Enfermedad vascular": 0,
            "Enfermedad pulmonar": 0, "Enfermedad renal": 0,
            "Enfermedad cardíaca": 0, "Enfermedad coronaria": 0,
            "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0,
            "Enfermedad urológica": 0, "Enfermedad neurológica": 0,
            "Enfermedad hepática": 0, "Trombofilia": 0, "VIH": 0,
            "Diabetes": 0, "Hepatopatía crónica": 0, "Hipertensión arterial": 1,
            diagnostico: 1, validado: 0, probabilidad: 0.5, fecha: mockFecha,
            paciente: "Paciente Test", id: "ID"
        }

        const respuesta = {
            "Edad": 60, "Género": "M", "Bebedor": 0, "Fumador": 0,
            "Cirugía reciente": 0, "Viaje prolongado": 0,
            "Tos": 0, "Fiebre": 0, "Crepitaciones": 0,
            "Dolor toracico": 1, "Malignidad": 0, "Hemoptisis": 0,
            "Disnea": 1, "Sibilancias": 0, "Derrame": 0,
            "TEP - TVP Previo": 0, "Edema de M inferiores": 0, "Síntomas disautonomicos": 0,
            "Inmovilidad de M inferiores": 0, "Otra Enfermedad": 0, "Soplos": 0,
            "Presión sistólica": 129, "Presión diastólica": 93, "Frecuencia respiratoria": 26,
            "Frecuencia cardíaca": 128, "Saturación de la sangre": 80, "PLT": 211100, "HB": 13.8, "WBC": 12300,
            "Hematologica": 1, "Vascular": 0,
            "Pulmonar": 0, "Renal": 0,
            "Cardíaca": 0, "Enfermedad coronaria": 0,
            "Endocrina": 0, "Gastrointestinal": 0,
            "Urológica": 0, "Neurológica": 0,
            "Trombofilia": 0, "VIH": 0, "Paciente": "Paciente Test", "Probabilidad": 0.5,
            "Diabetes Mellitus": 0, "Hepatopatía crónica": 0, "Hipertensión arterial": 1,
            "TEP": 0, "ID": "ID", "Fecha": "1/10/2023", "Diagnóstico modelo": 1
        };

        const res = nombresCampos(instancia, false, false);

        expect(res).toEqual(respuesta);
    });

    test("CP - 80", () => {
        const mockFecha = {
            toDate: () => new Date("2023-10-01T00:00:00Z")
        };

        const instancia = {
            sexo: 0, bebedor: 0, fumador: 0,
            cirugiaReciente: 0, viajeProlongado: 0,
            tos: 0, fiebre: 0, crepitaciones: 0,
            dolorToracico: 1, malignidad: 0, hemoptisis: 0,
            disnea: 1, sibilancias: 0, derrame: 0,
            tepPrevio: 0, edema: 0, disautonomicos: 0,
            inmovilidad: 0, otraEnfermedad: 0, soplos: 0,
            edad: 60, presionSis: 129, presionDias: 93, frecRes: 26,
            frecCard: 128, so2: 80, plaquetas: 211100, hemoglobina: 13.8, wbc: 12300,
            "Enfermedad hematológica": 1, "Enfermedad vascular": 0,
            "Enfermedad pulmonar": 0, "Enfermedad renal": 0,
            "Enfermedad cardíaca": 0, "Enfermedad coronaria": 0,
            "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0,
            "Enfermedad urológica": 0, "Enfermedad neurológica": 0,
            "Enfermedad hepática": 0, "Trombofilia": 0, "VIH": 0,
            "Diabetes": 0, "Hepatopatía crónica": 0, "Hipertensión arterial": 1,
            diagnostico: 1, validado: 0, probabilidad: 0.5, fecha: mockFecha,
            paciente: "Paciente Test", id: "ID"
        }

        const respuesta = {
            "Edad": 2, "Género": 0, "Bebedor": 0, "Fumador": 0,
            "Cirugía reciente": 0, "Viaje prolongado": 0,
            "Tos": 0, "Fiebre": 0, "Crepitaciones": 0,
            "Dolor toracico": 1, "Malignidad": 0, "Hemoptisis": 0,
            "Disnea": 1, "Sibilancias": 0, "Derrame": 0,
            "TEP - TVP Previo": 0, "Edema de M inferiores": 0, "Síntomas disautonomicos": 0,
            "Inmovilidad de M inferiores": 0, "Otra Enfermedad": 0, "Soplos": 0,
            "Presión sistólica": 4, "Presión diastólica": 6, "Frecuencia respiratoria": 3,
            "Frecuencia cardíaca": 4, "Saturación de la sangre": 7, "PLT": 4, "HB": 4, "WBC": 3,
            "Hematologica": 1, "Vascular": 0,
            "Pulmonar": 0, "Renal": 0,
            "Cardíaca": 0, "Enfermedad coronaria": 0,
            "Endocrina": 0, "Gastrointestinal": 0,
            "Urológica": 0, "Neurológica": 0,
            "Trombofilia": 0, "VIH": 0,
            "Diabetes Mellitus": 0, "Hepatopatía crónica": 0, "Hipertensión arterial": 1,
            "TEP": 0, "ID": "ID"
        };

        const res = nombresCampos(instancia, true, true);

        expect(res).toEqual(respuesta);
    });
});