import { COMORBILIDADES } from "../../../../src/constants";
import { jest, describe, test, expect } from "@jest/globals";


const Paciente = (await import("../../../../src/models/Paciente")).default;

describe("Validar la clase 'Paciente'", () => {
    describe("Validar el método 'fromJson", () => {
        test("CP - 134", () => {
            const json = {
                id: "id", cedula: "1234567890",
                nombre: "Paciente", sexo: 0,
                fechaNacimiento: "01-01-2000", telefono: "0987654321",
                fechaCreacion: "07-06-2026", otraEnfermedad: true,
                "Hipertensión arterial": 1, "Diabetes Mellitus": 1, "Enfermedad vascular": 0, "Trombofilia": 0,
                "Enfermedad renal": 0, "Enfermedad pulmonar": 0, "Hepatopatía crónica": 0,
                "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0, "Enfermedad coronaria": 0,
                "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0, 
                "Enfermedad neurológica": 0,
            };
            const paciente = Paciente.fromJson(json);
            expect(paciente.id).toEqual(json.id);
            expect(paciente.cedula).toEqual(json.cedula);
            expect(paciente.nombre).toEqual(json.nombre);
            expect(paciente.sexo).toEqual(json.sexo);
            expect(paciente.fechaNacimiento).toEqual(json.fechaNacimiento);
            expect(paciente.telefono).toEqual(json.telefono);
            expect(paciente.fechaCreacion).toEqual(json.fechaCreacion);
            expect(paciente.otraEnfermedad).toEqual(json.otraEnfermedad);
            expect(paciente.comorbilidades).toEqual(["Diabetes Mellitus", "Hipertensión arterial"]);
        });
    });

    describe("Validar el método 'toJson'", () => {
        test("CP - 135", () => {
            const paciente = new Paciente(
                "id", "1234567890", "Paciente", 0,
                "01-01-2000", "0987654321", "07-06-2026",
                true, ["Diabetes Mellitus", "Hipertensión arterial"]
            );
            const json = paciente.toJson();
            expect(json.id).toEqual("id");
            expect(json.cedula).toEqual("1234567890");
            expect(json.nombre).toEqual("Paciente");
            expect(json.sexo).toEqual(0);
            expect(json.fechaNacimiento).toEqual("01-01-2000");
            expect(json.telefono).toEqual("0987654321");
            expect(json.fechaCreacion).toEqual("07-06-2026");
            expect(json.otraEnfermedad).toEqual(true);

            for (const key of COMORBILIDADES) {
                if (["Diabetes Mellitus", "Hipertensión arterial"].includes(key)) {
                    expect(json[key]).toEqual(1);
                } else {
                    expect(json[key]).toEqual(0);
                }
            }
        });
    });

    describe("Validar los getters de la clase", () => {
        test("CP - 136", () => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date("2026-06-23"));
            const paciente = new Paciente(
                "id", "1234567890", "Paciente", 0,
                "01-01-2000", "0987654321", "07-06-2026",
                true, ["Diabetes Mellitus", "Hipertensión arterial"]
            );
            expect(paciente.edad).toEqual(26);
            expect(paciente.fechaNacimientoFormateada.format("DD-MM-YYYY")).toEqual("01-01-2000");
            expect(paciente.fechaCreacionFormateada).toEqual(new Date("2026-06-07"));
            expect(paciente.comorbilidadesCodificadas).toEqual({
                "Diabetes Mellitus": 1, "Hipertensión arterial": 1,
                "Enfermedad vascular": 0, "Trombofilia": 0,
                "Enfermedad renal": 0, "Enfermedad pulmonar": 0,
                "Hepatopatía crónica": 0, "Enfermedad hematológica": 0,
                "VIH": 0, "Enfermedad cardíaca": 0, "Enfermedad coronaria": 0,
                "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0,
                "Enfermedad urológica": 0, "Enfermedad neurológica": 0
            });
            expect(paciente.comorbilidades).toEqual(["Diabetes Mellitus", "Hipertensión arterial"]);
        });
    });

    describe("Validar el setter 'comorbilidades'", () => {
        test("CP - 137", () => {
            const paciente = new Paciente(
                "id", "1234567890", "Paciente", 0,
                "01-01-2000", "0987654321", "07-06-2026",
                true, ["Diabetes Mellitus", "Hipertensión arterial"]
            );
            expect(paciente.comorbilidadesCodificadas).toEqual({
                "Diabetes Mellitus": 1, "Hipertensión arterial": 1,
                "Enfermedad vascular": 0, "Trombofilia": 0,
                "Enfermedad renal": 0, "Enfermedad pulmonar": 0,
                "Hepatopatía crónica": 0, "Enfermedad hematológica": 0,
                "VIH": 0, "Enfermedad cardíaca": 0,
                "Enfermedad coronaria": 0, "Enfermedad endocrina": 0,
                "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0,
                "Enfermedad neurológica": 0
            });
        });
    });
});