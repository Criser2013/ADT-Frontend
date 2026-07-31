import { jest, describe, expect, test, beforeEach } from '@jest/globals';
import DiagnosticoDto from "../../../../src/dto/DiagnosticoDto";

describe("Validar la clase DiagnosticoDto", () => {
    describe("Validar el constructor de la clase", () => {
        test("CP - 194", () => {
            const inst = new DiagnosticoDto(
                "idDiagnostico", "idUsuario", "usuario", "idPaciente", "paciente",
                "cedula", 30, new Date("2026-04-23"), 0, true, false
            );
            expect(inst.idCompuesto).toBe("idDiagnostico-idUsuario");
            expect(inst.idUsuario).toBe("idUsuario");
            expect(inst.usuario).toBe("usuario");
            expect(inst.idPaciente).toBe("idPaciente");
            expect(inst.paciente).toBe("paciente");
            expect(inst.cedula).toBe("cedula");
            expect(inst.edad).toBe(30);
            expect(inst.fecha).toEqual(new Date("2026-04-23"));
            expect(inst.sexo).toBe(0);
            expect(inst.diagnosticoModelo).toBe(true);
            expect(inst.diagnosticoMedico).toBe(false);
            expect(inst.validado).toBe(true);
            expect(inst.esUsuarioEliminado).toBe(false);
            expect(inst.esPacienteAnonimo).toBe(false);
            expect(inst.esPacienteEliminado).toBe(false);
        });
    });

    describe("Validar los setters declarados en la clase", () => {
        test("CP - 195", () => {
            const inst = new DiagnosticoDto(
                "idDiagnostico", "idUsuario", "usuario", "idPaciente", "paciente",
                "cedula", 30, new Date("2026-04-23"), 0, true, false
            );
            inst.usuario = "usuario eliminado";
            expect(inst.esUsuarioEliminado).toBe(true);
            inst.paciente = "paciente anónimo";
            expect(inst.esPacienteAnonimo).toBe(true);
            expect(inst.esPacienteEliminado).toBe(false);
            inst.paciente = "paciente eliminado";
            expect(inst.esPacienteEliminado).toBe(true);
            expect(inst.esPacienteAnonimo).toBe(false);
        });
    });

    describe("Validar el método mostrarId", () => {
        // ---------------------- Parámetros -----------------------
        const param1 = true;
        const param2 = false;
        // ---------------------- Resultados esperados ----------------
        const res1 = "idDiagnostico-idUsuario";
        const res2 = "idDiagnostico";
        // ---------------------- Mock ----------------------
        const inst = new DiagnosticoDto(
            "idDiagnostico", "idUsuario", "usuario", "idPaciente", "paciente",
            "cedula", 30, new Date("2026-04-23"), 0, true, false
        );

        test.each([
            ["196", param1, res1],
            ["197", param2, res2]
        ])("CP - %s", (idPrueba, param, resEsperada) => {
            const res = inst.mostrarId(param);
            expect(res).toBe(resEsperada);
        });
    });
});
