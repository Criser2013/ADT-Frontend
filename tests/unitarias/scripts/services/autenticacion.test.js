import { jest, beforeEach, afterAll, expect, describe, test } from '@jest/globals';
import { AES_KEY } from '../../../../constants';

const mockSetDefaultLanguage = jest.fn();
const mockAddScope = jest.fn();

const mockProviderInstance = {
    setDefaultLanguage: mockSetDefaultLanguage,
    addScope: mockAddScope
};

const GoogleAuthProvider = jest.fn(() => mockProviderInstance);

GoogleAuthProvider.credentialFromResult = jest.fn();

jest.unstable_mockModule("firebase/auth", () => ({
    signInWithPopup: jest.fn(),
    reauthenticateWithPopup: jest.fn(),
    GoogleAuthProvider,
    signOut: jest.fn()
}));

jest.unstable_mockModule("crypto-js", () => ({
    AES: {
        encrypt: jest.fn(() => ({ toString: jest.fn().mockReturnValue("encryptedData") })),
        decrypt: jest.fn(() => ({ toString: jest.fn().mockReturnValue("decryptedData") }))
    },
    enc: { Utf8: { stringify: jest.fn() } }
}));

jest.unstable_mockModule("i18next", () => ({
    default: jest.fn()
}));

const firebaseAuth = await import("firebase/auth");
const { AES, enc } = await import("crypto-js");
const i18n = await import("i18next");

const { manejadorErroresAuth, guardarCredsOAuth, borrarCredsOAuth, cargarCredsOAuth, verRolUsuario, registrarUsuario, cerrarSesion, iniciarSesionGoogle } = await import('../../../../src/services/Autenticacion');

describe("Validar la funcion 'manejadorErroresAuth", () => {
    // ------------------------- Parámetros ---------------------------
    const params1 = { code: "auth/popup-closed-by-user" };
    const params2 = { code: "auth/user-cancelled" };
    const params3 = { code: "auth/user-mismatch" };
    const params4 = { code: "auth/user-disabled" };
    const params5 = { code: "errIniciarSesion" };

    let replaceSpy;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each([
        ["104", "/", params1, undefined, false],
        ["105", "/diagnostico", params1, undefined, true],
        ["106", "/diagnostico", params2, "errPermisos", false],
        ["107", "/diagnostico", params3, "errSesionIniciada", false],
        ["108", "/diagnostico", params4, "errUsuarioBaneado", false],
        ["109", "/diagnostico", params5, "errIniciarSesion", false]
    ])(
        "CP - %s",
        (idPrueba, pathname, params, resEsperada, debeRedirigir) => {
            const mockLocation = {
                pathname: pathname,
                replace: jest.fn()
            };

            const res = manejadorErroresAuth(params, mockLocation);

            expect(res).toBe(resEsperada);

            if (debeRedirigir) {
                expect(mockLocation.replace).toHaveBeenCalledWith("/");
            } else {
                expect(mockLocation.replace).not.toHaveBeenCalled();
            }
        }
    );
});

describe("Validar la funcion 'guardarCredsOAuth", () => {
    test("CP - 110", () => {
        const params = {
            accessToken: "token",
            expires: 3600,
            scopesDrive: ["scope1", "scope2"]
        };

        jest.spyOn(Storage.prototype, "setItem").mockImplementation(jest.fn());

        const res = guardarCredsOAuth(params);

        expect(AES.encrypt).toBeCalledTimes(1);
        expect(AES.encrypt).toHaveBeenCalledWith(JSON.stringify(params), AES_KEY);
        expect(sessionStorage.setItem).toHaveBeenCalledTimes(1);
        expect(sessionStorage.setItem).toHaveBeenCalledWith("session-tokens", "encryptedData")

        jest.spyOn(Storage.prototype, "setItem").mockRestore();
    });
});

describe("Validar la función 'borrarCredsOAuth'", () => {
    test("CP - 111", () => {
        jest.spyOn(Storage.prototype, "removeItem").mockImplementation(jest.fn());
        const res = borrarCredsOAuth();

        expect(sessionStorage.removeItem).toHaveBeenCalledTimes(3);
        expect(sessionStorage.removeItem).toHaveBeenCalledWith("session-tokens");
        expect(sessionStorage.removeItem).toHaveBeenCalledWith("modo-usuario");
        expect(sessionStorage.removeItem).toHaveBeenCalledWith("ejecutar-callback");

        jest.spyOn(Storage.prototype, "removeItem").mockRestore();
    });
});

describe("Validar la función 'cargarCredencialesOAuth'", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.spyOn(Storage.prototype, "getItem").mockRestore();
        jest.spyOn(AES, "decrypt").mockRestore();
        jest.spyOn(enc.Utf8, "stringify").mockRestore();
        jest.spyOn(JSON, "parse").mockRestore();
    });

    test.each([
        ["112", "datosEncriptados", { success: true, expires: 3600, accessToken: "token", permisos: ["scope1", "scope2"] }],
        ["113", null, { success: false }]
    ])("CP - %s", (idPrueba, valores, resEsperada) => {
        jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => valores);
        jest.spyOn(JSON, "parse").mockImplementation(() => ({ expires: 3600, accessToken: "token", scopesDrive: ["scope1", "scope2"] }));

        const res = cargarCredsOAuth();

        expect(res).toEqual(resEsperada);

        expect(sessionStorage.getItem).toHaveBeenCalledTimes(1);
        expect(sessionStorage.getItem).toHaveBeenCalledWith("session-tokens");

        if (valores === null) {
            expect(AES.decrypt).not.toHaveBeenCalled();
            expect(enc.Utf8.stringify).not.toHaveBeenCalled();
            expect(JSON.parse).not.toHaveBeenCalled();
        } else {
            expect(AES.decrypt).toHaveBeenCalledTimes(1);
            expect(AES.decrypt).toHaveBeenCalledWith(valores, AES_KEY);
            expect(JSON.parse).toHaveBeenCalledTimes(1);
            expect(JSON.parse).toHaveBeenCalledWith("decryptedData");
        }
    });
});

describe("Validar la función 'verRolUsuario'", () => {
    test("CP - 114", async () => {
        const res = await verRolUsuario({ nombre: "usuario", getIdTokenResult: jest.fn().mockResolvedValue({ claims: { admin: true } }) });

        expect(res).toBe(true);
    });
});

describe("Validar la función 'registrarUsuario'", () => {
    // -------------------------- Parámetros ---------------------------
    const params1 = { metadata: { createdAt: "2024-01-01", lastLoginAt: "2024-01-02" } }
    const params2 = { uid: "123", metadata: { createdAt: "2024-01-01", lastLoginAt: "2024-01-01" } };

    // -------------------------- Resultado esperado ---------------------------
    const res = { success: true };

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    test.each([
        ["115", null, params1, res],
        ["116", res, params2, res]
    ])("CP - %s", async (idPrueba, mock, param, resEsperada) => {
        global.fetch.mockResolvedValueOnce({ json: () => Promise.resolve(mock), ok: true });
        const res = await registrarUsuario(param, "es");

        expect(res).toEqual(resEsperada);

        if (!mock) {
            expect(global.fetch).not.toHaveBeenCalled();
        } else {
            expect(global.fetch).toHaveBeenCalled();
        }
    });
});

describe("Validar la función 'cerrarSesion'", () => {
    // -------------------------- Parámetros ---------------------------
    const params1 = { firebase: "firebase", tareaRefresco: 1 };
    const params2 = { firebase: "firebase", tareaRefresco: null };

    // -------------------------- Resultado esperado ---------------------------
    const res1 = { success: true };
    const res2 = { success: false, error: "errCerrarSesion" };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each([
        ["117", params1, res1, false],
        ["118", params2, res1, false],
        ["119", params1, res2, true]
    ])("CP - %s", async (idPrueba, params, resEsperada, lanzaExcepcion) => {

        if (lanzaExcepcion) {
            firebaseAuth.signOut.mockImplementation(() => { throw new Error("Error al cerrar sesión") });
        } else {
            firebaseAuth.signOut.mockResolvedValue(true);
        }

        const res = await cerrarSesion(params.firebase, params.tareaRefresco);

        expect(res).toEqual(resEsperada);

        expect(firebaseAuth.signOut).toHaveBeenCalledTimes(1);
        expect(firebaseAuth.signOut).toHaveBeenCalledWith(params.firebase);
    });
});

describe("Validar la función 'iniciarSesionGoogle'", () => {
    // -------------------------- Parámetros ---------------------------
    const params1 = { firebaseAuth: "firebase", permisos: ["scope1", "scope2"], usuario: null };
    const params2 = { firebaseAuth: "firebase", permisos: ["scope1", "scope2"], usuario: { uid: "123" } };

    // -------------------------- Respuestas esperadas ---------------------------
    const res1 = {
        success: true, res: {
            user: { uid: "123" }, _tokenResponse: {
                oauthExpireIn: 2,
                rawUserInfo: JSON.stringify({
                    granted_scopes: ["scope1", "scope2"]
                })
            }
        }, user: { uid: "123" }, credencialOAuth: {
            _tokenResponse: {
                oauthExpireIn: 2,
                rawUserInfo: JSON.stringify({
                    granted_scopes: ["scope1", "scope2"]
                }),
            },
            expires: "3000",
            scopesDrive: ["scope1", "scope2"]
        }
    }
    const res2 = { success: false, error: "errIniciarSesion" };

    // -------------------------- Mocks ---------------------------
    const mockProvider = () => ({
        _tokenResponse: {
            oauthExpireIn: 2,
            rawUserInfo: JSON.stringify({ granted_scopes: ["scope1", "scope2"] })
        }
    });

    const mockLogin1 = () => Promise.resolve({
        user: { uid: "123" },
        _tokenResponse: {
            oauthExpireIn: 2,
            rawUserInfo: JSON.stringify({
                granted_scopes: ["scope1", "scope2"]
            })
        }
    });
    const mockLogin2 = () => Promise.reject(new Error("Error al iniciar sesión"));


    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Date, "now").mockImplementation(() => 1000);
    });

    test.each([
        ["120", mockProvider, mockLogin1, params1, res1, false],
        ["121", mockProvider, mockLogin1, params2, res1, false],
        ["122", mockProvider, mockLogin2, params1, res2, true]
    ])("CP - %s", async (idPrueba, mockProvider, mockAuth, params, resEsperada, lanzaExcepcion) => {
        const mockToJSON = jest.fn().mockImplementation(mockProvider);
        firebaseAuth.GoogleAuthProvider.credentialFromResult.mockReturnValue({
            toJSON: mockToJSON
        });
        firebaseAuth.signInWithPopup.mockImplementation(mockAuth);
        firebaseAuth.reauthenticateWithPopup.mockImplementation(mockAuth);

        const res = await iniciarSesionGoogle(params.firebaseAuth, params.permisos, params.usuario, "es");


        expect(res).toEqual(resEsperada);
        expect(firebaseAuth.GoogleAuthProvider).toHaveBeenCalledTimes(1);
        expect(mockSetDefaultLanguage).toHaveBeenCalledTimes(1);
        expect(mockSetDefaultLanguage).toHaveBeenCalledWith("es");
        expect(mockAddScope).toHaveBeenCalledTimes(params.permisos.length);

        if (lanzaExcepcion) {
            expect(Date.now).not.toHaveBeenCalled();
            expect(mockToJSON).not.toHaveBeenCalled();
        } else {
            expect(Date.now).toHaveBeenCalledTimes(1);
            expect(mockToJSON).toHaveBeenCalledTimes(1);
        }

        if (params.usuario) {
            expect(firebaseAuth.reauthenticateWithPopup).toHaveBeenCalledTimes(1);
            expect(firebaseAuth.reauthenticateWithPopup).toHaveBeenCalledWith(params.usuario, expect.anything());
        } else {
            expect(firebaseAuth.signInWithPopup).toHaveBeenCalledTimes(1);
            expect(firebaseAuth.signInWithPopup).toHaveBeenCalledWith(params.firebaseAuth, expect.anything());
        }
    });
});