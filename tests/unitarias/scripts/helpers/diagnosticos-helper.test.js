import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import ExplicacionLime from "../../../../src/models/ExplicacionLime";


jest.unstable_mockModule("firebase/firestore", () => ({
    Timestamp: {
        toDate: jest.fn((timestamp) => timestamp),
        fromDate: jest.fn((date) => ({ toDate: () => date }))
    }
}));
jest.unstable_mockModule("../../../../src/services/Api", () => ({
    peticionApi: jest.fn()
}));
jest.unstable_mockModule("../../../../src/services/Firestore", () => ({
    cambiarDiagnostico: jest.fn(),
    eliminarDiagnostico: jest.fn(),
    verDiagnostico: jest.fn(),
    verDiagnosticos: jest.fn(),
    verDiagnosticosPorMedico: jest.fn()
}));

const { peticionApi } = await import("../../../../src/services/Api");
const { cambiarDiagnostico, eliminarDiagnostico, verDiagnostico, verDiagnosticos, verDiagnosticosPorMedico } = await import("../../../../src/services/Firestore");
const firebase = await import("firebase/firestore");
const Diagnostico = (await import("../../../../src/models/Diagnostico")).default;
const DiagnosticosHelper = (await import("../../../../src/helpers/diagnosticos-helper")).default;

describe("Validar los métodos de la clase DiagnosticosHelper", () => {
    describe("Validar el método 'diagnosticar'", () => {
        // ---------------------- Parámetros ----------------------
        const params = new Diagnostico(
            "id", "medicoId", "pacienteId", [], new Date("2026-04-23"),
            false, { tos: false }, { wbc: 12300 }
        );

        // ---------------------- Respuestas esperadas ----------------------
        const res1 = { success: true };
        const res2 = { success: false, error: "Error al diagnosticar" };

        // ---------------------- Mocks ----------------------
        const mocks1 = {
            peticionApi: {
                success: true, data: {
                    prediccion: true, probabilidad: 0.6, lime: [{ campo: "edad", contribucion: 0.2 }]
                }
            },
            cambiarDiagnostico: { success: true }
        };
        const mocks2 = {
            peticionApi: { success: false, error: "Error al diagnosticar" }
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test.each([
            ["175", mocks1, params, res1],
            ["176", mocks2, params, res2]
        ])("CP - %s", async (idPrueba, mocks, params, resEsperada) => {
            peticionApi.mockResolvedValue(mocks.peticionApi);

            if (mocks.cambiarDiagnostico) {
                cambiarDiagnostico.mockResolvedValue(mocks.cambiarDiagnostico);
            }

            const helper = new DiagnosticosHelper("token", {}, "es");
            const res = await helper.diagnosticar(
                params
            );

            expect(res).toEqual(resEsperada);
            expect(peticionApi).toHaveBeenCalledWith(
                "diagnosticar", "POST", {}, expect.any(Object), "token", "es", "errDiagnosticar"
            );

            if (resEsperada.success) {
                expect(cambiarDiagnostico).toHaveBeenCalledTimes(1);
                expect(cambiarDiagnostico).toHaveBeenCalledWith(
                    params.id, params.usuario, expect.any(Object), expect.any(Object)
                );
            } else {
                expect(cambiarDiagnostico).not.toHaveBeenCalled();
            }
        });
    });

    describe("Validar el método 'validarDiagnostico'", () => {
        // ---------------------- Parámetros ----------------------
        const param1 = new Diagnostico("id", "medicoId", "pacienteId", [],
            new Date("2026-04-23"), false, { tos: false }, { wbc: 12300 },
            true, null, 0.6, new ExplicacionLime([{ campo: "edad", contribucion: 0.2 }])
        );
        const param2 = new Diagnostico("id2", "medicoId2", "pacienteId2", [],
            new Date("2026-04-23"), false, { tos: false }, { wbc: 12300 },
            true, null, 0.6, new ExplicacionLime([{ campo: "edad", contribucion: 0.2 }])
        );

        // ---------------------- Respuestas esperadas ----------------------
        const res1 = { success: true, data: expect.any(Diagnostico) };
        const res2 = { success: false, error: "Error al validar" };

        // ---------------------- Mocks ----------------------
        const mock1 = {
            success: true,
            data: { ...param1.toJson(), diagnosticoMedico: true, validado: true }
        };
        const mock2 = { success: false, error: "Error al validar" };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test.each([
            ["177", mock1, param1, res1],
            ["191", mock2, param2, res2]
        ])("CP - %s", async (idPrueba, mock, params, resEsperada) => {
            cambiarDiagnostico.mockResolvedValue(mock);

            const helper = new DiagnosticosHelper("token", {}, "es");
            const res = await helper.validarDiagnostico(params, true);

            expect(res).toEqual(resEsperada);
            expect(cambiarDiagnostico).toHaveBeenCalledWith(
                params.id, params.usuario, expect.any(Object), expect.any(Object)
            );

            if (resEsperada.success) {
                expect(res.data.validado).toEqual(true);
            }
        });
    });

    describe("Validar el método 'cargarDiagnostico'", () => {
        // ---------------------- Parámetros ----------------------
        const param = "1fffffff-3ggg-4hhh-5iii-6jjjjjjjjjjj-jlasdo1212kl1jlasdo1212kl11"

        // ---------------------- Respuestas esperadas ----------------------
        const res1 = { success: true, data: expect.any(Diagnostico) };
        const res2 = { success: false, error: "Error al cargar" };

        // ---------------------- Mocks ----------------------
        const mocks1 = {
            success: true, data: {
                id: "1fffffff-3ggg-4hhh-5iii-6jjjjjjjjjjj",
                usuario: "jlasdo1212kl1jlasdo1212kl11",
                otraEnfermedad: false, paciente: "pacienteId",
                fecha: firebase.Timestamp.fromDate(new Date("2026-04-23")),
                probabilidad: 0.5, explicacion: [{ campo: "edad", contribucion: 0.2 }],
                diagnosticoModelo: true, diagnosticoMedico: false,
                comorbilidades: [], tos: true, wbc: 12300
            }
        };
        const mocks2 = { success: false, error: "Error al cargar" };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test.each([
            ["178", mocks1, param, res1],
            ["179", mocks2, param, res2]
        ])("CP - %s", async (idPrueba, mocks, params, resEsperada) => {
            verDiagnostico.mockResolvedValue(mocks);

            const helper = new DiagnosticosHelper("token", {}, "es");
            const res = await helper.cargarDiagnostico(params);

            expect(res).toEqual(resEsperada);
            expect(verDiagnostico).toHaveBeenCalledWith(
                "1fffffff-3ggg-4hhh-5iii-6jjjjjjjjjjj", "jlasdo1212kl1jlasdo1212kl11", {}
            );
        });
    });

    describe("Validar el método 'cargarDiagnosticos'", () => {
        // ---------------------- Parámetros ----------------------
        const params1 = {
            cargarTodos: true, params: {
                usuarios: ["jlasdo1212kl1jlasdo1212kl11", "jlasdo1212kl1jlasdo1212kl12"]
            }
        };
        const params2 = {
            params: { uid: "jlasdo1212kl1jlasdo1212kl11", fecha: firebase.Timestamp.fromDate(new Date("2026-04-23")) },
            cargarTodos: false
        };

        // ---------------------- Respuestas esperadas ----------------------
        const res1 = { success: true, data: expect.arrayOf(expect.any(Diagnostico)) }
        const res2 = { success: true, data: expect.arrayOf(expect.any(Diagnostico)) };

        // ---------------------- Mocks ----------------------
        const mocks2 = {
            verDiagnosticosPorMedico: {
                success: true, data: [
                    {
                        id: "1fffffff-3ggg-4hhh-5iii-6jjjjjjjjjj1",
                        usuario: "jlasdo1212kl1jlasdo1212kl11",
                        otraEnfermedad: false, paciente: "pacienteId",
                        fecha: firebase.Timestamp.fromDate(new Date("2026-04-23")),
                        probabilidad: 0.5, explicacion: [{ campo: "edad", contribucion: 0.2 }],
                        diagnosticoModelo: true, diagnosticoMedico: false,
                        comorbilidades: [], tos: true, wbc: 12300
                    },
                    {
                        id: "1fffffff-3ggg-4hhh-5iii-6jjjjjjjjjj2",
                        usuario: "jlasdo1212kl1jlasdo1212kl11",
                        otraEnfermedad: false, paciente: "pacienteId",
                        fecha: firebase.Timestamp.fromDate(new Date("2026-04-23")),
                        probabilidad: 0.5, explicacion: [{ campo: "edad", contribucion: 0.2 }],
                        diagnosticoModelo: true, diagnosticoMedico: false,
                        comorbilidades: [], tos: true, wbc: 12300
                    }
                ]
            }
        };
        const mocks1 = {
            verDiagnosticos: {
                success: true, data: [
                    {
                        id: "1fffffff-3ggg-4hhh-5iii-6jjjjjjjjjj1",
                        usuario: "jlasdo1212kl1jlasdo1212kl11",
                        otraEnfermedad: false, paciente: "pacienteId",
                        fecha: firebase.Timestamp.fromDate(new Date("2026-04-23")),
                        probabilidad: 0.5, explicacion: [{ campo: "edad", contribucion: 0.2 }],
                        diagnosticoModelo: true, diagnosticoMedico: false,
                        comorbilidades: [], tos: true, wbc: 12300
                    },
                    {
                        id: "1fffffff-3ggg-4hhh-5iii-6jjjjjjjjjj2",
                        usuario: "jlasdo1212kl1jlasdo1212kl11",
                        otraEnfermedad: false, paciente: "pacienteId",
                        fecha: firebase.Timestamp.fromDate(new Date("2026-04-23")),
                        probabilidad: 0.5, explicacion: [{ campo: "edad", contribucion: 0.2 }],
                        diagnosticoModelo: true, diagnosticoMedico: false,
                        comorbilidades: [], tos: true, wbc: 12300
                    },
                    {
                        id: "1fffffff-3ggg-4hhh-5iii-6jjjjjjjjjj3",
                        usuario: "jlasdo1212kl1jlasdo1212kl12",
                        otraEnfermedad: false, paciente: "pacienteId",
                        fecha: firebase.Timestamp.fromDate(new Date("2026-04-23")),
                        probabilidad: 0.5, explicacion: [{ campo: "edad", contribucion: 0.2 }],
                        diagnosticoModelo: true, diagnosticoMedico: false,
                        comorbilidades: [], tos: true, wbc: 12300
                    }
                ]
            }
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test.each([
            ["180", mocks1, params1, res1],
            ["181", mocks2, params2, res2]
        ])("CP - %s", async (idPrueba, mocks, params, resEsperada) => {
            if (!params.cargarTodos) {
                verDiagnosticosPorMedico.mockResolvedValue(mocks.verDiagnosticosPorMedico);
            } else {
                verDiagnosticos.mockResolvedValue(mocks.verDiagnosticos);
            }

            const helper = new DiagnosticosHelper("token", {}, "es");
            const res = await helper.cargarDiagnosticos(params.cargarTodos, params.params);

            expect(res).toEqual(resEsperada);

            if (params.cargarTodos) {
                expect(verDiagnosticos).toHaveBeenCalledTimes(1);
                expect(verDiagnosticos).toHaveBeenCalledWith({});
                expect(verDiagnosticosPorMedico).not.toHaveBeenCalled();
            } else {
                expect(verDiagnosticosPorMedico).toHaveBeenCalledTimes(1);
                expect(verDiagnosticosPorMedico).toHaveBeenCalledWith(
                    params.params.uid, {}, expect.anything()
                );
                expect(verDiagnosticos).not.toHaveBeenCalled();
            }
        });
    });

    describe("Validar el método 'eliminarDiagnosticos'", () => {
        // ---------------------- Parámetros ----------------------
        const params = {
            id: [
                "1fffffff-3ggg-4hhh-5iii-6jjjjjjjjjj1",
                "1fffffff-3ggg-4hhh-5iii-6jjjjjjjjjj2"
            ], usuario: "jlasdo1212kl1jlasdo1212kl11",
            compuesto: [
                "1fffffff-3ggg-4hhh-5iii-6jjjjjjjjjj1-jlasdo1212kl1jlasdo1212kl11",
                "1fffffff-3ggg-4hhh-5iii-6jjjjjjjjjj2-jlasdo1212kl1jlasdo1212kl11"
            ]
        };

        // ---------------------- Respuestas esperadas ----------------------
        const res1 = { success: true, data: [] };
        const res2 = { success: false, error: "Error al eliminar" };

        // ---------------------- Mocks ----------------------
        const mock1 = jest.fn().mockResolvedValue({ success: true });
        const mock2 = jest.fn().mockResolvedValueOnce({ success: true }).
            mockResolvedValueOnce({ success: false, error: "Error al eliminar" });

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test.each([
            ["182", mock1, params, res1],
            ["183", mock2, params, res2]
        ])("CP - %s", async (idPrueba, mock, params, resEsperada) => {
            eliminarDiagnostico.mockImplementation(mock);
            verDiagnosticos.mockResolvedValue({ success: true, data: [] });

            const helper = new DiagnosticosHelper("token", {}, "es");
            const res = await helper.eliminarDiagnosticos(params.compuesto);

            expect(res).toEqual(resEsperada);
            expect(eliminarDiagnostico).toHaveBeenCalledTimes(params.id.length);
            for (let i = 0; i < params.id.length; i++) {
                expect(eliminarDiagnostico).toHaveBeenNthCalledWith(i + 1, params.id[i], params.usuario, {});
            }

            if (resEsperada.success) {
                expect(verDiagnosticos).toHaveBeenCalledTimes(1);
                expect(verDiagnosticos).toHaveBeenCalledWith({});
            } else {
                expect(verDiagnosticos).not.toHaveBeenCalled();
            }
        });
    });
});