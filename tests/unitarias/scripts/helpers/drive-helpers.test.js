import { jest, expect, beforeEach, describe } from "@jest/globals";

import { DRIVE_FOLDER_NAME, DRIVE_FILENAME } from "../../../../constants";
import Paciente from "../../../../src/models/Paciente";

jest.unstable_mockModule("../../../../src/services/Drive", () => ({
    buscarArchivo: jest.fn(),
    crearArchivo: jest.fn(),
    descargarArchivo: jest.fn(),
    subirArchivo: jest.fn(),
}));

jest.unstable_mockModule("../../../../src/utils/XlsxFiles", () => ({
    crearArchivoXlsx: jest.fn(),
    leerArchivoXlsx: jest.fn(),
}));


const driveService = await import("../../../../src/services/Drive");
const xlsxFiles = await import("../../../../src/utils/XlsxFiles");
const ArchivoPacientes = (await import("../../../../src/models/ArchivoPacientes")).default;
const DriveHelper = (await import("../../../../src/helpers/drive-helper")).default;

describe("Pruebas para la clase 'DriveHelper'", () => {
    describe("Validar el método 'cancelarPeticiones'", () => {
        test("CP - 151", () => {
            driveService.buscarArchivo.mockImplementation(() => new Promise(() => { }));
            const spy = jest.spyOn(AbortController.prototype, "abort");
            const helper = new DriveHelper("token");

            helper.descargarArchivoPacientes();
            helper.operacionSobreArchivo("ver", { id: "archivoId" });
            helper.cancelarPeticiones();

            expect(spy).toHaveBeenCalledTimes(2);
        });
    });

    describe("Validar el método 'crearCopiaDiagnosticos'", () => {
        // -------------------- Parámetros ---------------------
        const params1 = {
            nombreArchivo: "nombreArchivo", datos: "datos", tipo: "xlsx"
        };

        // -------------------- Resultados esperados ---------------------
        const res1 = { success: true };
        const res2 = { success: false, error: "Error al crear carpeta" };

        // -------------------- Mocks ---------------------
        const mocks1 = {
            buscarArchivo: { success: true, data: { files: [{ id: "carpetaId" }] } },
            subirArchivo: { success: true },
            crearArchivo: { success: true, data: { id: "archivoId" } },
            crearArchivoXlsx: { success: true, data: [] }
        };

        const mocks2 = {
            buscarArchivo: { success: false, error: "No se encontró la carpeta" },
            subirArchivo: { success: true },
            crearArchivo: [
                { success: true, data: { id: "carpetaId" } },
                { success: true, data: { id: "archivoId" } }
            ],
            crearArchivoXlsx: { success: true, data: [] }
        };

        const mocks3 = {
            buscarArchivo: { success: false, error: "No se encontró la carpeta" },
            crearArchivo: { success: false, error: "Error al crear carpeta" }
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test.each([
            ["152", mocks1, params1, res1],
            ["153", mocks2, params1, res1],
            ["154", mocks3, params1, res2]
        ])("CP - %s", async (idPrueba, mocks, params, resEsperada) => {
            driveService.buscarArchivo.mockResolvedValue(mocks.buscarArchivo);
            driveService.subirArchivo.mockResolvedValue(mocks.subirArchivo);
            xlsxFiles.crearArchivoXlsx.mockReturnValue({ success: true, data: [] });

            if (Array.isArray(mocks.crearArchivo)) {
                driveService.crearArchivo.mockResolvedValueOnce(mocks.crearArchivo[0]).
                    mockResolvedValueOnce(mocks.crearArchivo[1]);
            } else {
                driveService.crearArchivo.mockResolvedValue(mocks.crearArchivo);
            }

            const helper = new DriveHelper("token");
            const res = await helper.crearCopiaDiagnosticos(params.nombreArchivo, params.datos, params.tipo);

            expect(res).toEqual(resEsperada);

            expect(driveService.buscarArchivo).toHaveBeenCalledTimes(1);
            expect(driveService.buscarArchivo).toHaveBeenCalledWith("token", `name='${DRIVE_FOLDER_NAME}' and trashed=false and mimeType='application/vnd.google-apps.folder'`, expect.any(AbortController));

            if (Array.isArray(mocks.crearArchivo) && resEsperada.success) {
                expect(driveService.crearArchivo).toHaveBeenCalledTimes(2);
                expect(driveService.crearArchivo).toHaveBeenNthCalledWith(1, "token", {
                    name: DRIVE_FOLDER_NAME,
                    mimeType: "application/vnd.google-apps.folder",
                    parents: []
                }, true, expect.any(AbortController));
                expect(driveService.crearArchivo).toHaveBeenLastCalledWith("token", {
                    name: "nombreArchivo",
                    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    parents: ["carpetaId"]
                }, false, expect.any(AbortController));
            } else if (resEsperada.success) {
                expect(driveService.crearArchivo).toHaveBeenCalledTimes(1);
                expect(driveService.crearArchivo).toHaveBeenCalledWith("token", {
                    name: "nombreArchivo",
                    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    parents: ["carpetaId"]
                }, false, expect.any(AbortController));
            }


            if (resEsperada.success) {
                expect(xlsxFiles.crearArchivoXlsx).toHaveBeenCalledTimes(1);
                expect(xlsxFiles.crearArchivoXlsx).toHaveBeenCalledWith("datos", "xlsx", "Datos");
                expect(driveService.subirArchivo).toHaveBeenCalledTimes(1);
                expect(driveService.subirArchivo).toHaveBeenCalledWith("token", "archivoId", [], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", expect.any(AbortController));
            } else {
                expect(xlsxFiles.crearArchivoXlsx).not.toHaveBeenCalled();
                expect(driveService.subirArchivo).not.toHaveBeenCalled();
            }
        });
    });

    describe("Validar el método 'descargarArchivoPacientes'", () => {
        // -------------------- Resultados esperados ---------------------
        const res1 = { success: true };
        const res2 = { success: false, error: "No se encontró el archivo" };

        // -------------------- Mocks ---------------------
        const mocks1 = {
            buscarArchivo: [{ success: true, data: { files: [{ id: "carpetaId" }] } }, { success: true, data: { files: [{ id: "archivoId" }] } }],
            descargarArchivo: { success: true, data: new Uint8Array([1, 2, 3]) },
            leerArchivoXlsx: {
                success: true, data: [{
                    id: "1", cedula: "1234567890", nombre: "Juan Pérez", sexo: 0, fechaNacimiento: "01-01-1990", telefono: "0987654321", fechaCreacion: "01-01-2023", otraEnfermedad: 0,
                    "Hipertensión arterial": 0, "VIH": 0, "Trombofilia": 0, "Enfermedad coronaria": 0,
                    "Enfermedad Cardíaca": 0, "Enfermedad renal": 0, "Enfermedad vascular": 0, "Enfermedad endocrina": 0,
                    "Diabetes": 0, "Enfermedad pulmonar": 0, "Hepatopatía crónica": 0, "Enfermedad hematológica": 0, "Enfermedad gastrointestinal": 0,
                    "Enfermedad urológica": 0, "Enfermedad neurológica": 0
                }]
            }
        };
        const mocks2 = {
            buscarArchivo: [{ success: true, data: { files: [{ id: "carpetaId" }] } }, { success: false, error: "No se encontró el archivo" }],
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test.each([
            ["155", mocks1, res1],
            ["156", mocks2, res2]
        ])("CP - %s", async (idPrueba, mocks, resEsperada) => {
            if (Array.isArray(mocks.buscarArchivo)) {
                driveService.buscarArchivo.mockResolvedValueOnce(mocks.buscarArchivo[0]).
                    mockResolvedValueOnce(mocks.buscarArchivo[1]);
            } else {
                driveService.buscarArchivo.mockResolvedValue(mocks.buscarArchivo);
            }

            driveService.descargarArchivo.mockResolvedValue(mocks.descargarArchivo);
            xlsxFiles.leerArchivoXlsx.mockReturnValue(mocks.leerArchivoXlsx)
            const res = await new DriveHelper("token").descargarArchivoPacientes();

            expect(res).toEqual(resEsperada);

            if (resEsperada.success) {
                expect(driveService.buscarArchivo).toHaveBeenCalledTimes(2);
                expect(driveService.buscarArchivo).toHaveBeenNthCalledWith(1, "token", `name='${DRIVE_FOLDER_NAME}' and trashed=false and mimeType='application/vnd.google-apps.folder'`, expect.any(AbortController));
                expect(driveService.buscarArchivo).toHaveBeenNthCalledWith(2, "token", `name='${DRIVE_FILENAME}' and trashed=false and mimeType!='application/vnd.google-apps.folder' and '${mocks.buscarArchivo[0].data.files[0].id}' in parents`, expect.any(AbortController));
                expect(driveService.descargarArchivo).toHaveBeenCalledTimes(1);
                expect(driveService.descargarArchivo).toHaveBeenCalledWith("token", "archivoId", expect.any(AbortController));
                expect(xlsxFiles.leerArchivoXlsx).toHaveBeenCalledTimes(1);
                expect(xlsxFiles.leerArchivoXlsx).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]), "Datos", "errLeerArchivo");
            } else {
                expect(driveService.buscarArchivo).toHaveBeenCalledTimes(2);
                expect(driveService.buscarArchivo).toHaveBeenNthCalledWith(1, "token", `name='${DRIVE_FOLDER_NAME}' and trashed=false and mimeType='application/vnd.google-apps.folder'`, expect.any(AbortController));
                expect(driveService.buscarArchivo).toHaveBeenNthCalledWith(2, "token", `name='${DRIVE_FILENAME}' and trashed=false and mimeType!='application/vnd.google-apps.folder' and '${mocks.buscarArchivo[0].data.files[0].id}' in parents`, expect.any(AbortController));
                expect(driveService.descargarArchivo).not.toHaveBeenCalled();
                expect(xlsxFiles.leerArchivoXlsx).not.toHaveBeenCalled();
            }
        });
    });

    describe("Validar el método 'operacionSobreArchivo'", () => {
        // -------------------- Parámetros ---------------------
        const params1 = { tipo: "añadir", params: { paciente: new Paciente("1", "1234567890", "Juan Pérez", 0, "01-01-1990", "0987654321", "01-01-2023", 0, ["Hipertensión arterial"]) } };
        const params2 = { tipo: "modificar", params: { id: "1234", paciente: new Paciente("1", "1234567890", "Juan Pérez", 0, "01-01-1990", "0987654321", "01-01-2023", 0, ["Hipertensión arterial"]) } };
        const params3 = { tipo: "eliminar", params: { id: "1234" } };
        const params4 = { tipo: "ver", params: { id: "1234" } };

        // -------------------- Resultados esperados ---------------------
        const res1 = { success: false, error: "Error al crear carpeta" };
        const res2 = { success: true };
        const res3 = { success: false, error: "errPacienteDuplicado" };
        const res4 = { success: false, error: "errPacienteInexistente" };
        const res5 = new Paciente("1", "1234567890", "Juan Pérez", 0, "01-01-1990", "0987654321", "01-01-2023", 0, ["Hipertensión arterial"]);

        // -------------------- Mocks ---------------------
        const mocks1 = {
            buscarArchivo: { success: false, error: "No se encontró la carpeta" },
            crearArchivo: { sucess: false, error: "Error al crear carpeta" }
        };
        const mocks2 = {
            buscarArchivo: [{ success: true, data: { files: [{ id: "carpetaId" }] } }, { success: true, data: { files: [{ id: "archivoId" }] } }],
            descargarArchivo: { success: true, data: new Uint8Array([1, 2, 3]) },
            leerArchivoXlsx: { success: true, data: [] },
            crearArchivoXlsx: { success: true, data: new Uint8Array([1, 2, 3]) },
            subirArchivo: () => Promise.resolve({ success: true }),
            archivoPacientes: { metodo: "anadirPaciente", implementacion: jest.fn() }
        };
        const mocks3 = {
            buscarArchivo: [{ success: true, data: { files: [{ id: "carpetaId" }] } }, { success: true, data: { files: [{ id: "archivoId" }] } }],
            descargarArchivo: { success: true, data: new Uint8Array([1, 2, 3]) },
            leerArchivoXlsx: { success: true, data: [] },
            crearArchivoXlsx: { success: true, data: new Uint8Array([1, 2, 3]) },
            subirArchivo: () => Promise.resolve({ success: true }),
            archivoPacientes: { metodo: "modificarPaciente", implementacion: jest.fn() }
        };
        const mocks4 = {
            buscarArchivo: [{ success: true, data: { files: [{ id: "carpetaId" }] } }, { success: true, data: { files: [{ id: "archivoId" }] } }],
            descargarArchivo: { success: true, data: new Uint8Array([1, 2, 3]) },
            leerArchivoXlsx: { success: true, data: [] },
            crearArchivoXlsx: { success: true, data: new Uint8Array([1, 2, 3]) },
            subirArchivo: () => Promise.resolve({ success: true }),
            archivoPacientes: { metodo: "eliminarPacientes", implementacion: jest.fn() }
        };
        const mocks5 = {
            buscarArchivo: [{ success: true, data: { files: [{ id: "carpetaId" }] } }, { success: true, data: { files: [{ id: "archivoId" }] } }],
            descargarArchivo: { success: true, data: new Uint8Array([1, 2, 3]) },
            leerArchivoXlsx: { success: true, data: [] },
            crearArchivoXlsx: { success: true, data: new Uint8Array([1, 2, 3]) },
            subirArchivo: () => Promise.resolve({ success: true }),
            archivoPacientes: { metodo: "verPaciente", implementacion: jest.fn(() => { return new Paciente("1", "1234567890", "Juan Pérez", 0, "01-01-1990", "0987654321", "01-01-2023", 0, ["Hipertensión arterial"]) }) }
        };
        const mocks6 = {
            buscarArchivo: [{ success: true, data: { files: [{ id: "carpetaId" }] } }, { success: true, data: { files: [{ id: "archivoId" }] } }],
            descargarArchivo: { success: true, data: new Uint8Array([1, 2, 3]) },
            leerArchivoXlsx: { success: true, data: [] },
            archivoPacientes: { metodo: "anadirPaciente", implementacion: jest.fn(() => { throw new Error("El paciente con cédula 1234567890 ya existe") }) }
        };
        const mocks7 = {
            buscarArchivo: [{ success: true, data: { files: [{ id: "carpetaId" }] } }, { success: true, data: { files: [{ id: "archivoId" }] } }],
            descargarArchivo: { success: true, data: new Uint8Array([1, 2, 3]) },
            leerArchivoXlsx: { success: true, data: [] },
            archivoPacientes: { metodo: "modificarPaciente", implementacion: jest.fn(() => { throw new Error("El paciente con id 123 no existe") }) }
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test.each([
            ["157", mocks1, params1, res1],
            ["158", mocks2, params1, res2],
            ["159", mocks3, params2, res2],
            ["160", mocks4, params3, res2],
            ["161", mocks5, params4, res5],
            ["162", mocks6, params1, res3],
            ["163", mocks7, params2, res4]
        ])("CP - %s", async (idPrueba, mocks, params, resEsperada) => {
            let spy;
            if (Array.isArray(mocks.buscarArchivo)) {
                driveService.buscarArchivo.mockResolvedValueOnce(mocks.buscarArchivo[0]).
                    mockResolvedValueOnce(mocks.buscarArchivo[1]);
            } else {
                driveService.buscarArchivo.mockResolvedValue(mocks.buscarArchivo);
                driveService.crearArchivo.mockResolvedValue(mocks.crearArchivo);
            }

            if (mocks.archivoPacientes) {
                spy = jest.spyOn(ArchivoPacientes.prototype, mocks.archivoPacientes.metodo).mockImplementation(mocks.archivoPacientes.implementacion);
            }

            driveService.descargarArchivo.mockResolvedValue(mocks.descargarArchivo);
            xlsxFiles.leerArchivoXlsx.mockReturnValue(mocks.leerArchivoXlsx);
            xlsxFiles.crearArchivoXlsx.mockReturnValue(mocks.crearArchivoXlsx);
            driveService.subirArchivo.mockImplementation(mocks.subirArchivo);

            const helper = new DriveHelper("token");
            const res = await helper.operacionSobreArchivo(params.tipo, params.params);

            expect(res).toEqual(resEsperada);

            if (resEsperada.success && mocks.archivoPacientes) {
                expect(driveService.descargarArchivo).toHaveBeenCalledTimes(1);
                expect(driveService.descargarArchivo).toHaveBeenCalledWith("token", "archivoId", expect.any(AbortController));
                expect(xlsxFiles.leerArchivoXlsx).toHaveBeenCalledTimes(1);
                expect(xlsxFiles.leerArchivoXlsx).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]), "Datos", "errLeerArchivo");
            }
            if (mocks.archivoPacientes) {
                expect(spy).toHaveBeenCalledTimes(1);
            }

            if (resEsperada.success && params.tipo != "ver") {
                expect(driveService.subirArchivo).toHaveBeenCalledTimes(1);
                expect(driveService.subirArchivo).toHaveBeenCalledWith("token", "archivoId", expect.any(Uint8Array), "application/octet-stream", expect.any(AbortController));
                expect(xlsxFiles.crearArchivoXlsx).toHaveBeenCalledTimes(1);
                expect(xlsxFiles.crearArchivoXlsx).toHaveBeenCalledWith(expect.any(Array), "xlsx", "Datos");
            } else if ((resEsperada.success && params.tipo == "ver") || !resEsperada.success) {
                expect(driveService.subirArchivo).not.toHaveBeenCalled();
                expect(xlsxFiles.crearArchivoXlsx).not.toHaveBeenCalled();
            }
        });
    });
});