import { expect, describe, test, jest } from '@jest/globals';
import { codificarParamsURL, descargarArchivo, crearCargaResumible, crearArchivo, buscarArchivo, subirArchivoResumible } from '../../../src/services/Drive';

describe("Validar la función 'codificarParamsURL'", () => {
    test("CP - 34", () => {
        const params = "name='hola' and trashed=false and mimeType='application/vnd.google-apps.folder'";

        const res = codificarParamsURL(params);
        expect(res).toBe("name%3D%27hola%27%20and%20trashed%3Dfalse%20and%20mimeType%3D%27application%2Fvnd.google-apps.folder%27");
    });

    test("CP - 35", () => {
        const params = " ";

        const res = codificarParamsURL(params);
        expect(res).toBe("%20");
    });
});

describe("Validar la funcion 'descargarArchivo'", () => {
    test("CP - 36", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() =>
            Promise.resolve({
                ok: true, status: 200,
                arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
            })
        );
        const res = await descargarArchivo("archivo1", "token");
        expect(res).toEqual({ success: true, data: new ArrayBuffer(0), error: null });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "https://www.googleapis.com/drive/v3/files/archivo1?alt=media&source=downloadUrl", {
            method: "GET",
            headers: {
                Authorization: "Bearer token"
            }
        });
    });

    test("CP - 37", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() => {
            throw Error("Error de red");
        });
        const res = await descargarArchivo("archivo1", "token");
        expect(res).toEqual({ success: false, data: [], error: new Error("Error de red") });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "https://www.googleapis.com/drive/v3/files/archivo1?alt=media&source=downloadUrl", {
            method: "GET",
            headers: {
                Authorization: "Bearer token"
            }
        });
        expect(global.fetch).toThrow("Error de red");
    });

    test("CP - 38", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() => {
            return Promise.resolve({
                ok: true, status: 404,
                arrayBuffer: () => Promise.resolve(1),
                json: () => Promise.resolve({ error: { message: "File not found" } })
            })
        });
        const res = await descargarArchivo("archivo1", "token");
        expect(res).toEqual({ success: false, data: [], error: "Archivo no encontrado" });
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "https://www.googleapis.com/drive/v3/files/archivo1?alt=media&source=downloadUrl", {
            method: "GET",
            headers: {
                Authorization: "Bearer token"
            }
        });
    });
});

describe("Validar la funcion 'crearCargaResumible'", () => {
    test("CP - 39", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() =>
            Promise.resolve({
                ok: true, status: 200,
                headers: {
                    get: (x) => {
                        const headers = { "Location": "https://www.googleapis.com/upload/drive/v3/files/archivo1?uploadType=resumable&upload_id=xa298sd_sdlkj2" };                        
                        return headers[x];
                    }
                }
            })
        );
        const res = await crearCargaResumible("archivo1", "token");
        expect(res).toEqual({ success: true, data: "https://www.googleapis.com/upload/drive/v3/files/archivo1?uploadType=resumable&upload_id=xa298sd_sdlkj2", error: null });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "https://www.googleapis.com/upload/drive/v3/files/archivo1?uploadType=resumable", {
            method: "PATCH",
            headers: {
                Authorization: "Bearer token"
            }
        });
    });

    test("CP - 40", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() => {
            throw Error("Error de red");
        });
        const res = await crearCargaResumible("archivo1", "token");
        expect(res).toEqual({ success: false, data: [], error: new Error("Error de red") });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "https://www.googleapis.com/upload/drive/v3/files/archivo1?uploadType=resumable", {
            method: "PATCH",
            headers: {
                Authorization: "Bearer token"
            }
        });
        expect(global.fetch).toThrow("Error de red");
    });
});

describe("Validar la funcion 'crearArchivo'", () => {
    test("CP - 41", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() =>
            Promise.resolve({
                ok: true, status: 201,
                json: () => Promise.resolve({
                    id: "archivo1", name: "archivoPrueba",
                    kind: "drive#file", mimeType: "text/plain"
                })
            })
        );
        const res = await crearArchivo({
            name: "archivoPrueba", parents: ["root"]
        }, "token", false);

        expect(res).toEqual({
            success: true, data: {
                id: "archivo1", name: "archivoPrueba",
                kind: "drive#file", mimeType: "text/plain"
            }, error: null
        });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "https://www.googleapis.com/drive/v3/files", {
            method: "POST",
            headers: {
                Authorization: "Bearer token",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: "archivoPrueba", parents: ["root"] })
        });
    });

    test("CP - 42", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() =>
            Promise.resolve({
                ok: true, status: 201,
                json: () => Promise.resolve({
                    id: "carpeta1", name: "carpetaPrueba",
                    kind: "drive#folder", mimeType: "application/vnd.google-apps.folder"
                })
            })
        );
        const res = await crearArchivo({
            name: "carpetaPrueba", parents: ["root"]
        }, "token", true);

        expect(res).toEqual({
            success: true, data: {
                id: "carpeta1", name: "carpetaPrueba",
                kind: "drive#folder", mimeType: "application/vnd.google-apps.folder"
            }, error: null
        });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "https://www.googleapis.com/drive/v3/files", {
            method: "POST",
            headers: {
                Authorization: "Bearer token",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: "carpetaPrueba", parents: ["root"], mimeType: "application/vnd.google-apps.folder"
            })
        });
    });
    
    test("CP - 43", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() => {
            throw Error("Error de red");
        });
        const res = await crearArchivo({
            name: "archivoPrueba", parents: ["root"]
        }, "token", false);
        expect(res).toEqual({ success: false, data: [], error: new Error("Error de red") });
    
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "https://www.googleapis.com/drive/v3/files", {
            method: "POST",
            headers: {
                Authorization: "Bearer token",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: "archivoPrueba", parents: ["root"] })
        });
        expect(global.fetch).toThrow("Error de red");
    });

    test("CP - 44", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() =>
            Promise.resolve({
                ok: false, status: 403,
                json: () => Promise.resolve({
                    error: {
                        code: 403,
                        message: "Rate Limit Exceeded"
                    }
                })
            })
        );
        const res = await crearArchivo({
            name: "carpetaPrueba", parents: ["root"]
        }, "token", true);

        expect(res).toEqual({
            success: false, data: [], error: "Límite de peticiones alcanzado. Reintente en 1 minuto."
        });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "https://www.googleapis.com/drive/v3/files", {
            method: "POST",
            headers: {
                Authorization: "Bearer token",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: "carpetaPrueba", parents: ["root"], mimeType: "application/vnd.google-apps.folder"
            })
        });
    });
});

describe("Validar la funcion 'buscarArchivo'", () => {
    test("CP - 45", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() =>
            Promise.resolve({
                ok: true, status: 200,
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
            })
        );
        const res = await buscarArchivo(
            "name = 'archivo' and mimeType = 'application/vnd.google-apps.folder'", "token"
        );

        expect(res).toEqual({
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
            }, error: null
        });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "https://www.googleapis.com/drive/v3/files?q=name%20%3D%20%27archivo%27%20and%20mimeType%20%3D%20%27application%2Fvnd.google-apps.folder%27", {
            method: "GET",
            headers: {
                Authorization: "Bearer token"
            }
        });
    });

    test("CP - 46", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() =>
            Promise.resolve({
                ok: false, status: 401,
                json: () => Promise.resolve({
                    error: {
                        code: 401,
                        message: "Invalid Credentials"
                    }
                })
            })
        );
        const res = await buscarArchivo(
            "name = 'archivo' and mimeType = 'application/vnd.google-apps.folder'", "token"
        );

        expect(res).toEqual({
            success: false, data: [], error: "Credenciales inválidas, reintente nuevamente."
        });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "https://www.googleapis.com/drive/v3/files?q=name%20%3D%20%27archivo%27%20and%20mimeType%20%3D%20%27application%2Fvnd.google-apps.folder%27", {
            method: "GET",
            headers: {
                Authorization: "Bearer token"
            }
        });
    });

    test("CP - 47", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() => {
            throw Error("Error de red");
        });
        const res = await buscarArchivo(
            "name = 'archivo' and mimeType = 'application/vnd.google-apps.folder'", "token"
        );

        expect(res).toEqual({
            success: false, data: [], error: new Error("Error de red")
        });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "https://www.googleapis.com/drive/v3/files?q=name%20%3D%20%27archivo%27%20and%20mimeType%20%3D%20%27application%2Fvnd.google-apps.folder%27", {
            method: "GET",
            headers: {
                Authorization: "Bearer token"
            }
        });
        expect(global.fetch).toThrow("Error de red");
    });
});

describe("Validar la funcion 'subirArchivoResumible'", () => {
    test("CP - 48", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() =>
            Promise.resolve({
                ok: true, status: 201,
                json: () => Promise.resolve({
                    "kind": "drive#file",
                    "id": "1u_S79kGadapjqNwZmwrlT6JfkRJIzaqD",
                    "name": "archivito",
                    "mimeType": "application/vnd.google-apps.folder"
                })
            })
        );
        const res = await subirArchivoResumible(
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=xa298sd_sdlkj2",
            new Uint8Array(1), "token"
        );

        expect(res).toEqual({
            success: true, data: {
                "kind": "drive#file",
                "id": "1u_S79kGadapjqNwZmwrlT6JfkRJIzaqD",
                "name": "archivito",
                "mimeType": "application/vnd.google-apps.folder"
            }, error: null
        });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=xa298sd_sdlkj2", {
            method: "PUT",
            headers: {
                Authorization: "Bearer token",
                "Content-Type": "application/octet-stream",
                "Content-Length": 1
            },
            body: new Uint8Array(1)
        });
    });

    test("CP - 49", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() => 
            Promise.resolve({
                ok: false, status: 308,
                json: () => Promise.resolve({
                    error: {
                        code: 308,
                        message: "Resume Incomplete"
                    }
                })
            })
        );
        const res = await subirArchivoResumible(
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=xa298sd_sdlkj2",
            new Uint8Array(1), "token"
        );

        expect(res).toEqual({
            success: false, data: [], error: "Carga resumible incompleta"
        });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=xa298sd_sdlkj2", {
            method: "PUT",
            headers: {
                Authorization: "Bearer token",
                "Content-Type": "application/octet-stream",
                "Content-Length": 1
            },
            body: new Uint8Array(1)
        });
    });

    test("CP - 50", async () => {
        global.fetch = jest.fn();
        global.fetch.mockImplementation(() => {
            throw Error("Error de red");
        });
        const res = await subirArchivoResumible(
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=xa298sd_sdlkj2",
            new Uint8Array(1), "token"
        );

        expect(res).toEqual({
            success: false, data: [], error: new Error("Error de red")
        });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=xa298sd_sdlkj2", {
            method: "PUT",
            headers: {
                Authorization: "Bearer token",
                "Content-Type": "application/octet-stream",
                "Content-Length": 1
            },
            body: new Uint8Array(1)
        });
        expect(global.fetch).toThrow("Error de red");
    });
});