import { useAuth } from "./auth-hook";
import { useCallback, useMemo, useState } from 'react';
import { useIdioma } from "./idioma-hook";
import { UsuariosHelper } from "../helpers";


/**
 * Hook para realizar operaciones relacionadas con los usuarios.
 * @returns {Object} Objeto con las claves:
 * - "usuarios" (Array<Usuario>): Lista de usuarios.
 * - "verUsuario" (Function): Función para ver los datos de un usuario por su UID.
 * - "verUsuarios" (Function): Función para ver la lista de usuarios.
 * - "editarUsuario" (Function): Función para editar los datos de un usuario.
 * - "eliminarUsuarios" (Function): Función para eliminar usuarios.
 */
export default function useUsuarios() {
    const { autenticado, usuario } = useAuth();
    const { idioma } = useIdioma();
    const [usuarios, setUsuarios] = useState([]);
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
        const { success, data, error } = await helper.eliminarUsuarios(idsArray);
        if (success) {
            setUsuarios(data);
        }
        return { success, error };
    }, [helper, setUsuarios]);

    /**
     * @param {String} id UID del usuario a cargar.
     * @returns {Promise<Object>} Objeto con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa.
     * - "error" (String) - Mensaje de error en caso de que la operación falle.
     */
    const verUsuario = useCallback(async (id) => {
        return await helper.cargarUsuario(id);
    }, [helper]);

    /**
     * @returns {Promise<Object>} Objeto con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa.
     * - "error" (String) - Mensaje de error en caso de que la operación falle.
     */
    const verUsuarios = useCallback(async () => {
        const { success, data, error } = await helper.cargarUsuarios();
        if (success) {
            setUsuarios(data);
        }
        return { success, error };
    }, [helper, setUsuarios]);

    const value = useMemo(() => ({
        usuarios, helperListo, verUsuario, verUsuarios, editarUsuario, eliminarUsuarios
    }), [usuarios, helperListo, verUsuario, verUsuarios, editarUsuario, eliminarUsuarios]);

    return value;
};