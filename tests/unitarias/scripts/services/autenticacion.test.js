import { jest, beforeEach, afterEach, expect, describe, test, beforeAll } from '@jest/globals';
import { AES_KEY } from '../../../../constants';

jest.unstable_mockModule("firebase/auth", () => ({
    signInWithPopup: jest.fn(),
    reauthenticateWithPopup: jest.fn(),
    GoogleAuthProvider: jest.fn(),
    signOut: jest.fn()
}));

jest.unstable_mockModule("crypto-js", () => ({
    AES: { encrypt: jest.fn(() => ({ toString: jest.fn().mockReturnValue("encryptedData") })) },
    enc: jest.fn()
}));

jest.unstable_mockModule("i18next", () => ({
    default: jest.fn()
}));

const firebaseAuth = await import("firebase/auth");
const { AES, enc } = await import("crypto-js");
const i18n = await import("i18next");

const { manejadorErroresAuth, guardarCredsOAuth, borrarCredsOAuth } = await import('../../../../src/services/Autenticacion');

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
        expect(sessionStorage.setItem).toHaveBeenCalledWith("session-tokens")
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
    });
});