import { jest, expect, beforeEach, describe } from "@jest/globals";

import { DRIVE_FOLDER_NAME, DRIVE_FILENAME } from "../../../../constants";

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
});