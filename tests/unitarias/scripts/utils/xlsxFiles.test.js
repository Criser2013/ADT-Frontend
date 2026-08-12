import { jest, expect, describe, test, beforeEach } from '@jest/globals';

jest.unstable_mockModule("xlsx", () => ({
    utils: {
        json_to_sheet: jest.fn(),
        book_new: jest.fn(),
        sheet_to_csv: jest.fn(),
        sheet_to_json: jest.fn()
    },
    writeXLSX: jest.fn(),
    read: jest.fn(),
    writeFile: jest.fn()
}));

const xlsx = await import("xlsx");
const { leerArchivoXlsx, crearArchivoXlsx, validarXlsxPacientes, validarFilasXlsxPacientes, descargarArchivoXlsx } = await import("../../../../src/utils/XlsxFiles");

describe("Validar la funcion 'validarXlsxPacientes'", () => {
    // ------------------------- Parámetros -------------------------
    const params1 = [{
        cedula: 1230123, nombre: "Juan Nombre", sexo: 0, telefono: "1234567890", fechaNacimiento: "12-12-2025",
        "Enfermedad vascular": 0, "Trombofilia": 0, "Enfermedad renal": 0, "Enfermedad pulmonar": 0, "otraEnfermedad": 0,
        "Diabetes Mellitus": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0, "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
        "Enfermedad coronaria": 0, "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0,
        "Enfermedad neurológica": 0, fechaCreacion: "12-02-2023", id: "1f073994-d5df-6880-ad6e-7f6737152867"
    }];
    const params2 = [{
        cedula: "texto", nombre: "Juan", sexo: 0, telefono: "1234567890", fechaNacimiento: "12-12-2025",
        "Enfermedad vascular": 0, "Trombofilia": 0, "Enfermedad renal": 0, "Enfermedad pulmonar": 0, "otraEnfermedad": 0,
        "Diabetes Mellitus": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0, "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
        "Enfermedad coronaria": 0, "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0,
        "campo malo": 1, fechaCreacion: "2023-13-14"
    }];

    // ------------------------- Respuestas esperadas -------------------------
    const res1 = true;
    const res2 = false;

    test.each([
        ["25", params1, res1],
        ["26", params2, res2],
    ])("CP - %s", (idPrueba, params, resEsperada) => {
        const res = validarXlsxPacientes(params);
        expect(res).toEqual(resEsperada);
    });
});

describe("Validar la funcion 'validarFilasXlsxPacientes'", () => {
    // ------------------------- Parámetros -------------------------
    const params1 = [{
        cedula: 1230123, nombre: "Juan Nombre", sexo: 0, telefono: "1234567890", fechaNacimiento: "12-12-2025",
        "Enfermedad vascular": 0, "Trombofilia": 0, "Enfermedad renal": 0, "Enfermedad pulmonar": 0, "otraEnfermedad": 0,
        "Diabetes Mellitus": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0, "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
        "Enfermedad coronaria": 0, "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0,
        "Enfermedad neurológica": 0, fechaCreacion: "12-02-2023", id: "1f073994-d5df-6880-ad6e-7f6737152867"
    }];
    const params2 = [{
        cedula: 1230123, nombre: "Juan", sexo: 2, telefono: "1234567890", fechaNacimiento: "12-12-2025",
        "Enfermedad vascular": 0, "Trombofilia": 0, "Enfermedad renal": 0, "Enfermedad pulmonar": 0, "otraEnfermedad": 0,
        "Diabetes Mellitus": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0, "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
        "Enfermedad coronaria": 0, "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0,
        "Enfermedad neurológica": 0, fechaCreacion: "12-02-2023"
    }];

    // ------------------------- Respuestas esperadas -------------------------
    const res1 = true;
    const res2 = false;

    test.each([
        ["27", params1, res1],
        ["28", params2, res2],
    ])("CP - %s", (idPrueba, params, resEsperada) => {
        const res = validarFilasXlsxPacientes(params);
        expect(res).toEqual(resEsperada);
    });
});

describe("Validar la funcion 'crearArchivoXlsx'", () => {
    // ------------------------- Parámetros -------------------------
    const params1 = {
        datos: [{
            cedula: 1230123, nombre: "Juan Nombre", sexo: 0, telefono: "1234567890", fechaNacimiento: "20-10-2025",
            "Enfermedad vascular": 6, "Trombofilia": 7, "Enfermedad renal": 3, "Enfermedad pulmonar": 10,
            "Diabetes": 2, "Hipertensión arterial": 8, "Hepatopatía crónica": 4, "Enfermedad hematológica": 7, "VIH": 6, "Enfermedad cardíaca": 4,
            "Enfermedad coronaria": 67, "Enfermedad endocrina": 9, "Enfermedad gastrointestinal": 9, "Enfermedad urológica": 8
        }],
        nombreHoja: "Datos", tipo: "xlsx"
    };
    const params2 = {
        datos: [{
            cedula: 1230123, nombre: "Juan Nombre", sexo: 0, telefono: "1234567890", fechaNacimiento: "20-10-2025",
            "Enfermedad vascular": 6, "Trombofilia": 7, "Enfermedad renal": 3, "Enfermedad pulmonar": 10,
            "Diabetes": 2, "Hipertensión arterial": 8, "Hepatopatía crónica": 4, "Enfermedad hematológica": 7, "VIH": 6, "Enfermedad cardíaca": 4,
            "Enfermedad coronaria": 67, "Enfermedad endocrina": 9, "Enfermedad gastrointestinal": 9, "Enfermedad urológica": 8
        }],
        nombreHoja: "Datos", tipo: "csv"
    };

    // ------------------------- Respuestas esperadas -------------------------
    const res1 = {
        success: true,
        data: {
            type: "buffer",
            fileType: "xlsx",
            options: { bookType: "xlsx", cellDates: true, type: "buffer" },
            data: { Sheets: { "Datos": { sheetName: "Datos", data: params1.datos } }, SheetNames: ["Datos"] }
        }
    };
    const res2 = {
        success: true,
        data: {
            type: "text",
            fileType: "csv",
            options: { bookType: "csv", cellDates: true, type: "string" },
            data: params2.datos.map(row => Object.values(row).join(",")).join("\n")
        }
    };
    const res3 = { success: false, error: new Error("Error en json_to_sheet") };

    // ------------------------- Mocks -------------------------
    const mock1 = (x) => ({
        sheetName: "Datos",
        data: x
    })
    const mock2 = (x) => { throw new Error("Error en json_to_sheet") };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    test.each([
        ["29", mock1, params1, res1],
        ["30", mock1, params2, res2],
        ["31", mock2, params1, res3]
    ])("CP - %s", (idPrueba, mock, params, resEsperada) => {
        const { datos, nombreHoja, tipo } = params;

        xlsx.utils.json_to_sheet.mockImplementation(mock);
        xlsx.utils.book_new.mockImplementation((sheet, nombreHoja) => ({
            Sheets: { [nombreHoja]: sheet },
            SheetNames: [nombreHoja]
        }));
        xlsx.utils.sheet_to_csv.mockImplementation((hoja, opciones) => ({
            type: "text",
            fileType: "csv",
            options: opciones,
            data: hoja.data.map(row => Object.values(row).join(",")).join("\n")
        }));
        xlsx.writeXLSX.mockImplementation((workbook, opciones) => ({
            type: "buffer",
            fileType: "xlsx",
            options: opciones,
            data: workbook
        }));

        const res = crearArchivoXlsx(datos, tipo, nombreHoja);

        expect(res).toEqual(resEsperada);
        expect(xlsx.utils.json_to_sheet).toHaveBeenCalledWith(datos);
        expect(xlsx.utils.json_to_sheet).toHaveBeenCalledTimes(1);

        if (res.success) {
            expect(xlsx.utils.book_new).toHaveBeenCalledWith(expect.any(Object), nombreHoja);
            expect(xlsx.utils.book_new).toHaveBeenCalledTimes(1);
            expect(tipo == "xlsx" ? xlsx.writeXLSX : xlsx.utils.sheet_to_csv).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ bookType: tipo, cellDates: true }));
            expect(tipo == "xlsx" ? xlsx.writeXLSX : xlsx.utils.sheet_to_csv).toHaveBeenCalledTimes(1);
        }
    });
});

describe("Validar la funcion 'descargarArchivoXlsx'", () => {
    // ------------------------- Parámetros -------------------------
    const params1 = {
        datos: [{
            cedula: 1230123, nombre: "Juan Nombre", sexo: 0, telefono: "1234567890", fechaNacimiento: "20-10-2025",
            "Enfermedad vascular": 6, "Trombofilia": 7, "Enfermedad renal": 3, "Enfermedad pulmonar": 10,
            "Diabetes": 2, "Hipertensión arterial": 8, "Hepatopatía crónica": 4, "Enfermedad hematológica": 7, "VIH": 6, "Enfermedad cardíaca": 4,
            "Enfermedad coronaria": 67, "Enfermedad endocrina": 9, "Enfermedad gastrointestinal": 9, "Enfermedad urológica": 8
        }],
        nombreHoja: "Datos", tipo: "xlsx", nombreArchivo: "pacientes"
    };
    const params2 = {
        datos: [{
            cedula: 1230123, nombre: "Juan Nombre", sexo: 0, telefono: "1234567890", fechaNacimiento: "20-10-2025",
            "Enfermedad vascular": 6, "Trombofilia": 7, "Enfermedad renal": 3, "Enfermedad pulmonar": 10,
            "Diabetes": 2, "Hipertensión arterial": 8, "Hepatopatía crónica": 4, "Enfermedad hematológica": 7, "VIH": 6, "Enfermedad cardíaca": 4,
            "Enfermedad coronaria": 67, "Enfermedad endocrina": 9, "Enfermedad gastrointestinal": 9, "Enfermedad urológica": 8
        }],
        nombreHoja: "Datos", tipo: "csv", nombreArchivo: "pacientes"
    };

    // ------------------------- Respuestas esperadas -------------------------
    const res1 = { success: true };
    const res2 = { success: false, error: new Error("Error en json_to_sheet") };

    // ------------------------- Mocks -------------------------
    const mock1 = (x) => ({
        sheetName: "Datos",
        data: x
    })
    const mock2 = (x) => { throw new Error("Error en json_to_sheet") };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    test.each([
        ["32", mock1, params1, res1],
        ["33", mock2, params2, res2],
    ])("CP - %s", (idPrueba, mock, params, resEsperada) => {
        const { datos, nombreArchivo, nombreHoja, tipo } = params;

        xlsx.utils.json_to_sheet.mockImplementation(mock);
        xlsx.utils.book_new.mockImplementation((sheet, nombreHoja) => ({
            Sheets: { [nombreHoja]: sheet },
            SheetNames: [nombreHoja]
        }));

        xlsx.writeFile.mockReturnValue(true);

        const res = descargarArchivoXlsx(datos, tipo, nombreArchivo, nombreHoja);

        expect(res).toEqual(resEsperada);
        expect(xlsx.utils.json_to_sheet).toHaveBeenCalledWith(datos);
        expect(xlsx.utils.json_to_sheet).toHaveBeenCalledTimes(1);

        if (res.success) {
            expect(xlsx.utils.book_new).toHaveBeenCalledWith(expect.any(Object), nombreHoja);
            expect(xlsx.utils.book_new).toHaveBeenCalledTimes(1);
            expect(xlsx.writeFile).toHaveBeenCalledWith(
                expect.any(Object), `${nombreArchivo}.${tipo}`,
                { bookType: tipo, cellDates: true, compression: true }
            );
            expect(xlsx.writeFile).toHaveBeenCalledTimes(1);
        }
    });
});

describe("Validar la funcion 'leerArchivoXlsx'", () => {
    // ------------------------- Parámetros -------------------------
    const params1 = {
        archivo: new ArrayBuffer(8),
        nombreHoja: "Datos", txtErrorLectura: "Error de lectura"
    };

    // ------------------------- Respuestas esperadas -------------------------
    const res1 = {
        success: true,
        data: [{
            cedula: 1230123, nombre: "Juan Nombre", sexo: 0, telefono: "1234567890", fechaNacimiento: "12-12-2025",
            "Enfermedad vascular": 0, "Trombofilia": 0, "Enfermedad renal": 0, "Enfermedad pulmonar": 0, "otraEnfermedad": 0,
            "Diabetes Mellitus": 0, "Hipertensión arterial": 0, "Hepatopatía crónica": 0, "Enfermedad hematológica": 0, "VIH": 0, "Enfermedad cardíaca": 0,
            "Enfermedad coronaria": 0, "Enfermedad endocrina": 0, "Enfermedad gastrointestinal": 0, "Enfermedad urológica": 0,
            "Enfermedad neurológica": 0, fechaCreacion: "12-02-2023", id: "1f073994-d5df-6880-ad6e-7f6737152867"
        }]
    };
    const res2 = { success: true, data: [] };
    const res3 = { success: false, error: new Error("Error en json_to_sheet") };
    const res4 = { success: false, error:"Error de lectura" };

    // ------------------------- Mocks -------------------------
    const mock1 = () => res1.data;
    const mock2 = () => [];
    const mock3 = () => { throw new Error("Error en json_to_sheet") };
    const mock4 = () => [{ campoMalo: "valor" }];

    beforeEach(() => {
        jest.resetAllMocks();
    });

    test.each([
        ["40", mock1, params1, res1],
        ["44", mock2, params1, res2],
        ["47", mock3, params1, res3],
        ["49", mock4, params1, res4],
    ])("CP - %s", (idPrueba, mock, params, resEsperada) => {
        const { archivo, nombreHoja, txtErrorLectura } = params;

        xlsx.read.mockImplementation(() => ({ Sheets: { [nombreHoja]: {} } }));
        xlsx.utils.sheet_to_json.mockImplementation(mock);

        const res = leerArchivoXlsx(archivo, nombreHoja, txtErrorLectura);

        expect(res).toEqual(resEsperada);
        expect(xlsx.read).toHaveBeenCalledWith(archivo, { type: "buffer" });
        expect(xlsx.read).toHaveBeenCalledTimes(1);
        expect(xlsx.utils.sheet_to_json).toHaveBeenCalledTimes(1);
    });
});