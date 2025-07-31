import { createContext, useState, useContext, useEffect } from "react";
import { crearArchivoXlsx, leerArchivoXlsx } from "../utils/XlsxFiles";
import { crearArchivo, buscarArchivo, crearCargaResumible, subirArchivoResumible, descargarArchivo } from "../services/Drive";
import { DRIVE_FILENAME, DRIVE_FOLDER_NAME } from "../../constants";
import { oneHotInversoOtraEnfermedad, quitarDatosPersonales } from "../utils/TratarDatos";

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
    const [datos, setDatos] = useState(null);
    const [token, setToken] = useState(null);
    const [descargando, setDescargando] = useState(true);

    useEffect(() => {
        if (token != null) {
            cargarDatos(token);
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
     * @param {String} carpeta - ID de la carpeta donde se creará el archivo (opcional).
     * @param {String} mimeType - Tipo MIME del archivo (opcional). De forma predeterminada es un archivo de Excel.
     * @returns JSON
     */
    const crearArchivoMeta = async (nombre, esCarpeta = false, carpeta = "", mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") => {
        const res = await crearArchivo({
            name: nombre, parents: !esCarpeta ? [carpeta] : [],
            mimeType: mimeType
        }, token, esCarpeta);

        if (res.success && !esCarpeta) {
            setArchivoId(res.data.id);
            return { success: true, data: res.data };
        } else if (res.success && esCarpeta) {
            return { success: true, data: res.data };
        } else {
            return res;
        }
    };

    /**
     * Sube el contenido del archivo a Google Drive.
     * @param {String} archivoId - ID del archivo a subir.
     * @param {Uint8Array|File|Blob} datos - Contenido del archivo a subir.
     * @param {String} mimeType - Tipo MIME del archivo. Por defecto es binario.
     * @returns JSON
     */
    const subirArchivo = async (archivoId, datos, mimeType = "application/octet-stream") => {
        const urlCarga = await crearCargaResumible(archivoId, token);
        if (urlCarga.success) {
            let reintentos = 3;
            while (reintentos > 0) {
                const res = await subirArchivoResumible(urlCarga.data, datos, token, mimeType);
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
        if (token != null) {
            setDescargando(true);
            const existe = await verificarExisteArchivoYCarpeta(token);

            if (!existe.success) {
                setDatos([]);
                return { success: false, error: existe.error };
            }

            const pet = await descargarArchivo(archivoId, token);

            if (pet.success) {
                const datosArchivo = leerArchivoXlsx(pet.data);
                if (datosArchivo.success) {
                    setDatos(datosArchivo.data);
                    return { success: true, data: null };
                }
                setDatos([]);
                return { success: false, error: "Error al leer el archivo" };
            } else {
                setDatos([]);
                return { success: false, error: pet.error };
            }
        }
    };

    /**
     * Guarda los datos de los pacientes en una hoja de Excel en Google Drive.
     * @param {String} instancia - Datos del paciente a guardar.
     * @param {Boolean} esEditar - Indica si se está añadiendo o editando un paciente.
     * @returns JSON
     */
    const anadirPaciente = async (instancia, esEditar = false, prevCedula = null) => {
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

        const yaExiste = verificarExistePaciente(instancia.cedula, tabla);
        if (yaExiste && (!esEditar || (esEditar && instancia.cedula != prevCedula))) {
            return { success: false, error: "El paciente ya está registrado" };
        }

        if (esEditar) {
            const indice = tabla.findIndex((paciente) => paciente.cedula == prevCedula);
            if (prevCedula != null && instancia.cedula != prevCedula) {
                tabla.splice(indice, 1, instancia);
            } else {
                tabla[indice] = instancia;
            }
        } else {
            tabla.push(instancia);
        }

        const binario = crearArchivoXlsx(tabla);
        const res = await subirArchivo(archivoId, binario.data);
        if (res.success) {
            setDatos(tabla);
            return { success: true, data: "Archivo guardado correctamente" };
        } else {
            return { success: false, error: res.error };
        }
    };

    /**
     * Elimina un paciente del documento en Google Drive.
     * @param {String|Array[String]} cedula - Cédula del paciente a eliminar.
     * @param {Boolean} varios - Indica si se están eliminando varios pacientes.
     * @returns JSON
     */
    const eliminarPaciente = async (cedula, varios = false) => {
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

        if (varios) {
            const aux = [];
            let cont = 0;
            for (let i = 0; i < tabla.length; i++) {
                for (const j of cedula) {
                    if (tabla[i].cedula == j) {
                        aux.push(i);
                    }
                }
            }

            for (const i of aux) {
                tabla.splice(i - cont, 1);
                cont++;
            }
        } else {
            const indice = tabla.findIndex((paciente) => paciente.cedula == cedula);
            if (indice == -1) {
                return { success: false, error: "Paciente no encontrado" };
            } else {
                tabla.splice(indice, 1);
            }

        }

        const binario = crearArchivoXlsx(tabla);
        const res = await subirArchivo(archivoId, binario.data);
        if (res.success) {
            setDatos(tabla);
            return { success: true, data: "Archivo guardado correctamente" };
        } else {
            return { success: false, error: res.error };
        }
    };

    /**
     * Carga los datos de un paciente a partir de su cédula.
     * @param {String} cedula - Cédula del paciente a cargar.
     * @returns JSON
     */
    const cargarDatosPaciente = (cedula) => {
        const indice = datos != null ? datos.findIndex((paciente) => paciente.cedula == cedula) : -1;

        if (indice == -1) {
            return { success: false };
        }

        const datosPersonales = quitarDatosPersonales(datos[indice]);
        const comorbilidades = oneHotInversoOtraEnfermedad(datos[indice]);

        return { success: true, data: { personales: datosPersonales, comorbilidades } };
    };

    /**
     * Crea la carpeta y el archivo de pacientes en Google Drive.
     * @returns JSON
     */
    const crearCarpetaYArchivo = async () => {
        const petCrearCarp = await crearArchivoMeta(DRIVE_FOLDER_NAME, true);
        if (!petCrearCarp.success) {
            return { success: false, error: petCrearCarp.error };
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
     * @param {Array} datos - Lista de pacientes registrados.
     * @returns Boolean
     */
    const verificarExistePaciente = (cedula, datos) => {
        for (const i of datos) {
            if (i.cedula == cedula) {
                return true;
            }
        }
        return false;
    };

    /**
     * Carga los datos del archivo de pacientes desde Google Drive.
     */
    const cargarDatos = async () => {
        let respuesta = null;
        setDescargando(true);
        const res = await verificarExisteArchivoYCarpeta(token);
        if (res.success) {
            respuesta = await descargarContArchivo(res.data);
        } else {
            setDatos([]);
            respuesta = { success: false, error: res.error };
        }
        setDescargando(false);

        return respuesta;
    };

    /**
     * Crea una copia de los diagnósticos en Google Drive
     * @param {String} nombreArchivo - Nombre del archivo a crear.
     * @param {Array[JSON]} datos - Datos a guardar en el archivo.
     * @param {String} tipo - Tipo de archivo a crear (xlsx o csv).
     * @returns JSON
     */
    const crearCopiaDiagnosticos = async (nombreArchivo, datos, tipo) => {
        let auxCarpeta = null;
        const existe = await verificarExisteArchivo(DRIVE_FOLDER_NAME, true);

        if (!existe.success) {
            const res = await crearArchivoMeta(DRIVE_FOLDER_NAME, true);

            if (!res.success) {
                return { success: false, error: res.error };
            }
            auxCarpeta = res.data.id;
        } else {
            const id =  existe.success ? existe.data.files[0].id : auxCarpeta;
            return await guardarArchivoDiagnostico(nombreArchivo, id, datos, tipo);
        }
    };

    /**
     * Guarda un archivo de diagnósticos en Google Drive.
     * @param {String} nombreArchivo - Nombre del archivo a crear.
     * @param {String} idCarpeta - ID de la carpeta donde se guardará el archivo.
     * @param {Array[JSON]} datos - Datos a guardar en el archivo.
     * @param {String} tipo - Tipo de archivo a crear (xlsx o csv).
     * @returns JSON
     */
    const guardarArchivoDiagnostico = async (nombreArchivo, idCarpeta, datos, tipo) => {
        let mimeType = (tipo == "csv") ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        let res = await crearArchivoMeta(nombreArchivo, false, idCarpeta, mimeType);

        if (!res.success) {
            return { success: false, error: res.error };
        }

        const binario = crearArchivoXlsx(datos, tipo);
        res = await subirArchivo(res.data.id, binario.data, mimeType);

        return res;
    };

    return (
        <driveContext.Provider value={{
            anadirPaciente, descargarContArchivo, setToken, descargando, cargarDatosPaciente,
            eliminarPaciente, cargarDatos, datos, crearCopiaDiagnosticos
        }}>
            {children}
        </driveContext.Provider>
    );
}