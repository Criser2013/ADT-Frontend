import { createContext, useState, useContext, useEffect } from "react";
import { crearArchivoXlsx, leerArchivoXlsx } from "../utils/XlsxFiles";
import { crearArchivo, buscarArchivo, crearCargaResumible, subirArchivoResumible, descargarArchivo } from "../services/Drive";
import { DRIVE_FILENAME, DRIVE_FOLDER_NAME } from "../../constants";

export const driveContext = createContext();

/**
 * Otorga acceso al contexto de Drive de la aplicación.
 * @returns React.Context<NavegacionContextType>
 */
export const useDrive = () => {
    const context = useContext(driveContext);
    if (!context) {
        console.log("Error creando el contexto.");
    }
    return context;
};

/**
 * Proveedor del contexto que almacena el estado de Drive.
 * @param {JSX.Element} children
 * @returns JSX.Element
 */
export function DriveProvider({ children }) {
    const [archivoId, setArchivoId] = useState(null);
    const [carpetaId, setCarpetaId] = useState(null);
    const [datos, setDatos] = useState([]);
    const [token, setToken] = useState(null);
    const [descargando, setDescargando] = useState(true);

    useEffect(() => {
        if (token != null) {
            verificarExisteArchivoYCarpeta(token).then((res) => {
                if (res.success) {
                    descargarContArchivo(res.data);
                } else {
                    setDatos([]);
                }
                setDescargando(false);
            });
        }
    }, [token]);

    /**
     * Verifica si un archivo o carpeta existe en Google Drive.
     * @param {String} idArchivo - ID del archivo o carpeta a verificar.
     * @param {String} nombre - Nombre del archivo o carpeta a verificar.
     * @param {Boolean} esCarpeta - Indicador si el archivo es una carpeta.
     * @returns JSON
     */
    const verificarExisteArchivo = async (nombre, esCarpeta = false, carpeta = "") => {
        let params = `name='${nombre}' and trashed=false`;

        if (esCarpeta) {
            params += ` and mimeType='application/vnd.google-apps.folder'`;
        } else {
            params += ` and mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' and '${carpeta}' in parents`;
        }

        const busq = await buscarArchivo(params, token);

        if (busq.success && busq.data.files.length > 0) {
            return { success: true, data: busq.data, error: null };
        } else if (busq.success && busq.data.length === 0) {
            return { success: false, data: null, error: "Archivo no encontrado" };
        } else {
            return { success: false, data: null, error: busq.error };
        }
    };

    /**
     * Crea un archivo o carpeta en Google Drive.
     * @param {String} nombre - Nombre del archivo o carpeta a crear.
     * @param {Boolean} esCarpeta - Indicador si el archivo es una carpeta.
     * @returns 
     */
    const crearArchivoMeta = async (nombre, esCarpeta = false, carpeta = "") => {
        const res = await crearArchivo({
            name: nombre, parents: !esCarpeta ? [carpeta] : []
        }, token, esCarpeta);

        if (res.success && !esCarpeta) {
            setArchivoId(res.data.id);
            return { success: true, data: res.data };
        } else if (res.success && esCarpeta) {
            setCarpetaId(res.data.id);
            return { success: true, data: res.data };
        } else {
            return res;
        }
    };

    /**
     * Sube el contenido del archivo a Google Drive.
     * @param {Uint8Array|File|Blob} archivo - Contenido del archivo a subir.
     * @returns JSON
     */
    const subirArchivo = async (archivo) => {
        const urlCarga = await crearCargaResumible(archivoId, token);
        if (urlCarga.success) {
            let reintentos = 3;
            while (reintentos > 0) {
                const res = await subirArchivoResumible(urlCarga.data, archivo, token);
                if (res.success) {
                    setArchivoId(res.data.id);
                    return res;
                } else if (!res.success && !res.error.includes("Carga resumible incompleta")) {
                    return res;
                } else {
                    reintentos--;
                }
            }
        } else {
            return urlCarga;
        }
    };

    /**
     * Descarga el contenido del archivo de Google Drive y lo convierte a un Array de JSON.
     * @returns JSON
     */
    const descargarContArchivo = async (archivoId) => {
        setDescargando(true);

        const existe = await verificarExisteArchivoYCarpeta(token);

        if (!existe.success) {
            setDatos([]);
            return { success: false, error: existe.error };
        }

        const pet = await descargarArchivo(archivoId, token);

        if (pet.success) {
            let intentos = 3;

            while (intentos > 0) {
                const datosArchivo = leerArchivoXlsx(pet.data);
                if (datosArchivo.success) {
                    setDatos(datosArchivo.data);
                    return { success: true, data: null };
                }
                intentos--;
            }
            setDatos([]);
            return { success: false, error: "Error al leer el archivo" };
        } else {
            setDatos([]);
            return { success: false, error: pet.error };
        }
    };

    /**
     * Guarda los datos de los pacientes en una hoja de Excel en Google Drive.
     * @param {String} instancia - Datos del paciente a guardar.
     * @returns JSON
     */
    const anadirPaciente = async (instancia) => {
        let tabla = datos;
        const existe = await verificarExisteArchivoYCarpeta();

        if (!existe.success) {
            return { success: false, error: "Se ha producido un error al verificar o crear el archivo y la carpeta. Reintente nuevamente." };
        } else {
            const pet = await descargarArchivo(archivoId, token);
            if (!pet.success) {
                return { success: false, error: pet.error };
            }

            tabla = leerArchivoXlsx(pet.data).data;
        }

        tabla.push(instancia);
        setDatos(tabla);

        const binario = crearArchivoXlsx(tabla);
        const res = await subirArchivo(binario.data);
        if (res.success) {
            return { success: true, data: "Archivo guardado correctamente" };
        } else {
            return { success: false, error: res.error };
        }
    };

    /**
     * Crea la carpeta y el archivo de pacientes en Google Drive.
     * @returns JSON
     */
    const crearCarpetaYArchivo = async () => {
        const petCrearCarp = await crearArchivoMeta(DRIVE_FOLDER_NAME, true);
        if (!petCrearCarp.success) {
            return { success: false, error: petCrearCarp.error };
        } else {
            setCarpetaId(petCrearCarp.data.id);
        }

        const petCrearArch = await crearArchivoMeta(DRIVE_FILENAME, false, petCrearCarp.data.id);
        if (!petCrearArch.success) {
            return { success: false, error: petCrearArch.error };
        } else {
            setArchivoId(petCrearArch.data.id);
        }

        return { success: true, data: "Carpeta y archivo creados correctamente" };
    };

    /**
     * Verifica si existe el archivo y la carpeta en Google Drive.
     * de no existir alguno de ellos, los crea.
     * @returns JSON
     */
    const verificarExisteArchivoYCarpeta = async () => {
        const existeCarpeta = await verificarExisteArchivo(DRIVE_FOLDER_NAME, true);
        const idCarpeta = (existeCarpeta.data != null) ? existeCarpeta.data.files[0].id : null;

        if (existeCarpeta.success) {
            setCarpetaId(existeCarpeta.data.files[0].id);

            const busquedaArchivo = await verificarExisteArchivo(DRIVE_FILENAME, false, idCarpeta);
            if (busquedaArchivo.success && busquedaArchivo.data.files.length > 0) {
                setArchivoId(busquedaArchivo.data.files[0].id);
                return { success: true, data: busquedaArchivo.data.files[0].id };
            } else {
                return await crearArchivoMeta(DRIVE_FILENAME, false, idCarpeta);
            }
        } else {
            return await crearCarpetaYArchivo();
        }
    };

    /**
     * Verifica si el paciente ya está registrado.
     * @param {String} cedula - Cédula del paciente a verificar.
     * @returns Boolean
     */
    const verificarExistePaciente = (cedula) => {
        for (const i of datos) {
            if (i.cedula == cedula) {
                return true;
            }
        }
        return false;
    };

    return (
        <driveContext.Provider value={{ anadirPaciente, descargarContArchivo, verificarExistePaciente, setToken, descargando }}>
            {children}
        </driveContext.Provider>
    );
}