import { jest, expect, beforeEach, describe } from "@jest/globals";

import { DRIVE_FOLDER_NAME } from "../../../../constants";

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

        // ------------------------------- Mocks ---------------------------
        const mock1 = {
            buscarArchivo: { success: true, data: { id: "carpetaId" } },
            subirArchivo: { success: true, data: { id: "archivoId" } },
            crearArchivo: { cant: 1, mocks: [{ success: true, data: { id: "archivoId" } }] },
            crearArchivoXlsx: { success: true, data: [] }
        };

        const mock2 = {
            buscarArchivo: { success: false, error: "No se encontró la carpeta" },
            subirArchivo: { success: true, data: { id: "archivoId" } },
            crearArchivo: { cant: 1, mocks: [{ success: true, data: { id: "carpetaId" } }, { success: true, error: "Error al crear archivo" }] },
            crearArchivoXlsx: { success: true, data: [] }
        };

        const res2 = { success: false, error: "errLimPeticiones" };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test("CP - 152", async () => {
            driveService.buscarArchivo.mockResolvedValue({ success: true, data: { files: [{ id: "carpetaId" }] } });
            driveService.subirArchivo.mockResolvedValue({ success: true });
            driveService.crearArchivo.mockResolvedValue({ success: true, data: { id: "archivoId" } });
            xlsxFiles.crearArchivoXlsx.mockReturnValue({ success: true, data: [] });

            const helper = new DriveHelper("token");
            const res = await helper.crearCopiaDiagnosticos("nombreArchivo", "datos", "xlsx");

            expect(res).toEqual({ success: true });

            expect(driveService.buscarArchivo).toHaveBeenCalledTimes(1);
            expect(driveService.buscarArchivo).toHaveBeenCalledWith("token",`name='${DRIVE_FOLDER_NAME}' and trashed=false and mimeType='application/vnd.google-apps.folder'`, expect.any(AbortController));

            expect(driveService.subirArchivo).toHaveBeenCalledTimes(1);
            expect(driveService.subirArchivo).toHaveBeenCalledWith("token", "archivoId", [], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", expect.any(AbortController));

            expect(driveService.crearArchivo).toHaveBeenCalledTimes(1);
            expect(driveService.crearArchivo).toHaveBeenCalledWith("token", {
                name: "nombreArchivo",
                mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                parents: ["carpetaId"]
            }, false, expect.any(AbortController));

            expect(xlsxFiles.crearArchivoXlsx).toHaveBeenCalledTimes(1);
            expect(xlsxFiles.crearArchivoXlsx).toHaveBeenCalledWith("datos", "xlsx", "Datos");
        });
/*
        test.each([
            ["152", mock1, params, res1],
            ["153", mock2, params, res1],
            ["154", mock2, params, res2]
        ])("CP - %s", async (idPrueba, mocks, params, resEsperada) => {

            driveService.buscarArchivo.mockResolvedValue(mocks.buscarArchivo);
            driveService.subirArchivo.mockResolvedValue(mocks.subirArchivo);
            driveService.crearArchivo.mockResolvedValue({ success: true, data: { id: "archivoId" } });


            if (mocks.crearArchivo.cant == 1) {
                driveService.crearArchivo.mockResolvedValue(mocks.crearArchivo.mocks[0]);
            } else {
                driveService.crearArchivo.mockResolvedValueOnce(mocks.crearArchivo.mocks[0]);
                driveService.crearArchivo.mockResolvedValueOnce(mocks.crearArchivo.mocks[1]);
            }

            xlsxFiles.crearArchivoXlsx.mockResolvedValue(mocks.crearArchivoXlsx);

            const helper = new DriveHelper("token");
            const res = await helper.crearCopiaDiagnosticos("nombreArchivo", "datos", "xlsx");

            expect(res).toEqual(mocks.subirArchivo);

            expect(driveService.buscarArchivo).toHaveBeenCalledTimes(1);
            expect(driveService.buscarArchivo).toHaveBeenCalledWith();

            expect(driveService.subirArchivo).toHaveBeenCalledTimes(1);
            expect(driveService.subirArchivo).toHaveBeenCalledWith("token", "archivoId", "application/octet-stream");

            if (mocks.crearArchivo.cant == 1 && mocks.crearArchivo.mocks[0].success) {
                expect(driveService.crearArchivo).toHaveBeenCalledTimes(2);
                expect(driveService.crearArchivo).toHaveBeenCalledWith("token", {
                    name: "nombreArchivo",
                    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    parents: ["carpetaId"]
                }, false, expect.any(AbortController));

                expect(xlsxFiles.crearArchivoXlsx).toHaveBeenCalledTimes(1);
                expect(xlsxFiles.crearArchivoXlsx).toHaveBeenCalledWith("datos", "xlsx", "Datos");
            } else if (mocks.crearArchivo.cant == 1 && !mocks.crearArchivo.mocks[0].success) {
                expect(driveService.crearArchivo).toHaveBeenCalledTimes(1);
                expect(driveService.crearArchivo).toHaveBeenCalledWith("token", {
                    name: DRIVE_FOLDER_NAME,
                    mimeType: "application/vnd.google-apps.folder",
                    parents: []
                }, true, expect.any(AbortController));
            } else {
                expect(driveService.crearArchivo).toHaveBeenCalledTimes(2);
                expect(driveService.crearArchivo).toHaveBeenNthCalledWith(1, "token", {
                    name: DRIVE_FOLDER_NAME,
                    mimeType: "application/vnd.google-apps.folder",
                    parents: []
                }, true, expect.any(AbortController));
                expect(driveService.crearArchivo).toHaveBeenNthCalledWith(2, "token", {
                    name: "nombreArchivo",
                    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    parents: ["carpetaId"]
                }, false, expect.any(AbortController));

                expect(xlsxFiles.crearArchivoXlsx).toHaveBeenCalledTimes(1);
                expect(xlsxFiles.crearArchivoXlsx).toHaveBeenCalledWith("datos", "xlsx", "Datos");
            }

            if (resEsperada.success) {
                expect(driveService.subirArchivo).toHaveBeenCalledTimes(1);
                expect(driveService.subirArchivo).toHaveBeenCalledWith("token", "archivoId", "application/octet-stream");
            } else {
                expect(driveService.subirArchivo).not.toHaveBeenCalled();
            }
        });*/
    });
});