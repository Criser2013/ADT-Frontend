import { jest, describe, test, expect, beforeEach, afterEach } from "@jest/globals";

jest.unstable_mockModule("../../../../src/services/Api", () => {
    return {
        peticionApi: jest.fn()
    };
})

const { peticionApi } = await import("../../../../src/services/Api");
const { cargarCredencialesServidor, cargarCredencialesCache, almacenarCredencialesCache } = await import("../../../../src/services/Credenciales");


describe("Validar la función 'cargarCredencialesServidor'", () => {
    const params1 = new AbortController();
    const params2 = new AbortController();

    // ------------------------- Respuestas esperadas --------------------------
    const res1 = { success: false, data: null, error: "No se ha podido cargar las credenciales del servidor." };
    const res2 = { success: true, data: { firebase: { appId: "id" }, recaptcha: "recaptcha", scopesDrive: "scope" }, error: null };

    // ------------------------- Mocks --------------------------
    const mock1 = { success: false };
    const mock2 = { success: true, data: { appId: "id", driveScopes: "scope", reCAPTCHA: "recaptcha" } };

    beforeEach(() => {
        jest.resetAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test.each([
        ["104", mock1, params1, res1],
        ["105", mock2, params2, res2]
    ])("CP - %s", async (idPrueba, mock, params, resEsperada) => {
        peticionApi.mockResolvedValue(mock);

        const pet = cargarCredencialesServidor(params);

        jest.runAllTimersAsync();

        const res = await pet;

        expect(res).toEqual(resEsperada);
        expect(peticionApi).toHaveBeenCalledTimes(idPrueba === "104" ? 5 : 1);
        expect(peticionApi).toHaveBeenCalledWith(
            "credenciales", "GET", {}, null, null, "es", "Error al cargar las credenciales de la aplicación.", params
        );
    });
});

describe("Validar la función 'almacenarCredencialesCache'", () => {
    test("CP - 106", () => {
        jest.spyOn(Storage.prototype, "setItem").mockImplementation(jest.fn());

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
    const res1  = { success: true, firebase: {credenciales: "credenciales"}, recaptcha: "recaptcha", scopesDrive: ["scope1", "scope2"] };
    const res2 = { success: false };

    // ------------------------- Mocks --------------------------
    const mock1 = (x) => ({
        "session-credenciales-firebase": JSON.stringify({credenciales: "credenciales"}),
        "session-credenciales-recaptcha": "recaptcha",
        "session-drive-scopes": "scope1,scope2"
    }[x]);
    const mock2 = (x) => ({
        "session-credenciales-firebase": JSON.stringify({credenciales: "credenciales"}),
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
        jest.spyOn(Storage.prototype, "getItem").mockImplementation(mock);

        const jsonParseSpy = jest.spyOn(JSON, "parse");

        const res = cargarCredencialesCache();
        expect(res).toEqual(resEsperada);
        expect(global.sessionStorage.getItem).toHaveBeenCalledTimes(3);
        expect(global.sessionStorage.getItem).toHaveBeenCalledWith("session-credenciales-firebase");
        expect(global.sessionStorage.getItem).toHaveBeenCalledWith("session-credenciales-recaptcha");
        expect(global.sessionStorage.getItem).toHaveBeenCalledWith("session-drive-scopes");

        if (resEsperada.success) {
            expect(jsonParseSpy).toHaveBeenCalledTimes(1);
            expect(jsonParseSpy).toHaveBeenCalledWith(JSON.stringify({ credenciales: "credenciales" }));
        }
    });
});