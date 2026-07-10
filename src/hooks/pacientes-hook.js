import { useAuth } from "./auth-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Hook para realizar operaciones relacionadas con los pacientes.
 * @param {import("react").SetStateAction} setCargando Función para actualizar el estado de carga.
 * @param {import("react").SetStateAction} setModalError Función para actualizar el estado del modal de error.
 * @returns {Object} Objeto con las claves:
 * - "pacientes" (Array<Paciente>) - Lista de pacientes.
 * - "cargarDatos" (Function) - Función para cargar los datos de los pacientes.
 * - "eliminarPacientes" (Function) - Función para eliminar pacientes por sus IDs.
 */
export default function usePacientes({ setCargando, setModalError }) {
    const { datosHelper } = useAuth();
    const { t } = useTranslation();
    const [datos, setDatos] = useState([]);
    const cargarDatos = useCallback(async () => {
        const res = await datosHelper.descargarArchivoPacientes();
        if (!res.success) {
            setDatos([]);
            setModalError((x) => ({ ...x, mostrar: true, texto: t(res.error) }));
        } else {
            setDatos(datosHelper.pacientes);
        }

        setCargando(false);
    }, [datosHelper, setModalError, setDatos, setCargando, t]);

    /**
     * @param {String} id ID del paciente a ver.
     */
    const verPaciente = useCallback(async (id) => {
        return await datosHelper.operacionSobreArchivo("ver", { id });
    }, [datosHelper]);

    /**
     * @param {Array<String>|String} idsPacientes Arreglo con los IDs de pacientes a eliminar o el ID
     * del paciente a eliminar en caso de solo ser 1.
     */
    const eliminarPacientes = useCallback(async (idsPacientes) => {
        const res = await datosHelper.operacionSobreArchivo("eliminar", { idPacientes: idsPacientes, varios: Array.isArray(idsPacientes) });
        if (!res.success) {
            setModalError((x) => ({ ...x, mostrar: true, texto: t(res.error) }));
            setCargando(false);
        } else {
            await cargarDatos();
        }

        return res.success;
    }, [datosHelper, setModalError, setCargando, cargarDatos, t]);

    useEffect(() => {
        if (datosHelper) {
            cargarDatos();
            return () => {
                datosHelper.cancelarPeticiones();
            }; 
        }
    }, [datosHelper, cargarDatos]);

    const value = useMemo(() => ({
        pacientes: datos, cargarDatos, eliminarPacientes, verPaciente
    }), [datos, cargarDatos, eliminarPacientes, verPaciente]);

    return value;
};