import { jest, beforeEach, expect, describe, test } from '@jest/globals';

jest.unstable_mockModule('../../../../src/helpers/auth-helper', () => ({
    iniciarSesionGoogle: jest.fn(),
    cerrarSesion: jest.fn().mockResolvedValue(true),
    registrarUsuario: jest.fn(),
    verRolUsuario: jest.fn().mockResolvedValue(false),
    guardarCredsOAuth: jest.fn()
}));


const helpers = await import('../../../../src/helpers/auth-helper');
const { iniciarSesion } = await import('../../../../src/services/Autenticacion');

describe("Validar la función 'iniciarSesion'", () => {
    // -------------------------- Parámetros ---------------------------
    const params1 = { firebase: "firebaseAuth", permisos: ["scope1", "scope2"], usuario: null, idioma: "es" };
    const params2 = { firebase: "firebaseAuth", permisos: ["scope3", "scope4"], usuario: null, idioma: "es" };

    // -------------------------- Respuestas esperadas ---------------------------
    const res1 = { success: true, usuario: { uid: "123" }, rol: false, tiempoExpiracion: 1000, accessToken: "token" };
    const res2 = { success: false, error: "errIniciarSesion" };
    const res3 = { success: false, error: "errPermisos" };
    const res4 = { success: false, error: "errVerificarRegistro" };

    // -------------------------- Mocks ---------------------------
    const mockInicioSesion1 = {
        success: true, res: {
            user: { uid: "123" }, _tokenResponse: {
                oauthExpireIn: 181,
                rawUserInfo: JSON.stringify({
                    granted_scopes: ["scope1", "scope2"]
                })
            }
        }, user: { uid: "123" }, credencialOAuth: {
            _tokenResponse: {
                oauthExpireIn: 181,
                rawUserInfo: JSON.stringify({
                    granted_scopes: ["scope1", "scope2"]
                }),
            },
            accessToken: "token",
            expires: "3000",
            scopesDrive: ["scope1", "scope2"]
        }
    };
    const mockInicioSesion2 = { success: false, error: "errIniciarSesion" };

    const mockRegistrar1 = { success: true };
    const mockRegistrar2 = { success: false };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each([
        ["123", { login: mockInicioSesion1, registrar: mockRegistrar1 }, params1, res1, false, false],
        ["124", { login: mockInicioSesion1, registrar: mockRegistrar1 }, params2, res3, true, false],
        ["125", { login: mockInicioSesion1, registrar: mockRegistrar2 }, params1, res4, false, true],
        ["126", { login: mockInicioSesion2, registrar: mockRegistrar1 }, params1, res2, false, false]
    ])("CP - %s", async (idPrueba, mocks, params, resEsperada, errorPermisos, errorRegistro) => {
        helpers.iniciarSesionGoogle.mockResolvedValue(mocks.login);
        helpers.registrarUsuario.mockResolvedValue(mocks.registrar);

        const res = await iniciarSesion(params.firebase, params.permisos, params.usuario);

        expect(res).toEqual(resEsperada);
        expect(helpers.iniciarSesionGoogle).toHaveBeenCalledTimes(1);
        expect(helpers.iniciarSesionGoogle).toHaveBeenCalledWith(params.firebase, params.permisos, params.usuario);

        if (!resEsperada.success && !errorPermisos && !errorRegistro) {
            expect(helpers.registrarUsuario).not.toHaveBeenCalled();
            expect(helpers.cerrarSesion).not.toHaveBeenCalled();
            expect(helpers.guardarCredsOAuth).not.toHaveBeenCalled();
            expect(helpers.verRolUsuario).not.toHaveBeenCalled();
        } else if (resEsperada.success && !errorPermisos && !errorRegistro) {
            expect(helpers.registrarUsuario).toHaveBeenCalledTimes(1);
            expect(helpers.registrarUsuario).toHaveBeenCalledWith(resEsperada.usuario);
            expect(helpers.verRolUsuario).toHaveBeenCalledTimes(1);
            expect(helpers.verRolUsuario).toHaveBeenCalledWith(resEsperada.usuario);
            expect(helpers.guardarCredsOAuth).toHaveBeenCalledTimes(1);
            expect(helpers.guardarCredsOAuth).toHaveBeenCalledWith(expect.objectContaining({ accessToken: resEsperada.accessToken }));
        }

        if (errorPermisos || errorRegistro) {
            expect(helpers.registrarUsuario).toHaveBeenCalledTimes(1);
            expect(helpers.cerrarSesion).toHaveBeenCalledTimes(1);
            expect(helpers.cerrarSesion).toHaveBeenCalledWith(params.firebase);
            expect(helpers.verRolUsuario).not.toHaveBeenCalled();
            expect(helpers.guardarCredsOAuth).not.toHaveBeenCalled();
        }
    });
});