import { jest, expect, beforeEach, describe } from "@jest/globals";

jest.unstable_mockModule("../../../../src/services/Drive",() => ({
    buscarArchivo: jest.fn(),
    crearArchivo: jest.fn(),
    descargarArchivo: jest.fn(),
    subirArchivo: jest.fn(),
}));

jest.unstable_mockModule("../../../../src/utils/xlsxFiles", () => ({
    crearArchivoXlsx: jest.fn(),
    leerArchivoXlsx: jest.fn(),
}));

const driveService = await import("../../../../src/services/Drive");
const xlsxFiles = await import("../../../../src/utils/xlsxFiles");

const DriveHelper = (await import("../../../../src/helpers/drive-helper")).default;

describe("Validar el método 'cancelarPeticiones'", () => {
    test("CP - 151", () => {
        driveService.buscarArchivo.mockImplementation(() => new Promise(() => {}));
        const spy = jest.spyOn(AbortController.prototype, "abort");
        const helper = new DriveHelper("token");

        helper.descargarArchivoPacientes();
        helper.operacionSobreArchivo("ver", { id: "archivoId" });
        helper.cancelarPeticiones();

        expect(spy).toHaveBeenCalledTimes(2);
    });
});