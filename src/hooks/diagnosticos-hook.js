import useIdioma from "./idioma-hook";
import { Paciente, Usuario } from "../models";
import { DiagnosticosHelper } from "../helpers";
import { useAppConfig } from "./appConfig-hook";
import { useAuth } from "./auth-hook";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePaciente, usePacientes } from "./pacientes-hook";
import { useUsuario, useUsuarios } from "./usuarios-hook";
import { validarId } from "../utils/Validadores";


/**
 * Hook para realizar operaciones relacionadas con los diagnósticos.
 * @returns {Object} Objeto con las claves:
 * - "eliminarDiagnosticos" (Function): Función para eliminar diagnósticos por sus IDs.
 * - "generarDiagnostico" (Function): Función para generar un nuevo diagnóstico.
 * - "helperListo" (Boolean): Indica si el helper de datos está listo para usarse.
 * - "validarDiagnostico" (Function): Función para validar un diagnóstico.
 * - "verDiagnostico" (Function): Función para ver los datos de un diagnóstico por su ID.
 * - "verDiagnosticos" (Function): Función para ver los diagnósticos, filtrando por usuario y fecha.
 */
export function useOperacionesDiagnosticos() {
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

/**
 * Hook para obtener los datos de un diagnóstico específico por su ID.
 * @param {String} id ID del diagnóstico a consultar.
 * @param {Boolean} traerInfoPersona Indica si se debe traer la información del paciente y usuario relacionados al diagnóstico.
 * @returns {Object} Objeto con las claves:
 * - "diagnostico" (Diagnostico|null) - Instancia de Diagnostico correspondiente al ID proporcionado o null si no se encuentra.
 * - "persona" (Paciente|Usuario|null) - Instancia de Paciente o Usuario correspondiente al diagnóstico o null si no se encuentra.
 * - "error" (String|null) - Mensaje de error en caso de que la operación falle, sino null.
 * - "manejadorCargaDiagnostico" (Function) - Función para recargar los datos del diagnóstico.
 */
export function useDiagnostico(id, traerInfoPersona = false) {
    const { usuario: usuarioAutenticado } = useAuth();
    const { verDiagnostico, helperListo: diagnosticosListo } = useOperacionesDiagnosticos();
    const [diagnostico, setDiagnostico] = useState(null);
    const [error, setError] = useState(null);
    const idUsuario = useMemo(() => id.substring(37), [id]);
    const idPaciente = useMemo(() => {
        if (!diagnostico?.paciente) {
            return "11111111-1111-1111-1111-111111111111";
        } else {
            return diagnostico.paciente;
        }
    }, [diagnostico]);
    const { establecerPaciente, manejadorCargaPaciente, paciente, error: errorPaciente } = usePaciente(idPaciente, false);
    const { helperListo: usuariosListo, manejadorCargaUsuario, usuario, error: errorUsuario } = useUsuario(idUsuario, false);
    const persona = useMemo(() => usuarioAutenticado?.rolVisible ? usuario : paciente
        , [paciente, usuario, usuarioAutenticado?.rolVisible]);

    const manejadorCargaDiagnostico = useCallback(async () => {
        const { success, data, error } = await verDiagnostico(id);
        if (success) {
            setDiagnostico(data);
            setError(null);
        } else {
            setError(error);
        }
    }, [id, verDiagnostico]);

    useEffect(() => {
        async function cargarPaciente(esAnonimo) {
            if (esAnonimo) {
                establecerPaciente(esAnonimo);
                return;
            }
            const { success } = await manejadorCargaPaciente();
            if (!success) {
                establecerPaciente(false);
            }
        };

        if (diagnosticosListo && diagnostico && !usuarioAutenticado?.rolVisible && traerInfoPersona) {
            const esAnonimo = !diagnostico.paciente;
            cargarPaciente(esAnonimo);
        }
    }, [
        usuarioAutenticado?.rolVisible, diagnostico, establecerPaciente,
        manejadorCargaPaciente, traerInfoPersona, diagnosticosListo
    ]);

    useEffect(() => {
        if (usuariosListo && usuarioAutenticado?.rolVisible && traerInfoPersona) {
            manejadorCargaUsuario();
        }
    }, [usuarioAutenticado?.rolVisible, traerInfoPersona, manejadorCargaUsuario, usuariosListo]);

    useEffect(() => {
        const res = validarId(id.replace(/-\w{28}$/, ""));
        if (!res) {
            setError("errIdInvalido");
            return;
        } else if (res && diagnosticosListo) {
            manejadorCargaDiagnostico();
        }
    }, [diagnosticosListo, id, manejadorCargaDiagnostico]);

    useEffect(() => {
        if (errorPaciente) {
            setError(errorPaciente);
        } else if (errorUsuario) {
            setError(errorUsuario);
        }
    }, [errorPaciente, errorUsuario]);

    const value = useMemo(() => ({
        diagnostico, persona, error, manejadorCargaDiagnostico
    }), [diagnostico, persona, error, manejadorCargaDiagnostico]);

    return value;
};

/**
 * Hook para obtener la lista de diagnósticos de todos los usuarios o de un usuario específico, filtrando por fecha si se desea.
 * @param {Boolean} verTodos Indicador para ver todos los diagnósticos o solo los del usuario indicado.
 * @param {String|null} uid UID del usuario por el cual consultar los diagnósticos. Si verTodos es true, este parámetro se ignora.
 * @param {Date|null} fecha Fecha para filtrar los diagnósticos. Si verTodos es true, este parámetro se ignora.
 * @param {Boolean} traerInfoPersona Indicador para cargar los datos del paciente o usuario relacionado a cada diagnóstico.
 * @returns {Object} Objeto con las claves:
 * - "diagnosticos" (Array<Diagnostico>|null) - Lista de diagnósticos obtenidos, sino null.
 * - "error" (String|null) - Mensaje de error en caso de que la operación falle, sino null.
 * - "mapeoDiagnosticos" (Object) - Objeto que mapea los IDs de los diagnósticos a sus datos.
 */
export function useDiagnosticos(verTodos, uid = null, fecha = null, traerInfoPersona = false) {
    const { helperListo: pacientesListo, manejadorCargaPacientes, mapeoPacientes } = usePacientes(false);
    const { helperListo: usuariosListo, manejadorCargaUsuarios, mapeoUsuarios } = useUsuarios(false);
    const { usuario } = useAuth();
    const { verDiagnosticos, helperListo: diagnosticosListo } = useOperacionesDiagnosticos();
    const [diagnosticos, setDiagnosticos] = useState(null);
    const [error, setError] = useState(null);
    const mapeoDiagnosticos = useMemo(() => {
        const aux = {};
        if (Array.isArray(diagnosticos)) {
            for (const d of diagnosticos) {
                aux[d.id] = d;
            }
        }
        return aux;
    }, [diagnosticos]);

    const diagnosticosMapeados = useMemo(() => {
        const aux = diagnosticos?.map((d) => d.deepClone()) || [];

        if (traerInfoPersona) {
            for (const d of aux) {
                if (usuario?.rolVisible) {
                    d.usuario = mapeoUsuarios[d.usuario]?.nombre || "eliminado";
                }
                if (!d.paciente) {
                    d.paciente = "anonimo";
                } else {
                    d.paciente = mapeoPacientes[d.paciente]?.nombre || "eliminado";
                }
            }
        }

        return aux;
    }, [usuario?.rolVisible, traerInfoPersona, diagnosticos, mapeoPacientes, mapeoUsuarios]);

    /**
     * @param {String} tipo Tipo de persona a cargar: "paciente" o "usuario".
     */
    const cargarPersonas = useCallback(async (tipo) => {
        const { success, error } = await tipo == "paciente" ? manejadorCargaPacientes() : manejadorCargaUsuarios();
        if (!success) {
            setError(error);
        }
    }, [manejadorCargaPacientes, manejadorCargaUsuarios]);

    /**
     * @param {Boolean} verTodos Indica si se deben cargar todos los diagnósticos o solo los del usuario indicado.
     * @param {String|null} uid UID del usuario por el cual consultar los diagnósticos. Si verTodos es true, este parámetro se ignora.
     * @param {Date|null} fecha Fecha para filtrar los diagnósticos. Si verTodos es true, este parámetro se ignora.
     */
    const manejadorCargaDiagnosticos = useCallback(async (verTodos, uid, fecha) => {
        const { success, data, error } = await verDiagnosticos(verTodos, uid, fecha);
        if (success) {
            setDiagnosticos(data);
            setError(null);
        } else {
            setDiagnosticos([]);
            setError(error);
        }
    }, [verDiagnosticos]);

    useEffect(() => {
        if (traerInfoPersona && !usuario?.rolVisible && diagnosticos && pacientesListo) {
            cargarPersonas("paciente");
        }
    }, [cargarPersonas, usuario?.rolVisible, manejadorCargaPacientes, traerInfoPersona, diagnosticos, pacientesListo]);

    useEffect(() => {
        if (traerInfoPersona && usuario?.rolVisible && usuariosListo) {
            cargarPersonas("usuario");
        }
    }, [cargarPersonas, usuario?.rolVisible, traerInfoPersona, manejadorCargaUsuarios, usuariosListo]);

    useEffect(() => {
        if (diagnosticosListo && !diagnosticos) {
            manejadorCargaDiagnosticos(verTodos, uid, fecha);
        }
    }, [diagnosticosListo, verDiagnosticos, verTodos, uid, fecha, diagnosticos, manejadorCargaDiagnosticos]);

    return { mapeoDiagnosticos, diagnosticos: diagnosticosMapeados, error };
};