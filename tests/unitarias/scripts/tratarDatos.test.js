import { expect, describe, test } from '@jest/globals';
import { oneHotEncondingOtraEnfermedad, oneHotInversoOtraEnfermedad, quitarDatosPersonales } from "../../../src/utils/TratarDatos";

describe("Validar oneHotEncoder de 'otra enfermedad'", () => {
    test("CP - 15", () => {
        const res = oneHotEncondingOtraEnfermedad(["Enfermedad vascular", "Diabetes"]);
        expect(res).toEqual({
            "Enfermedad vascular": 1, "Diabetes": 1, "Trombofilia": 0, "Enfermedad renal": 0,
            "Enfermedad pulmonar": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0,
            "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
            "Enfermedad coronaria": 0, "Enfermedad endocrina": 0,
            "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0
        });
    });

    test("CP - 16", () => {
        const res = oneHotEncondingOtraEnfermedad([]);
        expect(res).toEqual({
            "Enfermedad vascular": 0, "Diabetes": 0, "Trombofilia": 0, "Enfermedad renal": 0,
            "Enfermedad pulmonar": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0,
            "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
            "Enfermedad coronaria": 0, "Enfermedad endocrina": 0,
            "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0
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