import { jest, beforeEach, expect, describe, test } from '@jest/globals';

jest.unstable_mockModule('../../../../src/services/Autenticacion', () => ({
    iniciarSesionGoogle: jest.fn(),
    cerrarSesion: jest.fn().mockResolvedValue(true),
    registrarUsuario: jest.fn(),
    verRolUsuario: jest.fn().mockResolvedValue(false),
    guardarCredsOAuth: jest.fn()
}));

const authService = await import('../../../../src/services/Autenticacion');
const { iniciarSesion } = await import('../../../../src/helpers/auth-helper');

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
        authService.iniciarSesionGoogle.mockResolvedValue(mocks.login);
        authService.registrarUsuario.mockResolvedValue(mocks.registrar);
        const res = await iniciarSesion(params.firebase, params.permisos, params.usuario);
        expect(res).toEqual(resEsperada);
        expect(authService.iniciarSesionGoogle).toHaveBeenCalledTimes(1);
        expect(authService.iniciarSesionGoogle).toHaveBeenCalledWith(params.firebase, params.permisos, params.usuario);

        if (!resEsperada.success && !errorPermisos && !errorRegistro) {
            expect(authService.registrarUsuario).not.toHaveBeenCalled();
            expect(authService.cerrarSesion).not.toHaveBeenCalled();
            expect(authService.guardarCredsOAuth).not.toHaveBeenCalled();
            expect(authService.verRolUsuario).not.toHaveBeenCalled();
        } else if (resEsperada.success && !errorPermisos && !errorRegistro) {
            expect(authService.registrarUsuario).toHaveBeenCalledTimes(1);
            expect(authService.registrarUsuario).toHaveBeenCalledWith(resEsperada.usuario);
            expect(authService.verRolUsuario).toHaveBeenCalledTimes(1);
            expect(authService.verRolUsuario).toHaveBeenCalledWith(resEsperada.usuario);
            expect(authService.guardarCredsOAuth).toHaveBeenCalledTimes(1);
            expect(authService.guardarCredsOAuth).toHaveBeenCalledWith(expect.objectContaining({ accessToken: resEsperada.accessToken }));
        }

        if (errorPermisos || errorRegistro) {
            expect(authService.registrarUsuario).toHaveBeenCalledTimes(1);
            expect(authService.cerrarSesion).toHaveBeenCalledTimes(1);
            expect(authService.cerrarSesion).toHaveBeenCalledWith(params.firebase);
            expect(authService.verRolUsuario).not.toHaveBeenCalled();
            expect(authService.guardarCredsOAuth).not.toHaveBeenCalled();
        }
    });
});