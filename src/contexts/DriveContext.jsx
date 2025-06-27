import { createContext, useState, useContext, useEffect } from "react";
import { crearArchivoXlsx, leerArchivoXlsx } from "../utils/XlsxFiles";
import { crearArchivo, buscarArchivo, crearCargaResumible, subirArchivoResumible } from "../services/Drive";
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

    useEffect(() => {
        if (token != null){
            verificarExisteArchivoYCarpeta(token);
            descargarArchivo(token);
        }
    }, [token]);

    /**
     * Verifica si un archivo o carpeta existe en Google Drive.
     * @param {String} idArchivo - ID del archivo o carpeta a verificar.
     * @param {String} nombre - Nombre del archivo o carpeta a verificar.
     * @param {String} token - Token OAuth de Google.
     * @param {Boolean} esCarpeta - Indicador si el archivo es una carpeta.
     * @returns JSON
     */
    const verificarExisteArchivo = async (nombre, token, esCarpeta = false) => {
        let params = `name='${nombre}'`;

        if (esCarpeta) {
            params += `&mimeType='application/vnd.google-apps.document'`;
        } else {
            params += "&mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'";
        }

        const busq = await buscarArchivo(params, token);

        if (busq.success && busq.data.length > 0) {
            return { success: true, data: null, error: null };
        } else if (busq.success && busq.data.length === 0) {
            return { success: false, data: null, error: "Archivo no encontrado" };
        } else {
            return { success: false, data: null, error: busq.error };
        }
    };

    /**
     * Crea un archivo o carpeta en Google Drive.
     * @param {String} nombre - Nombre del archivo o carpeta a crear.
     * @param {String} token - Token OAuth de Google.
     * @param {Boolean} esCarpeta - Indicador si el archivo es una carpeta.
     * @returns 
     */
    const crearArchivoMeta = async (nombre, token, esCarpeta = false) => {
        const res = await crearArchivo({
            name: nombre, parents: !esCarpeta ? [carpetaId] : []
        }, token, esCarpeta);

        if (res.success && !esCarpeta) {
            setArchivoId(res.data.id);
            return { success: true, data: "Archivo creado" };
        } else if (res.success && esCarpeta) {
            setCarpetaId(res.data.id);
            return { success: true, data: "Carpeta creada" };
        } else {
            return res;
        }
    };

    /**
     * Sube el contenido del archivo a Google Drive.
     * @param {Uint8Array|File|Blob} archivo - Contenido del archivo a subir.
     * @param {String} token - Token OAuth de Google.
     * @returns JSON
     */
    const subirArchivo = async (archivo, token) => {
        const urlCarga = await crearCargaResumible(archivoId, token);
        if (urlCarga.success) {
            let reintentos = 3;
            while (reintentos > 0) {
                const res = await subirArchivoResumible(urlCarga.data, archivo, token);
                if (res.success) {
                    setArchivoId(res.data.id);
                    return res;
                } else if (!res.success && res.error.includes("40")) {
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
     * @param {String} token - Token OAuth de Google.
     * @returns JSON
     */
    const descargarArchivo = async (token) => {
        const pet = await descargarArchivo(archivoId, token);
        if (pet.success) {
            let intentos = 3;
            const arr = new Uint8Array(await pet.data.arrayBuffer());

            while (intentos > 0) {
                const datosArchivo = leerArchivoXlsx(arr);
                if (datosArchivo.success) {
                    setDatos(datosArchivo.data);
                    return { success: true, data: null };
                }
                intentos--;
            }

            return { success: false, error: "Error al leer el archivo" };
        } else {
            return { success: false, error: pet.error };
        }
    };

    /**
     * Guarda los datos de los pacientes en una hoja de Excel en Google Drive.
     * @param {String} token - Token OAuth de Google.
     * @returns JSON
     */
    const guardarArchivo = async (token) => {
        const binario = crearArchivoXlsx(datos);
        const existe = await verificarExisteArchivo(archivoId, DRIVE_FILENAME, token);

        if (!existe.success) {
            const petCrearArch = await crearArchivoMeta(DRIVE_FILENAME, token);
            if (!petCrearArch.success) {
                return { success: false, error: petCrearArch.error };
            }
        }

        const res = await subirArchivo(binario, token);
        if (res.success) {
            return { success: true, data: "Archivo guardado correctamente" };
        } else {
            return { success: false, error: res.error };
        }
    };

    /**
     * Crea la carpeta y el archivo de pacientes en Google Drive.
     * @param {String} token - Token OAuth de Google.
     * @returns JSON
     */
    const crearCarpetaYArchivo = async (token) => {
        const petCrearCarp = await crearArchivoMeta(DRIVE_FOLDER_NAME, token, true);
        if (!petCrearCarp.success) {
            return { success: false, error: petCrearCarp.error };
        } else {
            setCarpetaId(petCrearCarp.data.id);
        }

        const petCrearArch = await crearArchivoMeta(DRIVE_FILENAME, token);
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
     * @param {String} token - Token OAuth de Google.
     * @returns JSON
     */
    const verificarExisteArchivoYCarpeta = async (token) => {
        const existeCarpeta = await verificarExisteArchivo(DRIVE_FOLDER_NAME, token, true);
        if (existeCarpeta.success) {
            setCarpetaId(existeCarpeta.data.id);

            const busquedaArchivo = await verificarExisteArchivo(DRIVE_FILENAME, token);
            if (busquedaArchivo.success && busquedaArchivo.data.length > 0) {
                setArchivoId(busquedaArchivo.data[0].id);
                return { success: true, data: "Archivo y carpeta encontrados" };
            } else {
                return await crearArchivoMeta(DRIVE_FILENAME, token);
            }
        } else {
            return await crearCarpetaYArchivo(token);
        }
    };

    return (
        <driveContext.Provider value={{ guardarArchivo, descargarArchivo, setToken }}>
            {children}
        </driveContext.Provider>
    );
}