import { useAuth } from "./auth-hook";
import { useCallback, useMemo, useState } from "react";

/**
 * Hook para realizar operaciones relacionadas con los pacientes.
 * @returns {Object} Objeto con las claves:
 * - "pacientes" (Array<Paciente>): Lista de pacientes.
 * - "cargarDatos" (Function): Función para cargar los datos de los pacientes.
 * - "eliminarPacientes" (Function): Función para eliminar pacientes por sus IDs.
 * - "verPaciente" (Function): Función para ver los datos de un paciente por su ID.
 * - "cancelarPeticiones" (Function): Función para cancelar las peticiones en curso.
 * - "helperListo" (Boolean): Indica si el helper de datos está listo para usarse.
 */
export default function usePacientes() {
    const { datosHelper } = useAuth();
    const [datos, setDatos] = useState([]);
    const helperListo = useMemo(() => datosHelper !== null, [datosHelper]);

    /**
     * @returns {Promise<Object>} Objeto con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa.
     * - "error" (String) - Mensaje de error en caso de que la operación falle.
     */
    const cargarDatos = useCallback(async () => {
        const res = await datosHelper.descargarArchivoPacientes();
        if (!res.success) {
            setDatos([]);
        } else {
            setDatos(datosHelper.pacientes);
        }
        return res;
    }, [datosHelper, setDatos]);

    /**
     * @param {String} id ID del paciente a ver.
     * @returns {Promise<Object>|Paciente} En caso de error es un Objeto con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa.
     * - "error" (String) - Mensaje de error en caso de que la operación falle.
     * En caso de éxito es el objeto Paciente correspondiente al ID proporcionado.
     */
    const verPaciente = useCallback(async (id) => {
        return await datosHelper.operacionSobreArchivo("ver", { id });
    }, [datosHelper]);

    /**
     * @param {Array<String>|String} idsPacientes Arreglo con los IDs de pacientes a eliminar o el ID
     * del paciente a eliminar en caso de solo ser 1.
     * @returns {Promise<Object>} Objeto con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa.
     * - "error" (String) - Mensaje de error en caso de que la operación falle.
     */
    const eliminarPacientes = useCallback(async (idsPacientes) => {
        return await datosHelper.operacionSobreArchivo("eliminar", 
            { idPacientes: idsPacientes, varios: Array.isArray(idsPacientes) }
        );
    }, [datosHelper]);

    const cancelarPeticiones = useCallback(() => {
        datosHelper.cancelarPeticiones();
    }, [datosHelper]);

    const value = useMemo(() => ({
        pacientes: datos, cargarDatos, eliminarPacientes, verPaciente, 
        cancelarPeticiones, helperListo
    }), [datos, cargarDatos, eliminarPacientes, verPaciente, cancelarPeticiones, helperListo]);

    return value;
};