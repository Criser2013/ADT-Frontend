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
                "Hipertensión arterial": 1, "Diabetes": 1, "Enfermedad vascular": 0, "Trombofilia": 0,
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
                "Hipertensión arterial": 1, "Diabetes": 1, "Enfermedad vascular": 0, "Trombofilia": 0,
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
});