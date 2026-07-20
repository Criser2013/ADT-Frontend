import { useCallback, useMemo, useState } from 'react';
import { useAppConfig } from "./appConfig-hook";
import { useAuth } from "./auth-hook";
import { useIdioma } from "./idioma-hook";
import { DiagnosticosHelper } from "../helpers";


/**
 * Hook para realizar operaciones relacionadas con los diagnósticos.
 * @returns {Object} Objeto con las claves:
 * - "diagnosticos" (Array<Diagnostico>): Lista de diagnósticos.
 * - "eliminarDiagnosticos" (Function): Función para eliminar diagnósticos por sus IDs.
 * - "generarDiagnostico" (Function): Función para generar un nuevo diagnóstico.
 * - "helperListo" (Boolean): Indica si el helper de datos está listo para usarse.
 * - "validarDiagnostico" (Function): Función para validar un diagnóstico.
 * - "verDiagnostico" (Function): Función para ver los datos de un diagnóstico por su ID.
 * - "verDiagnosticos" (Function): Función para ver los diagnósticos, filtrando por usuario y fecha.
 */
export default function useDiagnosticos() {
    const { autenticado, usuario } = useAuth();
    const { firestore } = useAppConfig();
    const { idioma } = useIdioma();
    const [diagnosticos, setDiagnosticos] = useState([]);
    const helper = useMemo(() => {
        if (autenticado) {
            return new DiagnosticosHelper(usuario.tokenFirebase, firestore, idioma);
        }
        return null;
    }, [firestore, usuario, autenticado, idioma]);
    const helperListo = useMemo(() => helper !== null, [helper]);

    /**
     * @param {Array<String>|String} ids IDs de los diagnósticos a eliminar, si solo es uno,
     * se puede pasar la ID como String.
     * @returns {Promise<Object>} Objeto con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa.
     * - "error" (String) - Mensaje de error en caso de que la operación falle.
     */
    const eliminarDiagnosticos = useCallback(async (ids) => {
        const idsArray = Array.isArray(ids) ? ids : [ids];
        const { success, data, error } = await helper.eliminarDiagnosticos(idsArray);
        if (success) {
            setDiagnosticos(data);
        }
        return { success, error };
    }, [helper, setDiagnosticos]);

    /**
     * @param {Diagnostico} diagnostico Objeto Diagnostico a generar.
     * @returns {Promise<Object>} Objeto con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa.
     * - "error" (String) - Mensaje de error en caso de que la operación falle.
     */
    const generarDiagnostico = useCallback(async (diagnostico) => {
        return await helper.diagnosticar(diagnostico, "errorDiagnostico");
    }, [helper]);

    /**
     * @param {Diagnostico} diagnostico Objeto Diagnostico a validar.
     * @param {String} diagnosticoMedico Nombre del médico que valida el diagnóstico.
     * @returns {Promise<Object>} Objeto con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa.
     * - "error" (String) - Mensaje de error en caso de que la operación falle.
     * - "data" (Diagnostico|null) - Instancia de Diagnostico validad, sino retorna null.
     */
    const validarDiagnostico = useCallback(async (instancia, diagnosticoMedico) => {
        return await helper.validarDiagnostico(instancia, diagnosticoMedico);
    }, [helper]);

    /**
     * @param {String} idInstancia ID del diagnóstico a ver.
     * @returns {Promise<Object>} Objeto con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa.
     * - "error" (String) - Mensaje de error en caso de que la operación falle.
     * - "data" (Diagnostico|null) - Instancia de Diagnostico, sino retorna null.
     */
    const verDiagnostico = useCallback(async (idInstancia) => {
        return await helper.cargarDiagnostico(idInstancia);
    }, [helper]);

    /**
     * @param {Boolean} verTodos Indica si se deben cargar todos los diagnósticos o solo los 
     * diagnósticos aportados por el usuario indicado.
     * @param {String|null} uid UID del usuario por el cual consultar. Si verTodos es true, este parámetro se ignora.
     * @param {String|null} fecha Fecha para filtrar los diagnósticos. Si verTodos es true, este parámetro se ignora.
     * @returns {Promise<Object>} Objeto con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa.
     * - "error" (String) - Mensaje de error en caso de que la operación falle.
     */
    const verDiagnosticos = useCallback(async (verTodos, uid = null, fecha = null) => {
        const { success, data, error } = await helper.cargarDiagnosticos(verTodos, { uid, fecha });
        if (success) {
            setDiagnosticos(data);
        }
        return { success, error };
    }, [helper, setDiagnosticos]);

    const value = useMemo(() => ({
        diagnosticos, eliminarDiagnosticos, generarDiagnostico, validarDiagnostico,
        verDiagnostico, verDiagnosticos, helperListo
    }), [diagnosticos]);

    return value;
};