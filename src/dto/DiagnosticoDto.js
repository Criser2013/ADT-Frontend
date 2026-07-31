/**
 * Clase que representa un diagnóstico para ser visualizado en la interfaz de 
 * diagnósticos. Solo contiene la información que se va a mostrar en la tabla de diagnósticos.
 */
export default class DiagnosticoDto {
    /**
     * Constructor de la clase DiagnosticoDto.
     * @param {String} id ID del diagnóstico
     * @param {String} idUsuario UID del usuario que realizó el diagnóstico
     * @param {String} usuario Nombre de la cuenta de usuario que realizó el diagnóstico
     * @param {String} idPaciente ID del paciente
     * @param {String} paciente Nombre del paciente
     * @param {String} cedula Cédula del paciente
     * @param {Number} edad Edad del paciente
     * @param {Date} fecha Fecha del diagnóstico
     * @param {String} sexo Sexo del paciente
     * @param {Boolean} diagnosticoModelo Diagnóstico realizado por el modelo de IA
     * @param {Boolean|null} diagnosticoMedico Diagnóstico realizado por el médico (puede ser null si no ha sido validado)
     */
    constructor(
        id, idUsuario, usuario, idPaciente, paciente, cedula,
        edad, fecha, sexo, diagnosticoModelo, diagnosticoMedico
    ) {
        this.idCompuesto = `${id}-${idUsuario}`;
        this.idUsuario = idUsuario;
        this.usuario = usuario;
        this.idPaciente = idPaciente;
        this.paciente = paciente;
        this.cedula = cedula;
        this.edad = edad;
        this.fecha = fecha;
        this.sexo = sexo;
        this.diagnosticoModelo = diagnosticoModelo;
        this.diagnosticoMedico = diagnosticoMedico;
        this.validado = diagnosticoModelo != null;

        this.esUsuarioEliminado = usuario == "usuario eliminado";
        this.esPacienteAnonimo = paciente == "paciente anónimo";
        this.esPacienteEliminado = paciente == "paciente eliminado";
    }

    get usuario() {
        return this._usuario;
    }

    set usuario(nombre) {
        this._usuario = nombre;
        this.esUsuarioEliminado = nombre == "usuario eliminado";
    }

    get paciente() {
        return this._paciente;
    }

    set paciente(nombre) {
        this._paciente = nombre;
        this.esPacienteAnonimo = nombre == "paciente anónimo";
        this.esPacienteEliminado = nombre == "paciente eliminado";
    }

    /**
     * @param {Boolean} esAdmin Indicador de si el usuario es administrador o n
     * @returns {String} ID del diagnóstico, si el usuario es administrador se devuelve el 
     * ID completo, si no se devuelve solo el ID del diagnóstico sin el UID del usuario.
     */
    mostrarId(esAdmin) {
        return esAdmin ? this.idCompuesto : this.idCompuesto.replace(`-${this.idUsuario}`, "");
    }
}