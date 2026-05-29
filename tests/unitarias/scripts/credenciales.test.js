import { jest, describe, test, expect, beforeEach } from "@jest/globals";

jest.unstable_mockModule("../../../src/services/Api", () => {
    return {
        peticionApi: jest.fn()
    };
})

const { peticionApi } = await import("../../../src/services/Api");
const { cargarCredencialesServidor } = await import("../../../src/services/Credenciales");


describe("Validar la función 'cargarCredencialesServidor'", () => {
    // ------------------------- Respuestas esperadas --------------------------
    const res1 = { success: false, data: null, error: "No se ha podido cargar las credenciales del servidor." };
    const res2 = { success: true, data: { firebase: { appId: "id" } }, error: null };

    // ------------------------- Mocks --------------------------
    const mock1 = () => ({ success: false });
    const mock2 = () => ({ success: true, data: { appId: "id", driveScope: "scope", reCAPTCHA: "recaptcha" } });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    test.each([
        ["104", mock1, res1],
        ["105", mock2, res2]
    ])("CP - %s", async (idPrueba, mock, resEsperada) => {
        peticionApi.mockImplementation(mock);

        global.Promise = jest.fn();
        global.Promise.resolve.mockReturnValue(true);

        const res = await cargarCredencialesServidor();
        expect(res).toEqual(resEsperada);
        expect(peticionApi).toHaveBeenCalledTimes(idPrueba === "104" ? 5 : 1);
        expect(peticionApi).toHaveBeenCalledWith(
            "credenciales", "GET", {}, null, null, "es", "Error al cargar las credenciales de la aplicación."
        );
    });
});

describe("Validar la función 'almacenarCredencialesCache'", () => {
    test("CP - 106", () => {
        global.sessionStorage = jest.fn(() => ({
            setItem: jest.fn()
        }));

        const res = almacenarCredencialesCache({ appId: "id" }, "recaptcha", ["scope1", "scope2"]);
        expect(res).toBe(true);
        expect(sessionStorage.setItem).toHaveBeenCalledTimes(3);
        expect(sessionStorage.setItem).toHaveBeenCalledWith("session-credenciales-firebase", JSON.stringify({ appId: "id" }));
        expect(sessionStorage.setItem).toHaveBeenCalledWith("session-credenciales-recaptcha", "recaptcha");
        expect(sessionStorage.setItem).toHaveBeenCalledWith("session-drive-scopes", ["scope1", "scope2"]);
    });
});

describe("Validar la función 'cargarCredencialesCache'", () => {
    // ------------------------- Respuestas esperadas --------------------------
    const res1  = { success: true, firebase: "credenciales", recaptcha: "recaptcha", scopesDrive: ["scope1", "scope2"] };
    const res2 = { success: false };

    // ------------------------- Mocks --------------------------
    const mock1 = (x) => ({
        "sesion-credenciales-firebase": "credenciales",
        "session-credenciales-recaptcha": "recaptcha",
        "session-drive-scopes": "scope1,scope2"
    }[x]);
    const mock2 = (x) => ({
        "sesion-credenciales-firebase": "credenciales",
        "session-credenciales-recaptcha": null,
        "session-drive-scopes": "scope1,scope2"
    }[x]);
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each([
        ["107", mock1, res1],
        ["108", mock2, res2]
    ])("CP - %s", (idPrueba, mock, resEsperada) => {
        global.sessionStorage = jest.fn(() => ({
            getItem: jest.fn(mock)
        }));

        const jsonParseSpy = jest.spyOn(JSON, "parse");

        const res = cargarCredencialesCache();
        expect(res).toEqual(resEsperada);
        expect(global.sessionStorage.getItem).toHaveBeenCalledTimes(3);
        expect(global.sessionStorage.getItem).toHaveBeenCalledWith("session-credenciales-firebase");
        expect(global.sessionStorage.getItem).toHaveBeenCalledWith("session-credenciales-recaptcha");
        expect(global.sessionStorage.getItem).toHaveBeenCalledWith("session-drive-scopes");

        if (resEsperada.success) {
            expect(jsonParseSpy).toHaveBeenCalledTimes(1);
            expect(jsonParseSpy).toHaveBeenCalledWith("credenciales");
        }
    });
});