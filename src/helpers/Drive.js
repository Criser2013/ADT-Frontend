import { buscarArchivo, crearArchivo, descargarArchivo, subirArchivo } from '../services/Drive';
import { crearArchivoXlsx, leerArchivoXlsx } from "../utils/XlsxFiles";
import ArchivoPacientes from "../models/ArchivoPacientes";
import { DRIVE_FILENAME, DRIVE_FOLDER_NAME } from "../../constants";

export default class DriveProvider {
    #idArchivo = null;
    #archivo = null;
    #descargado = false;
    #token = null;

    constructor(token = null) {
        this.#token = token;
        this.#archivo = new ArchivoPacientes();
    };

    get descargado() {
        return this.#descargado;
    };

    set token(token) {
        this.#token = token;
    };

    /**
     * Verifica si existe un archivo en Google Drive con el nombre y tipo de archivo
     * especificado. Si existe, devuelve el ID del archivo, de lo contrario devuelve un error.
     * @param {String} nombre Nombre del archivo a verificar.
     * @param {Boolean} esCarpeta Indica si el archivo es una carpeta.
     * @param {String} idPadre ID de la carpeta padre (en caso de ser un archivo común).
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "data" (JSON) - Contiene el ID del archivo si la operación fue exitosa, de lo contrario es null.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     */
    async #verificarExistenciaArchivo(nombre, esCarpeta = false, idPadre = null) {
        let params = `name='${nombre}' and trashed=false`;
        params += (esCarpeta ? ` and mimeType='application/vnd.google-apps.folder'`
            : ` and mimeType!='application/vnd.google-apps.folder'`);

        const { success, data, error } = await buscarArchivo(params, this.#token);

        if (success && (data.files.length > 0)) {
            return { success: true, data: data.files[0] };
        } else if (success && (data.files.length == 0)) {
            return { success: false, error: "errArchivoInexistente" };
        } else {
            return { success: false, error: error };
        }
    }

    /**
     * @param {String} nombre Nombre del archivo a crear.
     * @param {Boolean} esCarpeta Indica si el archivo es una carpeta.
     * @param {String} idPadre ID de la carpeta padre (opcional).
     * @param {String} mimeType Tipo MIME del archivo. De forma predeterminada es un libro de Excel.
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "data" (JSON) - Contiene los metadatos del archivo creado si la operación fue exitosa, de lo contrario es null.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     */
    async #crearArchivo(nombre, esCarpeta = false, idPadre = "", mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        const mime = esCarpeta ? "application/vnd.google-apps.folder" : mimeType;
        const params = {
            name: nombre, parents: esCarpeta ? [] : [idPadre], mimeType: mime
        }
        const { success, data, error } = await crearArchivo(params, this.#token, esCarpeta);

        if (success && !esCarpeta) {
            this.#idArchivo = data.id;
        }

        return { success, data, error };
    };

    /**
     * @param {String} idArchivo ID del archivo donde subir el contenido.
     * @param {Uint8Array|File|Blob|ArrayBuffer} contenido Contenido a subir.
     * @param {String} mimeType Tipo MIME del contenido. De forma predeterminada es un stream de bytes.
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "data" (JSON) - Contiene los metadatos del archivo subido si la operación fue exitosa, de lo contrario es null.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     */
    async #subirArchivo(idArchivo, contenido, mimeType = "application/octet-stream") {
        let reintentos = 5;
        while (reintentos >= 0) {
            const { success, data, error } = await subirArchivo(idArchivo, contenido, this.#token, mimeType);
            if (success) {
                this.#idArchivo = data.id;
                return { success, data, error };
            }
            reintentos--;
        }
        return { success: false, error: "errSubidaArchivo" };
    };

    /**
     * @param {String} idArchivo ID del archivo a descargar.
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     */
    async #descargarArchivo(idArchivo) {
        const { success, data, error } = await descargarArchivo(idArchivo, this.#token);
        if (success) {
            this.#leerArchivo(data);
        }
        this.#descargado = true;
        return { success, error };
    };

    /**
     * @param {Uint8Array|File|Blob|ArrayBuffer} contenido Contenido del archivo.
     */
    #leerArchivo(contenido) {
        const { success, data, error } = leerArchivoXlsx(contenido, "Datos", "errLeerArchivo");
        if (success) {
            this.#archivo = ArchivoPacientes.fromJson(data);
        } else {
            this.#archivo = new ArchivoPacientes();
            this.error = error;
        }
    };

    /**
     * Crea la estructura de archivos en Google Drive (la carpeta de la aplicación y el archivo de pacientes).
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     */
    async #crearEstructuraArchivos() {
        const resCarpeta = await this.#crearArchivo(DRIVE_FOLDER_NAME, true);
        if (!resCarpeta.success) {
            return { success: false, error: resCarpeta.error };
        }
        const resArchivo = await this.#crearArchivo(DRIVE_FILENAME, false, resCarpeta.data.id);
        if (!resArchivo.success) {
            return { success: false, error: resArchivo.error };
        }

        this.#idArchivo = resArchivo.data.id;
        return { success: true };
    };

    /**
     * Verificar que la estructura de archivos en Google Drive exista (la carpeta de la aplicación y el archivo de pacientes).
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     */
    async #verificarEstructuraArchivos() {
        const resCarpeta = await this.#verificarExistenciaArchivo(DRIVE_FOLDER_NAME, true);
        if (!resCarpeta.success) {
            return { success: false, error: resCarpeta.error };
        }
        const resArchivo = await this.#verificarExistenciaArchivo(DRIVE_FILENAME, false);
        if (!resArchivo.success) {
            return { success: false, error: resArchivo.error };
        }
        this.#idArchivo = resArchivo.data.id;
        return { success: true };
    };

    /**
     * Verifica si la estructura de archivos en Google Drive existe y, si no, la crea.
     * Si existe, descarga el archivo de pacientes.
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     */
    async #actualizarEstado() {
        const { success } = await this.#verificarEstructuraArchivos();

        if (!success) {
            const res = await this.#crearEstructuraArchivos();
            if (!res.success) {
                return { success: false, error: res.error };
            }
        } else {
            const res = await this.#descargarArchivo(this.#idArchivo);
            if (!res.success) {
                return { success: false, error: res.error };
            }
        }
        return { success: true };
    };

    /**
     * Actualiza el archivo de pacientes en Google Drive con los datos actuales del archivo.
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     */
    async actualizarArchivo() {
        const contCrudo = this.#archivo.toJson();
        const contenido = crearArchivoXlsx(contCrudo, "Datos");

        const { success, data, error } = await this.#subirArchivo(this.#idArchivo, contenido.data);

        if (!success) {
            return { success: false, error: error };
        } else {
            return { success: true };
        }
    };

    /**
     * @param {Paciente} paciente Instancia de paciente a añadir.
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     */
    async anadirPaciente(paciente) {
        try {
            const resActualizacion = await this.#actualizarEstado();
            if (!resActualizacion.success) {
                return { success: false, error: resActualizacion.error };
            }
            this.#archivo.anadirPaciente(paciente);
            return await this.actualizarArchivo();
        } catch {
            return { success: false, error: "errPacienteDuplicado" };
        }
    };

    /**
     * Elimina pacientes del archivo de pacientes en Google Drive.
     * @param {Array} idPacientes Array con los IDs de los pacientes a eliminar.
     * @param {Boolean} varios Indica si se van a eliminar varios pacientes.
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     */
    async eliminarPacientes(idPacientes, varios = false) {
        try {
            const resActualizacion = await this.#actualizarEstado();
            if (!resActualizacion.success) {
                return { success: false, error: resActualizacion.error };
            }

            this.#archivo.eliminarPacientes(idPacientes, varios);
            return await this.actualizarArchivo();
        } catch {
            return { success: false, error: "errPacienteInexistente" };
        }
    };

    async modificarPaciente(id, paciente) {
        try {
            const resActualizacion = await this.#actualizarEstado();
            if (!resActualizacion.success) {
                return { success: false, error: resActualizacion.error };
            }

            this.#archivo.modificarPaciente(id, paciente);
            return await this.actualizarArchivo();

        } catch (error) {
            return error.message.includes("ya existe") ?
                { success: false, error: "errPacienteDuplicado" } :
                { success: false, error: "errPacienteInexistente" };
        }
    };

    async verPaciente(id) {
        try {
            const resActualizacion = await this.#actualizarEstado();
            if (!resActualizacion.success) {
                return { success: false, error: resActualizacion.error };
            }
            return await this.#archivo.verPaciente(id);
        } catch {
            return { success: false, error: "errPacienteInexistente" };
        }
    };

    /**
     * Crear una copia de los diagnósticos de la aplicación en Google Drive
     * @param {String} nombreArchivo Nombre del archivo a crear en Google Drive.
     * @param {Array<Object>} datos Arreglo de objetos con los datos a guardar en el archivo.
     * @param {String} tipo Tipo de archivo a crear ("xlsx" o "csv").
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     */
    async crearCopiaDiagnosticos(nombreArchivo, datos, tipo = "xlsx") {
        let idCarpeta = null;
        const existe = await this.#verificarExisteArchivo(DRIVE_FOLDER_NAME, true);

        if (!existe.success) {
            const resCarpeta = await this.#crearArchivo(DRIVE_FOLDER_NAME, true);

            if (!resCarpeta.success) {
                return { success: false, error: resCarpeta.error };
            }

            idCarpeta = resCarpeta.data.id;
        } else {
            idCarpeta = existe.data.files[0].id;
        }

        return await this.#guardarArchivoDiagnosticos(nombreArchivo, idCarpeta, datos, tipo);
    };

    /**
     * Guardar los diagnósticos de la aplicación en Google Drive
     * @param {String} nombreArchivo Nombre del archivo a crear en Google Drive.
     * @param {String} idCarpeta ID de la carpeta donde se guardará el archivo.
     * @param {Array<Object>} datos Arreglo de objetos con los datos a guardar en el archivo.
     * @param {String} tipo Tipo de archivo a crear ("xlsx" o "csv").
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     */
    async #guardarArchivoDiagnosticos(nombreArchivo, idCarpeta, datos, tipo) {
        let mimeType = (tipo == "csv") ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        let res = await this.#crearArchivo(nombreArchivo, false, idCarpeta, mimeType);

        if (!res.success) {
            return { success: false, error: res.error };
        }

        const binario = crearArchivoXlsx(datos, tipo);
        res = await this.#subirArchivo(res.data.id, binario.data, mimeType);

        return res;
    };
};