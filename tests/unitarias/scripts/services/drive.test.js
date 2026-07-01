import { expect, describe, test, jest, afterEach } from '@jest/globals';
import { descargarArchivo, crearArchivo, buscarArchivo, subirArchivo, clasificarError } from '../../../../src/services/Drive';
import { DRIVE_UPLOAD_API_URL, DRIVE_API_URL } from "../../../../src/constants";

describe("Validar la funcion 'descargarArchivo'", () => {
    // ------------------------ Mocks ------------------------
    const mock_1 = () => Promise.resolve({
        status: 200,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1)),
    });
    const mock2 = () => { throw Error("Error de red"); };
    const mock_3 = () => Promise.resolve({
        status: 404,
        arrayBuffer: () => Promise.resolve(1),
        json: () => Promise.resolve({ error: { message: "File not found" } })
    });

    // ------------------------ Respuestas esperadas ------------------------
    const res1 = { success: true, data: new ArrayBuffer(1) };
    const res2 = { success: false, error: new Error("Error de red") };
    const res3 = { success: false, error: "errArchivoInexistente" };

    afterEach(() => {
        jest.clearAllMocks();
    });

    test.each([
        ["36", mock_1, res1],
        ["37", mock2, res2],
        ["38", mock_3, res3]
    ])("CP - %s", async (idPrueba, mock, respuestaEsperada) => {
        global.fetch = jest.fn(mock);

        const res = await descargarArchivo("token", "archivo1");
        expect(res).toEqual(respuestaEsperada);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            `${DRIVE_API_URL}/files/archivo1?alt=media`, {
            method: "GET",
            headers: {
                Authorization: "Bearer token"
            }
        });
    });
});

describe("Validar la funcion 'crearArchivo'", () => {
    // ------------------------ Mocks ------------------------
    const mock1 = () => Promise.resolve({
        status: 201,
        json: () => Promise.resolve({
            id: "archivo1", name: "archivoPrueba",
            kind: "drive#file", mimeType: "text/plain"
        })
    });
    const mock2 = () => Promise.resolve({
        status: 201,
        json: () => Promise.resolve({
            id: "carpeta1", name: "carpetaPrueba",
            kind: "drive#folder", mimeType: "application/vnd.google-apps.folder"
        })
    });
    const mock3 = () => { throw Error("Error de red") };

    // ------------------------ Parámetros de prueba ------------------------
    const params1 = {
        cuerpoPet: { name: "archivoPrueba", parents: ["root"] },
        token: "token", esCarpeta: false
    };
    const params2 = {
        cuerpoPet: { name: "carpetaPrueba", parents: ["root"] },
        token: "token", esCarpeta: true
    };
    const params3 = {
        cuerpoPet: { name: "archivoPrueba", parents: ["root"] },
        token: "token", esCarpeta: false
    };

    // ------------------------ Respuestas esperadas ------------------------
    const res1 = {
        success: true, data: {
            id: "archivo1", name: "archivoPrueba",
            kind: "drive#file", mimeType: "text/plain"
        },
    }
    const res2 = {
        success: true, data: {
            id: "carpeta1", name: "carpetaPrueba",
            kind: "drive#folder", mimeType: "application/vnd.google-apps.folder"
        }
    };
    const res3 = { success: false, error: new Error("Error de red") };

    afterEach(() => {
        jest.clearAllMocks();
    })

    test.each([
        ["41", mock1, params1, res1],
        ["42", mock2, params2, res2],
        ["43", mock3, params3, res3]
    ])("CP - %s", async (idPrueba, mock, params, resEsperado) => {
        const { cuerpoPet, token, esCarpeta } = params;

        global.fetch = jest.fn(mock);
        const res = await crearArchivo(token, cuerpoPet, esCarpeta);

        expect(res).toEqual(resEsperado);
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            `${DRIVE_API_URL}/files`, {
            method: "POST",
            headers: {
                Authorization: "Bearer token",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(cuerpoPet)
        });
    });

});


describe("Validar la funcion 'buscarArchivo'", () => {
    // ------------------------ Mocks ------------------------
    const mock1 = () => Promise.resolve({
        status: 200,
        json: () => Promise.resolve({
            "files": [
                {
                    "kind": "drive#file",
                    "id": "1u_S79kGadapjqNwZmwrlT6JfkRJIzaqD",
                    "name": "archivito",
                    "mimeType": "application/vnd.google-apps.folder"
                },
            ],
            "kind": "drive#fileList",
            "incompleteSearch": false
        })
    });
    const mock2 = () => { throw Error("Error de red") };
    // ------------------------ Parámetros de prueba ------------------------
    const params1 = { query: "name = 'archivo' and mimeType = 'application/vnd.google-apps.folder'", token: "token" };

    // ------------------------ Respuestas esperadas ------------------------
    const res1 = {
        success: true, data: {
            "files": [
                {
                    "kind": "drive#file",
                    "id": "1u_S79kGadapjqNwZmwrlT6JfkRJIzaqD",
                    "name": "archivito",
                    "mimeType": "application/vnd.google-apps.folder"
                },
            ],
            "kind": "drive#fileList",
            "incompleteSearch": false
        }
    };
    const res2 = {
        success: false, error: new Error("Error de red")
    };

    const url1 = `${DRIVE_API_URL}/files?q=name+%3D+%27archivo%27+and+mimeType+%3D+%27application%2Fvnd.google-apps.folder%27`;

    afterEach(() => {
        jest.clearAllMocks();
    });

    test.each([
        ["45", mock1, params1, res1, url1],
        ["46", mock2, params1, res2, url1]
    ])("CP - %s", async (idPrueba, mock, params, resEsperado, urlEsperada) => {
        const { query, token } = params;

        global.fetch = jest.fn(mock);
        const toStringSpy = jest.spyOn(URLSearchParams.prototype, "toString");


        const res = await buscarArchivo(token, query);

        expect(res).toEqual(resEsperado);
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            urlEsperada, {
            method: "GET",
            headers: {
                Authorization: "Bearer token"
            }
        });
        expect(toStringSpy).toHaveBeenCalledTimes(1);
        expect(toStringSpy).toHaveReturnedWith(urlEsperada.split("?")[1]);
    });
});


describe("Validar la funcion 'subirArchivo'", () => {
    // ------------------------ Mocks ------------------------
    const mock1 = () => Promise.resolve({
        status: 201,
        json: () => Promise.resolve({
            "kind": "drive#file",
            "id": "1u_S79kGadapjqNwZmwrlT6JfkRJIzaqD",
            "name": "archivito",
            "mimeType": "application/vnd.google-apps.folder"
        })
    });
    const mock2 = () => { throw Error("Error de red") };

    // ------------------------ Parámetros de prueba ------------------------
    const params1 = { idArchivo: "asdojasd1212", body: new Uint8Array(1), token: "token" };
    const params2 = { idArchivo: "asdojasd1212", body: new Uint8Array(1), token: "token" };

    // ------------------------ Respuestas esperadas ------------------------
    const res1 = {
        success: true, data: {
            "kind": "drive#file",
            "id": "1u_S79kGadapjqNwZmwrlT6JfkRJIzaqD",
            "name": "archivito",
            "mimeType": "application/vnd.google-apps.folder"
        }
    };
    const res2 = { success: false, error: new Error("Error de red") };

    afterEach(() => {
        jest.clearAllMocks();
    });

    test.each([
        ["48", mock1, params1, res1],
        ["50", mock2, params2, res2]
    ])("CP - %s", async (idPrueba, mock, params, resEsperado) => {
        const { idArchivo, body, token } = params;

        global.fetch = jest.fn(mock);

        const res = await subirArchivo(token, idArchivo, body);

        expect(res).toEqual(resEsperado);
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            `${DRIVE_UPLOAD_API_URL}/files/${idArchivo}?uploadType=media`, {
            method: "PATCH",
            headers: {
                Authorization: "Bearer token",
                "Content-Type": "application/octet-stream",
                "Content-Length": 1
            },
            body: body
        });
    });
});

describe("Validar la función 'clasificarError'", () => {
    // ------------------------ Params ------------------------
    const params1 = { status: 200, content: { exitoso: true } };
    const params2 = { status: 404, content: { error: { message: "File not found" } } };
    const params3 = { status: 500, content: { error: { message: "Internal Server Error" } } };

    // ------------------------ Respuestas esperadas ------------------------
    const res1 = { success: true, data: { exitoso: true } };
    const res2 = { success: false, error: "errArchivoInexistente" };
    const res3 = { success: false, error: "500 " + JSON.stringify({ error: { message: "Internal Server Error" } }) };

    test.each([
        ["34", params1, res1],
        ["35", params2, res2],
        ["39", params3, res3]
    ])("CP - %s", (idPrueba, params, resEsperado) => {
        const { status, content } = params;

        const res = clasificarError(status, content);
        expect(res).toEqual(resEsperado);
    });
});