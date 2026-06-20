import { jest, beforeEach, afterEach, expect, describe, test } from '@jest/globals';

jest.unstable_mockModule("firebase/auth", () => ({
    signInWithPopup: jest.fn(),
    reauthenticateWithPopup: jest.fn(),
    GoogleAuthProvider: jest.fn(),
    signOut: jest.fn()
}));

jest.unstable_mockModule("crypto-js", () => ({
    AES: jest.fn(),
    enc: jest.fn()
}));

jest.unstable_mockModule("i18next", () => ({
    default: jest.fn()
}));

const firebaseAuth = await import("firebase/auth");
const { AES, enc } = await import("crypto-js");
const i18n = await import("i18next");

const { manejadorErroresAuth } = await import('../../../../src/services/Autenticacion');

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