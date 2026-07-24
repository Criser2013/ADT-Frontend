import { Paciente } from "../../models"; 
import { useAuth } from "./auth-hook";
import { useCallback, useMemo, useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { validarId } from "../../utils/Validadores";


/**
 * Hook para realizar operaciones relacionadas con los pacientes.
 * @returns {Object} Objeto con las claves:
 * - "pacientes" (Array<Paciente>): Lista de pacientes.
 * - "mapeoPacientes" (Object): Objeto que mapea los IDs de pacientes a sus datos.
 * - "cargarDatos" (Function): Función para cargar los datos de los pacientes.
 * - "eliminarPacientes" (Function): Función para eliminar pacientes por sus IDs.
 * - "verPaciente" (Function): Función para ver los datos de un paciente por su ID.
 * - "cancelarPeticiones" (Function): Función para cancelar las peticiones en curso.
 * - "helperListo" (Boolean): Indica si el helper de datos está listo para usarse.
 * - "anadirPaciente" (Function): Función para añadir un nuevo paciente.
 * - "editarPaciente" (Function): Función para editar los datos de un paciente existente.
 */
export function usePacientes() {
    const { datosHelper } = useAuth();
    const [datos, setDatos] = useState([]);
    const helperListo = useMemo(() => datosHelper !== null, [datosHelper]);
    const mapeoPacientes = useMemo(() => {
        const mapeo = {};
        datos.forEach(paciente => {
            mapeo[paciente.id] = paciente;
        });
        return mapeo;
    }, [datos]);

    /**
     * @param {Paciente} paciente Objeto Paciente a añadir.
     * @returns {Promise<Object>} Objeto con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa.
     * - "error" (String) - Mensaje de error en caso de que la operación falle.
     */
    const anadirPaciente = useCallback(async (paciente) => {
        return await datosHelper.operacionSobreArchivo("añadir", { paciente });
    }, [datosHelper]);

    const cancelarPeticiones = useCallback(() => {
        datosHelper.cancelarPeticiones();
    }, [datosHelper]);

    /**
     * @returns {Promise<Object>} Objeto con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa.
     * - "error" (String) - Mensaje de error en caso de que la operación falle.
     * - "cancelled" (Boolean) - Indica si la operación fue cancelada por el usuario.
     */
    const cargarDatos = useCallback(async () => {
        const { success, error, data, cancelled }  = await datosHelper.descargarArchivoPacientes();
        if (!success) {
            setDatos([]);
        } else {
            setDatos(data);
        }
        return { success, error, cancelled };
    }, [datosHelper, setDatos]);

    /**
     * @param {String} id ID del paciente a editar.
     * @param {Paciente} paciente Objeto Paciente con los nuevos datos.
     * @returns {Promise<Object>} Objeto con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa.
     * - "error" (String) - Mensaje de error en caso de que la operación falle.
     */
    const editarPaciente = useCallback(async (id, paciente) => {
        return await datosHelper.operacionSobreArchivo("modificar", { id, paciente });
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

    /**
     * @param {String} id ID del paciente a ver.
     * @returns {Promise<Object>} En caso de error es un Objeto con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa.
     * - "error" (String) - Mensaje de error en caso de que la operación falle.
     * - "data" (Paciente) - Objeto Paciente correspondiente al ID proporcionado en caso de éxito.
     */
    const verPaciente = useCallback(async (id) => {
        return await datosHelper.operacionSobreArchivo("ver", { id });
    }, [datosHelper]);

    const value = useMemo(() => ({
        pacientes: datos, cargarDatos, eliminarPacientes, verPaciente, 
        cancelarPeticiones, helperListo, anadirPaciente, editarPaciente,
        mapeoPacientes
    }), [datos, cargarDatos, eliminarPacientes, verPaciente, mapeoPacientes,
        cancelarPeticiones, helperListo, anadirPaciente, editarPaciente]);
    return value;
};

/**
 * Hook para obtener los datos de un paciente específico.
 * @param {String} id UID del paciente a obtener.
 * @returns {Object} Objeto con las claves:
 * - "paciente" (Paciente|null): Objeto Paciente correspondiente al ID proporcionado o null si no se encuentra.
 * - "cargando" (Boolean): Indica si los datos del paciente están siendo cargados.
 */
export function usePaciente(id) {
    const navigate = useNavigate();
    const { verPaciente, helperListo, cancelarPeticiones } = usePacientes();
    const [cargando, setCargando] = useState(true);
    const [paciente, setPaciente] = useState(null);

    useEffect(() => {
        if (!id || !validarId(id)) {
            navigate("/pacientes");
            return;
        }
        if (!helperListo) return;
        let activo = true;
        async function cargar() {
            const { success, data, cancelled } = await verPaciente(id);
            if (!activo) return;
            if (success) {
                setPaciente(data);
                setCargando(false);
            } else if (!cancelled) {
                navigate("/pacientes");
            }
        }
        cargar();
        return () => {
            activo = false;
            cancelarPeticiones();
        };
    }, [id, helperListo, cancelarPeticiones, navigate, verPaciente]);

    return { paciente, cargando };
};