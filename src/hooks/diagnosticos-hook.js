import i18n from "i18next";
import { DiagnosticosHelper } from "../helpers";
import { Paciente, Usuario } from "../models";
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
    const helper = useMemo(() => {
        if (autenticado) {
            return new DiagnosticosHelper(usuario.tokenFirebase, firestore);
        }
        return null;
    }, [firestore, usuario, autenticado]);
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
        return await helper.diagnosticar(diagnostico, i18n.language.split("-")[0]);
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
        const uid = id.substring(37);
        if (!res) {
            setError("errIdInvalido");
            return;
        } else if ((uid != usuarioAutenticado?.uid) && !usuarioAutenticado?.rolVisible) {
            setError("accesoDenegado");
            return;
        } else if (res && diagnosticosListo) {
            manejadorCargaDiagnostico();
        }
    }, [diagnosticosListo, id, manejadorCargaDiagnostico, usuarioAutenticado]);

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
 * - "manejadorCargaDiagnosticos" (Function) - Función para recargar la lista de diagnósticos.
 * - "cantDiagnosticosNoValidados" (Number) - Cantidad de diagnósticos que no han sido validados.
 * - "diagnosticosAgrupadosPorUsuario" (Object) - Objeto que mapea los UID de los usuarios a sus diagnósticos.
 */
export function useDiagnosticos(verTodos, uid = null, fecha = null, traerInfoPersona = false) {
    const { helperListo: pacientesListo, manejadorCargaPacientes, mapeoPacientes, error: errorPacientes } = usePacientes(false);
    const { helperListo: usuariosListo, manejadorCargaUsuarios, mapeoUsuarios, error: errorUsuarios } = useUsuarios(false);
    const { usuario } = useAuth();
    const { verDiagnosticos, helperListo: diagnosticosListo } = useOperacionesDiagnosticos();
    const [diagnosticos, setDiagnosticos] = useState(null);
    const [error, setError] = useState(null);
    const diagnosticosMapeados = useMemo(() => {
        const aux = diagnosticos?.map((d) => d.deepClone()) || [];
        if (traerInfoPersona) {
            for (let i = 0; i < aux.length; i++) {
                const d = aux[i];
                d.cambiarDatosPersonas(
                    mapeoUsuarios[d.usuario]?.nombre || "usuario eliminado",
                    d.paciente ? mapeoPacientes[d.paciente]?.nombre || "paciente eliminado" : "paciente anónimo",
                    mapeoPacientes[d.paciente]?.cedula || "N/A"
                );
            }
        }
        return aux;
    }, [traerInfoPersona, diagnosticos, mapeoPacientes, mapeoUsuarios]);
    const diagnosticosAgrupadosPorUsuario = useMemo(() => {
        const aux = {};
        if (diagnosticos) {
            diagnosticos.forEach((d) => {
                if (!aux[d.usuario]) {
                    aux[d.usuario] = [];
                }
                aux[d.usuario].push(d);
            });
        }
        return aux;
    }, [diagnosticos]);
    const cantDiagnosticosNoValidados = useMemo(() =>
        diagnosticosMapeados?.reduce((x, d) => x + (d.validado ? 0 : 1), 0) || 0
        , [diagnosticosMapeados]);

    /**
     * @param {String} tipo Tipo de persona a cargar, puede ser "paciente" o "usuario".
     */
    const manejadorCargaDiagnosticos = useCallback(async (tipo, verTodos, uid, fecha) => {
        let pets = [];
        if (traerInfoPersona) {
            pets.push(tipo == "paciente" ? manejadorCargaPacientes() : manejadorCargaUsuarios());
        }

        pets.push(verDiagnosticos(verTodos, uid, fecha));

        pets = await Promise.all(pets);
        const { success, data, error } = pets[pets.length - 1];
        if (success) {
            setDiagnosticos(data);
            setError(null);
        } else {
            setDiagnosticos([]);
            setError(error);
        }
    }, [verDiagnosticos, traerInfoPersona, manejadorCargaPacientes, manejadorCargaUsuarios]);

    useEffect(() => {
        const esAdmin = usuario?.rolVisible;
        const expCargaPersonas = !traerInfoPersona || (traerInfoPersona && (
            (esAdmin && usuariosListo) || (!esAdmin && pacientesListo))
        );
        if (diagnosticosListo && expCargaPersonas) {
            manejadorCargaDiagnosticos(
                esAdmin ? "usuario" : "paciente",
                verTodos, uid, fecha
            );
        }
    }, [
        diagnosticosListo, verTodos, uid, fecha, manejadorCargaDiagnosticos,
        usuario?.rolVisible, pacientesListo, usuariosListo, traerInfoPersona
    ]);

    useEffect(() => {
        if (errorPacientes) {
            setError(errorPacientes);
        } else if (errorUsuarios) {
            setError(errorUsuarios);
        }
    }, [errorPacientes, errorUsuarios]);

    const value = useMemo(() => ({
        diagnosticos: diagnosticosMapeados, error, manejadorCargaDiagnosticos,
        cantDiagnosticosNoValidados, diagnosticosCargados: diagnosticos !== null, diagnosticosAgrupadosPorUsuario
    }), [diagnosticosMapeados, error, manejadorCargaDiagnosticos, diagnosticos,
        cantDiagnosticosNoValidados, diagnosticosAgrupadosPorUsuario]);

    return value;
};