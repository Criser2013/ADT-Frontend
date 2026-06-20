import { jest, describe, test, expect, beforeEach } from '@jest/globals';

jest.unstable_mockModule("firebase/app", () => {
    return {
        initializeApp: jest.fn(),
        getApps: jest.fn(),
        getApp: jest.fn()
    };
});

jest.unstable_mockModule("firebase/firestore", () => {
    return {
        getFirestore: jest.fn()
    };
});

jest.unstable_mockModule("firebase/auth", () => {
    return {
        getAuth: jest.fn()
    };
});

const { initializeApp, getApps, getApp } = await import("firebase/app");
const { getFirestore } = await import("firebase/firestore");
const { getAuth } = await import("firebase/auth");
const { inicializarFirebase } = await import("../../../src/services/Firebase");

describe("Validar la función 'inicializarFirebase'", () => {
    // ------------------------- Parámetros --------------------------
    const params1 = { apiKey: "test", authDomain: "test", projectId: "test" };

    // ------------------------- Respuestas esperadas --------------------------
    const res1 = {
        app: "appInstance", auth: "authInstance", firestore: "firestoreInstance"
    };

    // ------------------------- Mocks --------------------------
    const mock1 = () => [];
    const mock2 = () => ["appInstance"];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each([
        ["102", mock1, params1, res1],
        ["103", mock2, params1, res1]
    ])("CP - %s", (idPrueba, mock ,params, resEsperada) => {
        const mockVal = mock();

        initializeApp.mockReturnValue("appInstance");
        getApps.mockImplementation(mock);
        getApp.mockReturnValue("appInstance");
        getAuth.mockReturnValue("authInstance");
        getFirestore.mockReturnValue("firestoreInstance");

        const res = inicializarFirebase(params);
        expect(res).toEqual(resEsperada);
        expect(getApps).toHaveBeenCalledTimes(1);
        expect(getAuth).toHaveBeenCalledWith("appInstance");
        expect(getAuth).toHaveBeenCalledTimes(1);
        expect(getFirestore).toHaveBeenCalledWith("appInstance");
        expect(getFirestore).toHaveBeenCalledTimes(1);

        if (mockVal.length > 0) {
            expect(getApp).toHaveBeenCalledTimes(1);
            expect(initializeApp).not.toHaveBeenCalled();
        } else {
            expect(initializeApp).toHaveBeenCalledWith(params);
            expect(initializeApp).toHaveBeenCalledTimes(1);
            expect(getApp).not.toHaveBeenCalled();
        }
    });
});