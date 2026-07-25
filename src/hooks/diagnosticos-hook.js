import useIdioma from "./idioma-hook";

import { DiagnosticosHelper } from "../helpers";
import { useAppConfig } from "./appConfig-hook";
import { useAuth } from "./auth-hook";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from "react-router";
import { usePaciente, usePacientes } from "./pacientes-hook";
import { useUsuario, useUsuarios } from "./usuarios-hook";


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

/**
 * @param {String} id ID del diagnóstico a consultar.
 * @param {Boolean} traerInfoPersona Indica si se debe traer la información del paciente y usuario relacionados al diagnóstico.
 * @returns {Object} Objeto con las claves:
 * - "diagnostico" (Diagnostico|null) - Instancia de Diagnostico correspondiente al ID proporcionado o null si no se encuentra.
 * - "paciente" (Paciente|null) - Instancia de Paciente correspondiente al diagnóstico o null si no se encuentra.
 * - "usuario" (Usuario|null) - Instancia de Usuario correspondiente al diagnóstico o null si no se encuentra.
 * - "error" (String|null) - Mensaje de error en caso de que la operación falle, sino null.
 */
export function useDiagnostico(id, traerInfoPersona = false) {
    const navigate = useNavigate();
    const { establecerPaciente, manejadorCargaPaciente, paciente } = usePaciente(id, false);
    const { manejadorCargaUsuario, usuario } = useUsuario(id, false);
    const { usuario: usuarioAutenticado, usuariosListo } = useAuth();
    const { verDiagnostico, helperListo: diagnosticosListo } = useOperacionesDiagnosticos();
    const [diagnostico, setDiagnostico] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function cargarPaciente(esAnonimo) {
            if (esAnonimo) {
                establecerPaciente(esAnonimo);
                return;
            }

            const { success, error } = await manejadorCargaPaciente();
            if (!success) {
                establecerPaciente(false);
                setError(error);
            }
        }

        if (diagnosticosListo && diagnostico && !usuario?.rolVisible && traerInfoPersona) {
            const esAnonimo = !diagnostico.paciente;
            cargarPaciente(esAnonimo);
        }
    }, [
        diagnostico, usuario?.rolVisible, establecerPaciente, 
        manejadorCargaPaciente, traerInfoPersona, diagnosticosListo
    ]);

    useEffect(() => {
        async function cargarUsuario() {
            const { success, error } = await manejadorCargaUsuario();

            if (!success) {
                setError(error);
            }
        };

        if (usuariosListo && usuarioAutenticado?.rolVisible && traerInfoPersona) {
            cargarUsuario();
        }
    }, [usuarioAutenticado?.rolVisible, traerInfoPersona, manejadorCargaUsuario, usuariosListo]);

    useEffect(() => {
        async function cargarDiagnostico(id) {
            const { success, data, error } = await verDiagnostico(id);
            if (success) {
                setDiagnostico(data);
                setError(null);
            } else {
                setError(error);
            }
        };
        if (diagnosticosListo && !diagnostico) {
            cargarDiagnostico(id);
        }
    }, [diagnosticosListo, diagnostico, navigate, id, verDiagnostico]);
    
    return { diagnostico, paciente, usuario, error };
};

export function useDiagnosticos(verTodos, uid = null, fecha = null, traerInfoPersona = false) {
    const { manejadorCargaPacientes, pacientes } = usePacientes(false);
    const { manejadorCargaUsuarios, usuarios } = useUsuarios(false);
    const { usuario, usuariosListo } = useAuth();
    const { verDiagnosticos, helperListo: diagnosticosListo } = useOperacionesDiagnosticos();
    const [diagnosticos, setDiagnosticos] = useState(null);
    const [error, setError] = useState(null);
    const mapeoDiagnosticos = useMemo(() => {
        const mapeo = {};
        if (diagnosticos) {
            for (const d of diagnosticos) {
                mapeo[d.id] = d;
            }
        }
        return mapeo;
    }, [diagnosticos]);

    useEffect(() => {
        async function cargarPacientes() {
            const { success, error } = await manejadorCargaPacientes();
            if (!success) {
                setError(error);
            }
        };

        if (diagnosticosListo && !usuario?.rolVisible && traerInfoPersona) {
            cargarPacientes();
        }
    }, [usuario?.rolVisible, manejadorCargaPacientes, traerInfoPersona, diagnosticosListo]);

    useEffect(() => {
        async function cargarUsuarios() {
            const { success, error } = await manejadorCargaUsuarios();

            if (!success) {
                setError(error);
            }
        };

        if (usuariosListo && usuario?.rolVisible && traerInfoPersona) {
            cargarUsuarios();
        }
    }, [usuario?.rolVisible, traerInfoPersona, manejadorCargaUsuarios, usuariosListo]);

    useEffect(() => {
        async function cargarDiagnosticos(verTodos, uid, fecha) {
            const { success, data, error } = await verDiagnosticos(verTodos, uid, fecha);
            if (success) {
                setDiagnosticos(data);
                setError(null);
            } else {
                setDiagnosticos([]);
                setError(error);
            }
        };
        if (diagnosticosListo && !diagnosticos) {
            cargarDiagnosticos(verTodos, uid, fecha);
        }
    }, [diagnosticosListo, verDiagnosticos, verTodos, uid, fecha, diagnosticos]);
    
    return { diagnosticos, pacientes, usuarios, error, mapeoDiagnosticos };
};