import ArchivoPacientes from '../../../../src/models/ArchivoPacientes';
import Paciente from '../../../../src/models/Paciente';
import { jest, expect, test, describe, beforeEach } from '@jest/globals';


describe("Validar los métodos de la clase 'ArchivoPacientes'", () => {
    describe("Validar el método 'toJson'", () => {
        test("CP - 139", () => {
            const paciente1 = new Paciente(
                "id1", "1234567890", "Paciente 1", 0,
                "01-01-2000", "0987654321", "07-06-2026",
                true, ["Diabetes"]
            );
            const paciente2 = new Paciente(
                "id2", "0987654321", "Paciente 2", 1,
                "02-02-1990", "0123456789", "08-06-2026",
                false, ["Hipertensión arterial"]
            );
            const pacientes = [paciente1, paciente2];
            const archivoPacientes = new ArchivoPacientes(pacientes);
            const json = archivoPacientes.toJson();
            expect(json).toEqual(pacientes.map(paciente => paciente.toJson()));
        });
    });

    describe("Validar el método 'fromJson'", () => {
        test("CP - 140", () => {
            const json1 = {
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
            const json2 = {
                id: "id", cedula: "12345678910",
                nombre: "Paciente", sexo: 0,
                fechaNacimiento: "01-01-2000", telefono: "0987654321",
                fechaCreacion: "07-06-2026", otraEnfermedad: true,
                "Hipertensión arterial": 1, "Diabetes Mellitus": 1, "Enfermedad vascular": 0, "Trombofilia": 0,
                "Enfermedad renal": 0, "Enfermedad pulmonar": 0, "Hepatopatía crónica": 0,
                "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0, "Enfermedad coronaria": 0,
                "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0,
                "Enfermedad neurológica": 0,
            };
            const pacientes = [json1, json2];
            const archivo = ArchivoPacientes.fromJson(pacientes);
            expect(archivo.pacientes.length).toEqual(2);
            for (let i = 0; i < archivo.pacientes.length; i++) {
                expect(archivo.pacientes[i].toJson()).toEqual(pacientes[i]);
            }
        });
    });

    describe("Validar el método 'anadirPaciente'", () => {
        test("CP - 141", () => {
            const paciente1 = new Paciente(
                "id1", "1234567890", "Paciente 1", 0,
                "01-01-2000", "0987654321", "07-06-2026",
                true, ["Diabetes"]
            );
            const paciente2 = new Paciente(
                "id2", "0987654321", "Paciente 2", 1,
                "02-02-1990", "0123456789", "08-06-2026",
                false, ["Hipertensión arterial"]
            );
            const paciente3 = new Paciente(
                "id3", "0987654322", "Paciente 3", 0,
                "03-03-1990", "0123456789", "08-06-2026",
                true, ["Enfermedad renal"]
            );
            const archivo = new ArchivoPacientes([paciente1, paciente2]);
            archivo.anadirPaciente(paciente3);
            expect(archivo.pacientes.length).toEqual(3);
            expect(archivo.pacientes[2]).toEqual(paciente3);
        });

        test("CP - 142", () => {
            const paciente1 = new Paciente(
                "id1", "1234567890", "Paciente 1", 0,
                "01-01-2000", "0987654321", "07-06-2026",
                true, ["Diabetes"]
            );
            const paciente2 = new Paciente(
                "id2", "0987654321", "Paciente 2", 1,
                "02-02-1990", "0123456789", "08-06-2026",
                false, ["Hipertensión arterial"]
            );
            const archivo = new ArchivoPacientes([paciente1, paciente2]);
            expect(() => {
                archivo.anadirPaciente(paciente2);
            }).toThrow(`El paciente con cédula ${paciente2.cedula} ya existe`);
            expect(archivo.pacientes.length).toBe(2);
        });
    });

    describe("Validar el método 'modificarPaciente'", () => {
        const paciente1 = new Paciente(
            "id1", "1234567890", "Paciente 1", 0,
            "01-01-2000", "0987654321", "07-06-2026",
            true, ["Diabetes"]
        );
        const paciente2 = new Paciente(
            "id2", "0987654321", "Paciente 2", 1,
            "02-02-1990", "0123456789", "08-06-2026",
            false, ["Hipertensión arterial"]
        );
        const pacienteModificado = new Paciente(
            "id2", "0987654321", "Paciente 3", 0,
            "03-03-1990", "0123456789", "08-06-2026",
            true, ["Enfermedad renal"]
        );

        test.each([
            ["143", false],
            ["144", true]
        ])("CP - %s", (arrojaExcepcion) => {
            const archivo = new ArchivoPacientes([paciente1, paciente2]);

            if (arrojaExcepcion) {
                expect(() => {
                    archivo.modificarPaciente("id3", pacienteModificado);
                }).toThrow(`El paciente con id id3 no existe`);
            } else {
                archivo.modificarPaciente("id2", pacienteModificado);
                expect(archivo.pacientes[1]).toEqual(pacienteModificado);
            }

            expect(archivo.pacientes.length).toEqual(2);
        });
    });

    describe("Validar el método 'eliminarPacientes'", () => {
        const paciente1 = new Paciente(
            "id1", "1234567890", "Paciente 1", 0,
            "01-01-2000", "0987654321", "07-06-2026",
            true, ["Diabetes"]
        );
        const paciente2 = new Paciente(
            "id2", "0987654321", "Paciente 2", 1,
            "02-02-1990", "0123456789", "08-06-2026",
            false, ["Hipertensión arterial"]
        );
        // ---------------------- Parámetros ----------------------
        const params1 = { pacientes: "id2", varios: false };
        const params2 = { pacientes: ["id1", "id2"], varios: true };
        // ---------------------- Respuestas esperadas ----------------------
        const res1 = { tam: 1, esperado: [paciente1] };
        const res2 = { tam: 0 };

        test.each([
            ["146", params1, res1],
            ["147", params2, res2],
        ])("CP - %s", (idPrueba, params, resEsperada) => {
            const archivo = new ArchivoPacientes([paciente1, paciente2]);
            archivo.eliminarPacientes(params.pacientes, params.varios);
            expect(archivo.pacientes.length).toEqual(resEsperada.tam);

            if (resEsperada.esperado) {
                expect(archivo.pacientes[0]).toEqual(resEsperada.esperado[0]);
            }
        });

        test("CP - 148", () => {
            const archivo = new ArchivoPacientes([paciente1]);
            expect(() => {
                archivo.eliminarPacientes("id2");
            }).toThrow(`El paciente con id id2 no existe`);
        });
    });

    describe("Validar el método 'verPaciente'", () => {
        const paciente1 = new Paciente(
            "id1", "1234567890", "Paciente 1", 0,
            "01-01-2000", "0987654321", "07-06-2026",
            true, ["Diabetes"]
        );
        const paciente2 = new Paciente(
            "id2", "0987654321", "Paciente 2", 1,
            "02-02-1990", "0123456789", "08-06-2026",
            false, ["Hipertensión arterial"]
        );
        test("CP - 149", () => {
            const archivo = new ArchivoPacientes([paciente1, paciente2]);
            const paciente = archivo.verPaciente("id2");
            expect(paciente).toEqual({ success: true, data: paciente2 });
        });

        test("CP - 150", () => {
            const archivo = new ArchivoPacientes([paciente1]);
            expect(() => {
                archivo.verPaciente("id2");
            }).toThrow(`El paciente con id id2 no existe`);
        });
    });
});