import { jest, expect, test, describe, beforeEach } from '@jest/globals';
import Paciente from '../../../../src/models/Paciente';
import ArchivoPacientes from '../../../../src/models/ArchivoPacientes';

describe("Pruebas para la clase ArchivoPacientes", () => {
    describe("Validar el método 'toJson'", () => {
        test.skip("CP - 140", () => {
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

    desacribe("Validar el método 'fromJson'", () => {
        test.skip("CP - 141", () => {
            const json = []
        });
    });
});