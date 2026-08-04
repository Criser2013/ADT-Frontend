import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { COMORBILIDADES } from "../../../../src/constants";

const mockDecoder = jest.fn();

jest.unstable_mockModule("../../../../src/utils/TratarDatos", () => ({
    decoderOtraEnfermedad: mockDecoder
}));

const { decoderOtraEnfermedad } = await import("../../../../src/utils/TratarDatos");
const Paciente = (await import("../../../../src/models/Paciente")).default;

describe("Pruebas para la clase Paciente", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Validar el método 'fromJson", () => {
        test("CP - 134", () => {
            mockDecoder.mockReturnValue(["Diabetes Mellitus", "Hipertensión arterial"]);

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

            expect(paciente.id).toBe("id");
            expect(paciente.cedula).toBe("1234567890");
            expect(paciente.nombre).toBe("Paciente");
            expect(paciente.sexo).toBe(0);
            expect(paciente.fechaNacimiento).toBe("01-01-2000");
            expect(paciente.telefono).toBe("0987654321");
            expect(paciente.fechaCreacion).toBe("07-06-2026");
            expect(paciente.otraEnfermedad).toBe(true);
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
            expect(json.id).toBe("id");
            expect(json.cedula).toBe("1234567890");
            expect(json.nombre).toBe("Paciente");
            expect(json.sexo).toBe(0);
            expect(json.fechaNacimiento).toBe("01-01-2000");
            expect(json.telefono).toBe("0987654321");
            expect(json.fechaCreacion).toBe("07-06-2026");
            expect(json.otraEnfermedad).toBe(true);

            for (const key of COMORBILIDADES) {
                if (["Diabetes Mellitus", "Hipertensión arterial"].includes(key)) {
                    expect(json[key]).toBe(1);
                } else {
                    expect(json[key]).toBe(0);
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

            expect(paciente.edad).toBe(26);
            expect(paciente.fechaNacimientoFormateada.format("DD-MM-YYYY")).toBe("01-01-2000");
            expect(paciente.fechaCreacionFormateada.format("DD-MM-YYYY")).toBe("07-06-2026");
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

    describe("Validar el getter 'comorbilidades'", () => {
        test("CP - 138", () => {
            mockDecoder.mockReturnValue(["Diabetes Mellitus", "Hipertensión arterial"]);

            const paciente = new Paciente(
                "id", "1234567890", "Paciente", 0,
                "01-01-2000", "0987654321", "07-06-2026",
                true, ["Diabetes Mellitus", "Hipertensión arterial"]
            );

            expect(paciente.comorbilidades).toEqual(["Diabetes Mellitus", "Hipertensión arterial"]);
            expect(mockDecoder).toHaveBeenCalledTimes(1);
            expect(mockDecoder).toHaveBeenCalledWith(paciente.comorbilidadesCodificadas);
        });
    });
});