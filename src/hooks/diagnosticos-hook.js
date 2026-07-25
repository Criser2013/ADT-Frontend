import useIdioma from "./idioma-hook";
import { DiagnosticosHelper } from "../helpers";
import { useAppConfig } from "./appConfig-hook";
import { useAuth } from "./auth-hook";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePaciente } from "./pacientes-hook";


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
 * - "mapeoDiagnosticos" (Object): Objeto que mapea los IDs de los diagnósticos a sus instancias correspondientes.
 */
export default function useOperacionesDiagnosticos() {
    const { autenticado, usuario } = useAuth();
    const { firestore } = useAppConfig();
    const { idioma } = useIdioma();
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
     * - "data" (Array<Diagnostico>|null) - Lista de diagnósticos actualizados, sino retorna null.
     * - "error" (String) - Mensaje de error en caso de que la operación falle.
     */
    const eliminarDiagnosticos = useCallback(async (ids) => {
        const idsArray = Array.isArray(ids) ? ids : [ids];
        return await helper.eliminarDiagnosticos(idsArray);
    }, [helper]);

    /**
     * @param {Diagnostico} diagnostico Objeto Diagnostico a generar.
     * @returns {Promise<Object>} Objeto con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa.
     * - "error" (String) - Mensaje de error en caso de que la operación falle.
     */
    const generarDiagnostico = useCallback(async (diagnostico) => {
        return await helper.diagnosticar(diagnostico);
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
     * - "data" (Array<Diagnostico>|null) - Lista de diagnósticos, sino retorna null.
     * - "error" (String) - Mensaje de error en caso de que la operación falle.
     */
    const verDiagnosticos = useCallback(async (verTodos, uid = null, fecha = null) => {
        return await helper.cargarDiagnosticos(verTodos, { uid, fecha });
    }, [helper]);

    const value = useMemo(() => ({
        eliminarDiagnosticos, generarDiagnostico, validarDiagnostico,
        verDiagnostico, verDiagnosticos, helperListo
    }), [
        eliminarDiagnosticos, generarDiagnostico,
        validarDiagnostico, verDiagnostico, verDiagnosticos, helperListo
    ]);

    return value;
};

export function useDiagnostico(id, traerInfoPersona = false) {
    const { usuario, usuariosListo } = useAuth();
    const { paciente } = usePaciente();
    const { verUsuario } = useUsuarios();
    const { verDiagnostico, helperListo: diagnosticosListo } = useOperacionesDiagnosticos();
    const [diagnostico, setDiagnostico] = useState(null);

    useEffect(() => {
        async function cargarPaciente(id, esAnonimo = false) {
            if (esAnonimo) {
                dispatch({
                    tipo: "SET_PERSONA", payload: new Paciente(
                        "null", null, "anonimo", 2, null, null, null, false, []
                    )
                });
                return;
            }
            const { success, data, error } = await verPaciente(id);
            if (success) {
                dispatch({ tipo: "SET_PERSONA", payload: data });
            } else {
                dispatch({
                    tipo: "SET_PERSONA", payload: new Paciente(
                        "null", null, "eliminado", 2, null, null, null, false, []
                    )
                });
                dispatch({ tipo: "MOSTRAR_MODAL_ERROR", payload: error });
            }
        }
        if (!usuario?.rolVisible && diagnostico && pacientesListo) {
            const uid = diagnostico.paciente;
            cargarPaciente(uid, !uid);
        }
    }, [diagnostico, usuario?.rolVisible, pacientesListo, cargarPaciente]);

    useEffect(() => {
        async function cargarDiagnostico(id) {
            const { success, data } = await verDiagnostico(id);
            if (success) {
                dispatch({ tipo: "SET_DIAGNOSTICO", payload: data });
            } else {
                navigate("/diagnosticos");
            }
        };

        if (diagnosticosListo && !diagnostico) {
            cargarDiagnostico(id);
        }
    }, [diagnosticosListo, diagnostico, cargarDiagnostico, id]);
    
    return { diagnostico };
};

/*
const mapeoDiagnosticos = useMemo(() => {
        const map = {};
        for (const d of diagnosticos) {
            map[d.id] = d;
        }
        return map;
    }, [diagnosticos]);
 */