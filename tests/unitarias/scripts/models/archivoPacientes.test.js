import { jest, expect, test, describe, beforeEach } from '@jest/globals';
import Paciente from '../../../../src/models/Paciente';
import ArchivoPacientes from '../../../../src/models/ArchivoPacientes';

describe("Pruebas para la clase ArchivoPacientes", () => {
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

            const archivoPacientes = new ArchivoPacientes([paciente1, paciente2]);
            const json = archivoPacientes.toJson();
            expect(json).toEqual([
                paciente1.toJson(),
                paciente2.toJson()
            ]);
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

            const archivo = ArchivoPacientes.fromJson([json1, json2]);
            expect(archivo.pacientes.length).toBe(2);
            expect(archivo.pacientes[0].toJson()).toEqual(json1);
            expect(archivo.pacientes[1].toJson()).toEqual(json2);
        });
    });

    describe("Validar el método 'anadirPaciente'", () => {
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

        test("CP - 141", () => {
            const archivo = new ArchivoPacientes([paciente1, paciente2]);
            archivo.anadirPaciente(paciente3);
            expect(archivo.pacientes.length).toBe(3);
            expect(archivo.pacientes[2]).toEqual(paciente3);
        });

        test("CP - 142", () => {
            const paciente3 = new Paciente(
                "id3", "0987654321", "Paciente 3", 0,
                "03-03-1990", "0123456789", "08-06-2026",
                true, ["Enfermedad renal"]
            );
            const archivo = new ArchivoPacientes([paciente1, paciente2]);

            expect(() => {
                archivo.anadirPaciente(paciente3);
            }).toThrowError(`El paciente con cédula ${paciente3.cedula} ya existe`);
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

        test("CP - 143", () => {
            const archivo = new ArchivoPacientes([paciente1, paciente2]);
            archivo.modificarPaciente("id2", pacienteModificado);

            expect(archivo.pacientes.length).toBe(2);
            expect(archivo.pacientes[1]).toEqual(pacienteModificado);

        });

        test("CP - 144", () => {
            const archivo = new ArchivoPacientes([paciente1, paciente2]);
            expect(() => {
                archivo.modificarPaciente("id3", pacienteModificado);
            }).toThrowError(`El paciente con id id3 no existe`);

            expect(archivo.pacientes.length).toBe(2);
            expect(archivo.pacientes[1]).toEqual(paciente2);
        });

        test("CP - 145", () => {
            const archivo = new ArchivoPacientes([paciente1, paciente2]);
            const pacienteModificado = new Paciente(
                "id1", "0987654321", "Paciente 3", 0,
                "03-03-1990", "0123456789", "08-06-2026",
                true, ["Enfermedad renal"]
            );

            expect(() => {
                archivo.modificarPaciente("id1", pacienteModificado);
            }).toThrowError(`El paciente con cédula 0987654321 ya existe`);

            expect(archivo.pacientes.length).toBe(2);
            expect(archivo.pacientes[0]).toEqual(paciente1);
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

        test.each([
            ["146", { pacientes: "id2", varios: false }, { tam: 1, esperado: [paciente1] }],
            ["147", { pacientes: ["id1", "id2"], varios: true }, { tam: 0 }],
        ])("CP - %s", (idPrueba, params, resEsperada) => {
            const archivo = new ArchivoPacientes([paciente1, paciente2]);
            archivo.eliminarPacientes(params.pacientes, params.varios);

            expect(archivo.pacientes.length).toBe(resEsperada.tam);
            if (resEsperada.esperado) {
                expect(archivo.pacientes[0]).toEqual(resEsperada.esperado[0]);
            }
        });

        test("CP - 148", () => {
            const archivo = new ArchivoPacientes([paciente1]);
            expect(() => {
                archivo.eliminarPacientes("id2");
            }).toThrowError(`El paciente con id id2 no existe`);
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
            expect(paciente).toEqual(paciente2);
        });

        test("CP - 150", () => {
            const archivo = new ArchivoPacientes([paciente1]);
            expect(() => {
                archivo.verPaciente("id2");
            }).toThrowError(`El paciente con id id2 no existe`);
        });
    });
});