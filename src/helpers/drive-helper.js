import { ArchivoPacientes }  from "../models";
import { buscarArchivo, crearArchivo, descargarArchivo, subirArchivo } from '../services/Drive';
import { crearArchivoXlsx, leerArchivoXlsx } from "../utils/XlsxFiles";
import { DRIVE_FILENAME, DRIVE_FOLDER_NAME } from "../constants";

export default class DriveHelper {
    #idArchivo = null;
    #idCarpeta = null;
    #archivo = new ArchivoPacientes();
    #token = null;
    #peticiones = [];

    constructor(token = null) {
        this.#token = token;
    };

    set token(token) {
        this.#token = token;
    };

    /**
     * Cancela todas las peticiones pendientes a Google Drive. Se utiliza para evitar que se sigan 
     * ejecutando peticiones cuando el usuario cierra sesión o se desconecta de la aplicación. Especialmente 
     * para usarse en el useEffect de los componentes que hacen uso de la clase DriveHelper.
     */
    cancelarPeticiones() {
        for (const peticion of this.#peticiones) {
            peticion.abort();
        }
        this.#peticiones = [];
    };

    /**
     * Crear una copia de los diagnósticos de la aplicación en Google Drive.
     * @param {String} nombreArchivo Nombre del archivo a crear en Google Drive.
     * @param {Array<Object>} datos Arreglo de objetos con los datos a guardar en el archivo.
     * @param {String} tipo Tipo de archivo a crear ("xlsx" o "csv").
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     */
    async crearCopiaDiagnosticos(nombreArchivo, datos, tipo) {
        const { data, success } = await this.#verificarExistenciaArchivo(DRIVE_FOLDER_NAME, true);
        this.#idCarpeta = success ? data.id : null;

        if (!success) {
            const resCarpeta = await this.#crearArchivo(DRIVE_FOLDER_NAME, true);

            if (!resCarpeta.success) {
                return { success: false, error: resCarpeta.error };
            }

            this.#idCarpeta = resCarpeta.data.id;
        }

        return await this.#subirCopiaDiagnosticos(nombreArchivo, this.#idCarpeta, datos, tipo);
    };

    /**
     * Descarga el archivo de pacientes desde Google Drive y lo hace accesible mediante el 
     * atributo "pacientes". En caso de no existir el archivo, se crea uno nuevo y vacío.
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "data" (Array<Paciente>) - Contiene un array con las instancias de la clase Paciente si la operación fue exitosa, 
     * de lo contrario es null.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     * - "cancelled" (Boolean) - Indica si la operación fue cancelada por el usuario.
     */
    async descargarArchivoPacientes() {
        const { success, error, cancelled } = await this.#actualizarEstado();
        if (success) {
            return { success, data: this.#archivo.pacientes};
        } else {
            return { success, error, cancelled };
        }
    };

    /**
     * Función gneérica para ejecutar operaciones sobre el archivo de pacientes en Google Drive. 
     * @param {String} tipo Tipo de operación a ejecutar, las opciones disponibles son: "añadir", "ver", "eliminar", "modificar" y "verTodos".
     * @param {Object} parametros Parámetros de la operación a ejecutar. Dependiendo del tipo de operación, los parámetros pueden variar:
     * - Para "añadir": { paciente: Paciente } - Objeto con los datos del paciente a añadir.
     * - Para "ver": { id: String } - ID del paciente a ver.
     * - Para "eliminar": { idPacientes: Array<String>, varios: Boolean } - Arreglo con los IDs de los pacientes a eliminar y un indicador si son varios.
     * - Para "modificar": { id: String, paciente: Paciente } - ID del paciente a modificar y el objeto con los nuevos datos del paciente.
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     * - "data" (Object) - Contiene los datos del paciente consultado si la operación fue "ver" y fue exitosa, de lo contrario es null.
     */
    async operacionSobreArchivo(tipo, parametros) {
        try {
            const { success, error, cancelled } = await this.#actualizarEstado();
            if (!success) {
                return { success: false, error: error, cancelled: cancelled };
            }
            switch (tipo) {
                case "añadir":
                    this.#archivo.anadirPaciente(parametros.paciente);
                    break;
                case "modificar":
                    this.#archivo.modificarPaciente(parametros.id, parametros.paciente);
                    break;
                case "eliminar":
                    this.#archivo.eliminarPacientes(parametros.idPacientes, parametros.varios);
                    break;
                case "ver":
                    return this.#archivo.verPaciente(parametros.id);
            }
            return await this.#actualizarArchivo();
        } catch (error) {
            return error.message.includes("ya existe") ?
                { success: false, error: "errPacienteDuplicado" } :
                { success: false, error: "errPacienteInexistente" };
        }
    };

    /**
     * Actualiza el archivo de pacientes en Google Drive con los datos en memoria.
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     */
    async #actualizarArchivo() {
        const contJson = this.#archivo.toJson();
        const contBinario = crearArchivoXlsx(contJson, "xlsx", "Datos");

        if (!contBinario.success) {
            return { success: false, error: contBinario.error };
        }

        return await this.#subirArchivo(this.#idArchivo, contBinario.data);
    };

    /**
     * Verifica si la estructura de archivos en Google Drive existe y, si no, la crea.
     * Si existe, descarga el archivo de pacientes.
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     * - "cancelled" (Boolean) - Indica si la operación fue cancelada por el usuario.
     */
    async #actualizarEstado() {
        const { cancelled, success } = await this.#verificarEstructuraArchivos();
        if (!success && !cancelled) {
            const res = await this.#crearEstructuraArchivos();
            if (!res.success) {
                return { success: false, error: res.error };
            }
        } else if (!success && cancelled) {
            return { success, cancelled };
        } else {
            const res = await this.#descargarArchivo(this.#idArchivo);
            if (!res.success) {
                return { success: false, error: res.error };
            }
        }
        return { success: true };
    };

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
    async #crearArchivo(nombre, esCarpeta = false, idPadre = "",
        mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        const mime = esCarpeta ? "application/vnd.google-apps.folder" : mimeType;
        const params = {
            name: nombre, parents: esCarpeta ? [] : [idPadre], mimeType: mime
        };
        const { success, data, error } = await crearArchivo(this.#token, params, esCarpeta);

        return { success, data, error };
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
        this.#idCarpeta = resCarpeta.data.id;
        const resArchivo = await this.#crearArchivo(DRIVE_FILENAME, false, resCarpeta.data.id);
        if (!resArchivo.success) {
            return { success: false, error: resArchivo.error };
        }
        this.#idArchivo = resArchivo.data.id;
        return { success: true };
    };

    /**
     * @param {String} idArchivo ID del archivo a descargar.
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     */
    async #descargarArchivo(idArchivo) {
        const { success, data, error } = await descargarArchivo(this.#token, idArchivo);
        if (success) {
            return this.#leerArchivo(data);
        }
        return { success, error };
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
    async #subirCopiaDiagnosticos(nombreArchivo, idCarpeta, datos, tipo) {
        let mimeType = (tipo === "csv") ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        const res = await this.#crearArchivo(nombreArchivo, false, idCarpeta, mimeType);

        if (!res.success) {
            return { success: false, error: res.error };
        }

        const { success, data, error } = crearArchivoXlsx(datos, tipo, "Datos");
        if (!success) {
            return { success: false, error: error };
        }

        return await this.#subirArchivo(res.data.id, data, mimeType);
    };

    /**
     * @param {Uint8Array|File|Blob|ArrayBuffer} contenido Contenido del archivo.
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     */
    #leerArchivo(contenido) {
        const { success, data, error } = leerArchivoXlsx(contenido, "Datos", "errLeerArchivo");
        if (success) {
            this.#archivo = ArchivoPacientes.fromJson(data);
        } else {
            this.#archivo = new ArchivoPacientes();
        }
        return { success, error };
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
            const { success } = await subirArchivo(this.#token, idArchivo, contenido, mimeType);
            if (success) {
                return { success };
            }
            reintentos--;
        }
        return { success: false, error: "errSubidaArchivo" };
    };

    /**
     * Verificar que la estructura de archivos en Google Drive exista (la carpeta de la aplicación y el archivo de pacientes).
     * @returns {Object} Resultado de la operación con las claves:
     * - "success" (Boolean) - Indica si la operación fue exitosa o no.
     * - "error" (String) - Contiene el mensaje de error si la operación no fue exitosa, de lo contrario es null.
     * - "cancelled" (Boolean) - Indica si la operación fue cancelada por el usuario.
     */
    async #verificarEstructuraArchivos() {
        const resCarpeta = await this.#verificarExistenciaArchivo(DRIVE_FOLDER_NAME, true);
        if (!resCarpeta.success) {
            return { success: false, error: resCarpeta.error, cancelled: resCarpeta.cancelled };
        }
        this.#idCarpeta = resCarpeta.data.id;
        const resArchivo = await this.#verificarExistenciaArchivo(DRIVE_FILENAME, false, this.#idCarpeta);
        if (!resArchivo.success) {
            return { success: false, error: resArchivo.error, cancelled: resArchivo.cancelled };
        }
        this.#idArchivo = resArchivo.data.id;
        return { success: true };
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

        if (idPadre) {
            params += ` and '${idPadre}' in parents`;
        }

        const controlador = new AbortController();
        this.#peticiones.push(controlador);
        const { success, data, error, cancelled } = await buscarArchivo(this.#token, params, controlador);
        this.#peticiones.pop();

        if (success && (data.files.length > 0)) {
            return { success: true, data: data.files[0] };
        } else if (success && (data.files.length == 0)) {
            return { success: false, error: "errArchivoInexistente" };
        } else {
            return { success: false, error: error, cancelled: cancelled };
        }
    };
};