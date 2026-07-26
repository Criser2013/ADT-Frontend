import useIdioma from "./idioma-hook";
import { useAuth } from "./auth-hook";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Usuario } from "../models";
import { UsuariosHelper } from "../helpers";


/**
 * Hook para realizar operaciones relacionadas con los usuarios.
 * @returns {Object} Objeto con las claves:
 * - "verUsuario" (Function): Función para ver los datos de un usuario por su UID.
 * - "verUsuarios" (Function): Función para ver la lista de usuarios.
 * - "editarUsuario" (Function): Función para editar los datos de un usuario.
 * - "eliminarUsuarios" (Function): Función para eliminar usuarios.
 */
export function useOperacionesUsuarios() {
    const { autenticado, usuario } = useAuth();
    const { idioma } = useIdioma();
    const helper = useMemo(() => {
        if (autenticado) {
            return new UsuariosHelper(usuario.tokenFirebase, idioma);
        }
        return null;
    }, [usuario, autenticado, idioma]);
    const helperListo = useMemo(() => helper !== null, [helper]);

    /**
     * @param {String} id UID del usuario a editar.
     * @param {String} nuevoRol Nuevo rol del usuario.
     * @param {Boolean} desactivar Indica si el usuario debe ser desactivado.
     * @returns {Promise<Object>} Objeto con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa.
     * - "error" (String) - Mensaje de error en caso de que la operación falle.
     */
    const editarUsuario = useCallback(async (id, nuevoRol, desactivar) => {
        return await helper.editarUsuario(id, nuevoRol, desactivar);
    }, [helper]);

    /**
     * @param {Array<String>|String} ids IDs de los usuarios a eliminar, si solo es uno,
     * se puede pasar la ID como String.
     * @returns {Promise<Object>} Objeto con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa.
     * - "error" (String) - Mensaje de error en caso de que la operación falle.
     */
    const eliminarUsuarios = useCallback(async (ids) => {
        const idsArray = Array.isArray(ids) ? ids : [ids];
        return await helper.eliminarUsuarios(idsArray);
    }, [helper]);

    /**
     * @param {String} id UID del usuario a cargar.
     * @returns {Promise<Object>} Objeto con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa.
     * - "data" (Usuario) - Contiene los datos del usuario si la operación fue exitosa.
     * - "error" (String) - Mensaje de error en caso de que la operación falle.
     */
    const verUsuario = useCallback(async (id) => {
        return await helper.cargarUsuario(id);
    }, [helper]);

    /**
     * @returns {Promise<Object>} Objeto con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa.
     * - "data" (Array<Usuario>) - Lista de usuarios si la operación fue exitosa.
     * - "error" (String) - Mensaje de error en caso de que la operación falle.
     */
    const verUsuarios = useCallback(async () => {
        return await helper.cargarUsuarios();
    }, [helper]);

    const value = useMemo(() => ({
        helperListo, verUsuario, verUsuarios, editarUsuario, eliminarUsuarios
    }), [helperListo, verUsuario, verUsuarios, editarUsuario, eliminarUsuarios]);

    return value;
};

/**
 * Hook para obtener los datos de un usuario específico por su UID.
 * @param {String} id UID del usuario a consultar.
 * @param {Boolean} cargaAutomatica Indicador para activar la carga automática del usuario al montar el componente.
 * @returns {Object} Objeto con las claves:
 * - "usuario" (Usuario|null) - Contiene los datos del usuario si la operación fue exitosa, sino null.
 * - "error" (String|null) - Mensaje de error en caso de que la operación falle, sino null.
 * - "manejadorCargaUsuario" (Function) - Función para recargar los datos del usuario.
 */
export function useUsuario(id, cargaAutomatica = true) {
    const { helperListo, verUsuario } = useOperacionesUsuarios();
    const { usuario: usuarioAutenticado } = useAuth();
    const [error, setError] = useState(null);
    const [usuario, setUsuario] = useState(null);

    const manejadorCargaUsuario = useCallback(async () => {
        const { success, data, error } = await verUsuario(id);
        if (success) {
            setUsuario(data);
            setError(null);
        } else {
            setUsuario(
                new Usuario(
                    "null", null, "", false, false, null, null
                )
            );
            setError(error);
        }
        return { success, error };
    }, [verUsuario, setUsuario, setError, id]);

    useEffect(() => {
        const expIdUsuario = /-\w{28}$/;
        const res = expIdUsuario.test(id);
        if (!res) {
            setError("errIdInvalido");
        } else if (res && cargaAutomatica && usuarioAutenticado?.rolVisible && helperListo) {
            manejadorCargaUsuario();
        }
    }, [id, cargaAutomatica, verUsuario, helperListo, usuarioAutenticado?.rolVisible, manejadorCargaUsuario]);

    const value = useMemo(() => ({
        usuario, error, manejadorCargaUsuario
    }), [usuario, error, manejadorCargaUsuario]);

    return value;
};

/**
 * Hook para cargar los datos de todos los usuarios de la aplicación.
 * @param {Boolean} cargaAutomatica Indicador para activar la carga automática de los usuarios al montar el componente.
 * @returns {Object} Objeto con las claves:
 * - "usuarios" (Array<Usuario>): Lista de usuarios.
 * - "mapeoUsuarios" (Object): Objeto que mapea los UID de los usuarios a sus datos.
 * - "error" (String|null): Mensaje de error en caso de que la operación falle, sino null.
 * - "manejadorCargaUsuarios" (Function): Función para recargar la lista de usuarios.
 */
export function useUsuarios(cargaAutomatica = true) {
    const { helperListo, verUsuarios } = useOperacionesUsuarios();
    const { usuario } = useAuth();
    const [error, setError] = useState(null);
    const [usuarios, setUsuarios] = useState(null);
    const mapeoUsuarios = useMemo(() => {
        const res = {};
        if (usuarios) {
            usuarios.forEach(usuario => {
                res[usuario.uid] = usuario;
            });
        }
        return res;
    }, [usuarios]);

    const manejadorCargaUsuarios = useCallback(async () => {
        const { success, data, error } = await verUsuarios();
            if (success) {
                setUsuarios(data);
                setError(null);
            } else {
                setUsuarios([]);
                setError(error);
            }
    }, [verUsuarios, setUsuarios, setError]);

    useEffect(() => {
        if (cargaAutomatica && usuario?.rolVisible && helperListo) {
            manejadorCargaUsuarios();
        }
    }, [cargaAutomatica, verUsuarios, helperListo, usuario?.rolVisible, manejadorCargaUsuarios]);

    const value = useMemo(() => ({
        usuarios, mapeoUsuarios, error, manejadorCargaUsuarios, helperListo
    }), [usuarios, mapeoUsuarios, error, manejadorCargaUsuarios, helperListo]);

    return value;
};