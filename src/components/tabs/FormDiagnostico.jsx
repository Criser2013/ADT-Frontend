import {
    Grid, Button, Typography, TextField, Stack, Tooltip, Box,
    CircularProgress, MenuItem
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { detTamCarga } from "../../utils/Responsividad";
import Check from "../tabs/Check";
import SelectChip from "../tabs/SelectChip";
import { COMORBILIDADES, SEXOS, SINTOMAS } from "../../../constants";
import CloseIcon from "@mui/icons-material/Close";
import { DiagnosticoIcono } from "../icons/IconosSidebar";
import { validarFloatPos, validarNumero } from "../../utils/Validadores";
import { oneHotEncondingOtraEnfermedad, oneHotInversoOtraEnfermedad, procBool, transformarDatos, validarArray } from "../../utils/TratarDatos";
import ModalSimple from "../modals/ModalSimple";
import { peticionApi } from "../../services/Api";
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { cambiarDiagnostico } from "../../firestore/diagnosticos-collection";
import { useNavigate } from "react-router";
import { v6 } from "uuid";
import { Timestamp } from "firebase/firestore";
import { useCredenciales } from "../../contexts/CredencialesContext";
import TabHeader from "../tabs/TabHeader";
import ReCAPTCHA from "react-google-recaptcha";

/**
 * Formulario para realizar un diagnostico de TEP.
 * @param {Array} listadoPestanas - Lista de pestañas para el encabezado.
 * @param {Array} tituloHeader - Título del encabezado.
 * @param {Array} pacientes - Lista de pacientes registrados.
 * @param {Boolean} esDiagPacientes - Indica si el formulario es para diagnosticar pacientes.
 * @returns JSX.Element
 */
export default function FormDiagnostico({ listadoPestanas, tituloHeader, pacientes = [], esDiagPacientes = false }) {
    const auth = useAuth();
    const navegacion = useNavegacion();
    const credenciales = useCredenciales();
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(false);
    const [recargarCaptcha, setRecargarCaptcha] = useState(false);
    const [modal, setModal] = useState({
        mostrar: false, titulo: "", mensaje: ""
    });
    const [datosTxt, setDatosTxt] = useState({
        sexo: 2, edad: "", presionSis: "", presionDias: "", frecRes: "",
        frecCard: "", so2: "", plaquetas: "", hemoglobina: "", wbc: ""
    });
    const [datosBin, setDatosBin] = useState({
        fumador: false, bebedor: false, tos: false, fiebre: false,
        crepitaciones: false, dolorToracico: false, malignidad: false,
        hemoptisis: false, disnea: false, sibilancias: false,
        derrame: false, tepPrevio: false, edema: false, disautonomicos: false,
        inmovilidad: false, viajeProlongado: false, cirugiaReciente: false,
        otraEnfermedad: false, soplos: false
    });
    const [paciente, setPaciente] = useState({
        cedula: -1, nombre: "Seleccionar paciente", edad: "", sexo: 2, fechaNacimiento: null
    });
    const [diagnostico, setDiagnostico] = useState({
        resultado: false, probabilidad: 0, diagnosticado: false
    });
    const [desactivarBtn, setDesactivarBtn] = useState(true);
    const [desactivarCampos, setDesactivarCampos] = useState(false);
    const [otrasEnfermedades, setOtrasEnfermedades] = useState([]);
    const [errores, setErrores] = useState([
        { campo: "sexo", error: false, txt: "" },
        { campo: "edad", error: false, txt: "" },
        { campo: "presionSis", error: false, txt: "" },
        { campo: "presionDias", error: false, txt: "" },
        { campo: "frecuenciaRes", error: false, txt: "" },
        { campo: "frecuenciaCard", error: false, txt: "" },
        { campo: "so2", error: false, txt: "" },
        { campo: "plaquetas", error: false, txt: "" },
        { campo: "hemoglobina", error: false, txt: "" },
        { campo: "wbc", error: false, txt: "" },
        { campo: "comorbilidades", error: false, txt: "" },
        { campo: "paciente", error: false, txt: "" }
    ]);
    const width = useMemo(() => {
        return detTamCarga(navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho);
    }, [navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho]);
    const numCols = useMemo(() => {
        if (navegacion.dispositivoMovil && (navegacion.orientacion == "vertical" || navegacion.ancho < 500)) {
            return 1;
        } else if (navegacion.dispositivoMovil && navegacion.orientacion == "horizontal") {
            return 2;
        } else {
            return 3;
        }
    }, [navegacion.dispositivoMovil, navegacion.ancho, navegacion.orientacion]);
    const reCAPTCHAApi = useMemo(() => {
        return credenciales.obtenerRecaptcha();
    }, [credenciales.obtenerRecaptcha()]);
    const desactivarCamposAux = useMemo(() => desactivarCampos || esDiagPacientes, [desactivarCampos, esDiagPacientes]);
    const txtErrorOtrasEnfermedades = useMemo(() => !esDiagPacientes ? errores[10].txt : "", [esDiagPacientes, errores[10]]);
    const txtErrorSexo = useMemo(() => !esDiagPacientes ? errores[0].txt : "", [esDiagPacientes, errores[0]]);
    const txtErrorEdad = useMemo(() => !esDiagPacientes ? errores[1].txt : "", [esDiagPacientes, errores[1]]);
    const txtBtnDiagnostico = useMemo(() => {
        return diagnostico.diagnosticado ? "Ver diagnóstico" : "Diagnosticar";
    }, [diagnostico.diagnosticado]);
    const toolBtnVaciar = useMemo(() => {
        return diagnostico.diagnosticado ? "Vaciar los campos para realizar otro diagnóstico." : "Vaciar el contenido de los campos.";
    }, [diagnostico.diagnosticado]);
    const toolBtnDiagnosticar = useMemo(() => {
        return diagnostico.diagnosticado ? "Ver resultados del diagnóstico" : "Genera el diagnóstico de TEP.";
    }, [diagnostico.diagnosticado]);
    const CAPTCHA = useRef(null);
    const temaCaptcha = useMemo(() => navegacion.tema, [navegacion.tema]);
    const redibujarCaptcha = useMemo(() => {
        if (!recargarCaptcha) {
            return false;
        } else {
            return !diagnostico.diagnosticado;
        }
    }, [recargarCaptcha, diagnostico.diagnosticado]);

    // Para que se actualice el reCAPTCHA al cambiar el tema
    useEffect(() => {
        setRecargarCaptcha(false);
        setTimeout(() => setRecargarCaptcha(true), 100);
    }, [navegacion.tema]);

    /**
     * Manejador de cambios para los datos de texto.
     * @param {Event} e 
     */
    const manejadorCambiosDatosTxt = (e) => {
        setDatosTxt((x) => ({ ...x, [e.target.name]: e.target.value }));
    };

    /**
     * Manejador de cambios para los datos binarios.
     * @param {Event} e 
     */
    const manejadorCambiosDatosBin = (e) => {
        setDatosBin((x) => ({ ...x, [e.target.name]: e.target.checked }));
    };

    /**
     * Manejador de cambios para menú desplegable de pacientes.
     * @param {Event} e 
     */
    const manejadorCambiosPaciente = (e) => {
        dayjs.extend(customParseFormat);
        const pacienteSeleccionado = pacientes.find((x) => x.cedula == e.target.value);

        if (e.target.value != -1) {
            const comorbilidades = oneHotInversoOtraEnfermedad(pacienteSeleccionado);

            setDatosTxt({
                ...datosTxt, sexo: pacienteSeleccionado.sexo, edad: dayjs().diff(dayjs(
                    pacienteSeleccionado.fechaNacimiento, "DD-MM-YYYY"), "year", false
                )
            });
            setDatosBin({ ...datosBin, otraEnfermedad: pacienteSeleccionado.otraEnfermedad });
            setOtrasEnfermedades(comorbilidades);
        } else {
            setDatosTxt({
                sexo: 2, edad: "", presionSis: "", presionDias: "", frecRes: "",
                frecCard: "", so2: "", plaquetas: "", hemoglobina: "", wbc: ""
            });
            setDatosBin({
                fumador: false, bebedor: false, tos: false, fiebre: false,
                crepitaciones: false, dolorToracico: false, malignidad: false,
                hemoptisis: false, disnea: false, sibilancias: false,
                derrame: false, tepPrevio: false, edema: false, disautonomicos: false,
                inmovilidad: false, viajeProlongado: false, cirugiaReciente: false,
                otraEnfermedad: false, soplos: false
            });
            setOtrasEnfermedades([]);
        }

        setPaciente(pacienteSeleccionado);
    };

    /**
     * Manejador de cambios para las comorbilidades.
     * @param {Event} e 
     */
    const manejadorCambiosComor = (e) => {
        setOtrasEnfermedades(e.target.value);
    };

    /**
     * Manejador del botón de vaciar campos.
     */
    const manejadorBtnVaciar = () => {
        CAPTCHA.current.reset();
        setDesactivarCampos(false);
        setDiagnostico({ resultado: false, probabilidad: 0, diagnosticado: false });
        setDatosTxt({
            sexo: 2, edad: "", presionSis: "", presionDias: "", frecRes: "",
            frecCard: "", so2: "", plaquetas: "", hemoglobina: "", wbc: ""
        });
        setDatosBin({
            fumador: false, bebedor: false, tos: false, fiebre: false,
            crepitaciones: false, dolorToracico: false, malignidad: false,
            hemoptisis: false, disnea: false, sibilancias: false,
            derrame: false, tepPrevio: false, edema: false, disautonomicos: false,
            inmovilidad: false, viajeProlongado: false, cirugiaReciente: false,
            otraEnfermedad: false
        });
        setOtrasEnfermedades([]);
        setErrores(errores.map(e => ({ ...e, error: false, txt: "" })));

        if (esDiagPacientes) {
            setPaciente({ cedula: -1, nombre: "Seleccionar paciente" });
        }
    };

    /**
     * Quita los errores de los campos en pantalla.
     */
    const limpiarErrores = () => {
        setErrores([
            { campo: "sexo", error: false, txt: "" },
            { campo: "edad", error: false, txt: "" },
            { campo: "presionSis", error: false, txt: "" },
            { campo: "presionDias", error: false, txt: "" },
            { campo: "frecuenciaRes", error: false, txt: "" },
            { campo: "frecuenciaCard", error: false, txt: "" },
            { campo: "so2", error: false, txt: "" },
            { campo: "plaquetas", error: false, txt: "" },
            { campo: "hemoglobina", error: false, txt: "" },
            { campo: "wbc", error: false, txt: "" },
            { campo: "comorbilidades", error: false, txt: "" },
            { campo: "paciente", error: false, txt: "" }
        ]);
    };

    /**
     * Valida el campo que se indique, devuelve un JSON con el resultados.
     * @param {String} cod - Atributo "name" del campo que se está validando.
     * @returns JSON
     */
    const evaluarErrores = (cod) => {
        let res = { campo: cod, error: false, txt: "" };
        const numCampos = ["presionSis", "presionDias", "frecRes", "frecCard",
            "so2", "plaquetas", "hemoglobina", "wbc"
        ];

        switch (true) {
            case (cod == "paciente" && paciente.cedula == -1):
                res = { error: true, txt: "Debes seleccionar un paciente" };
                break;
            case (cod == "sexo" && datosTxt.sexo > 1):
                res = { error: true, txt: "Selecciona el sexo del paciente" };
                break;
            case (cod == "edad" && !validarNumero(datosTxt.edad)):
                res = { error: true, txt: "Edad inválida" };
                break;
            case numCampos.includes(cod) && !validarFloatPos(datosTxt[cod]):
                res = { error: true, txt: "Solo debes ingresar números positivos" };
                break;
            case (cod == "comorbilidades" && (datosBin.otraEnfermedad && otrasEnfermedades.length == 0)):
                res = { error: true, txt: "Selecciona al menos un padecimiento" };
                break;
            default:
                break;
        }
        res["campo"] = cod;
        return res;
    };

    /**
     * Muestra un modal de error cuando los datos son inválidos.
     */
    const mostrarErrDatosInv = () => {
        setModal({
            mostrar: true,
            titulo: "Datos inválidos.",
            mensaje: "Los valores de algunos campos son inválidos."
        });
    };

    /**
     * Manejador del botón de guardar.
     */
    const manejadorBtnDiagnosticar = () => {
        const camposEval = ["presionSis", "presionDias", "frecRes",
            "frecCard", "so2", "plaquetas", "hemoglobina", "wbc"
        ];

        camposEval.unshift("sexo", "edad");
        camposEval.push("comorbilidades");


        if (esDiagPacientes) {
            camposEval.push("paciente");
        }

        if (diagnostico.diagnosticado) {
            setModal({ mostrar: true, titulo: "Resultado del diagnóstico", mensaje: "" });
            return;
        }

        limpiarErrores();
        const res = validarArray(
            camposEval,
            evaluarErrores,
            (x) => !x.error,
            setErrores
        );

        if (!res) {
            mostrarErrDatosInv();
        } else {
            setCargando(true);
            diagnosticar();
        }
    };

    /**
     * Genera el diagnóstico y muestra el resultado en un modal.
     */
    const diagnosticar = async () => {
        const oneHotComor = oneHotEncondingOtraEnfermedad(datosBin.otraEnfermedad ? otrasEnfermedades : []);
        const datos = transformarDatos({ ...datosTxt, ...datosBin }, oneHotComor);
        const res = await peticionApi(auth.authInfo.user.accessToken, "diagnosticar", "POST", datos,
            "Ha ocurrido un error al generar el diagnóstico. Por favor reintenta nuevamente."
        );
        const { success, data } = res;

        if (!success) {
            setModal({ mostrar: true, titulo: "Error", mensaje: res.error });
        } else if (success && esDiagPacientes) {
            await guardarDiagnostico(oneHotComor, data);
        } else {
            setDesactivarCampos(true);
            setDiagnostico({ resultado: data.prediccion, probabilidad: data.probabilidad * 100, diagnosticado: true });
            setModal({ mostrar: true, titulo: "Resultado del diagnóstico", mensaje: "" });
        }

        setCargando(false);
    };

    /**
     * Guarda el diagnóstico en la base de datos.
     * @param {JSON} oneHotComor - Datos de comorbilidades en formato one-hot.
     * @param {JSON} resultado - Diagnóstico generado por la API.
     */
    const guardarDiagnostico = async (oneHotComor, resultado) => {
        const auxBin = { ...datosBin };
        const auxTxt = { ...datosTxt };

        // Convirtiendo los booleanos a 0 y 1
        for (const i in datosBin) {
            auxBin[i] = procBool(datosBin[i]);
        }

        // Transformando los datos de texto a números
        for (const i in datosTxt) {
            if (typeof datosTxt[i] == "string") {
                auxTxt[i] = parseFloat(datosTxt[i].replace(",", "."));
            }
        }

        const datos = {
            id: v6(), medico: auth.authInfo.correo, ...auxTxt, ...auxBin, ...oneHotComor,
            probabilidad: resultado.probabilidad, diagnostico: procBool(resultado.prediccion),
            fecha: Timestamp.now(), validado: 2, paciente: paciente.cedula
        };

        const res = await cambiarDiagnostico(datos, credenciales.obtenerInstanciaDB());

        if (res.success) {
            navigate(`/diagnosticos/ver-diagnostico?id=${datos.id}`, { replace: true, state: datos });
        } else {
            setModal({
                mostrar: true,
                titulo: "Error al guardar el diagnóstico",
                mensaje: `No se pudo guardar el diagnóstico: ${res.data}.`
            });
        }
    };

    /**
     * Activa o desactiva el botón de inicio de sesión basado en la respuesta de reCAPTCHA.
     * @param {String|null} token - Token de reCAPTCHA recibido al completar el desafío.
     */
    const manejadorReCAPTCHA = (token) => {
        setDesactivarBtn(!(typeof token == "string"));
    };

    return (
        <>
            {cargando ? (
                <Box display="flex" justifyContent="center" alignItems="center" width={width} height="85vh">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <TabHeader
                        activarBtnAtras={false}
                        titulo={tituloHeader}
                        pestanas={listadoPestanas} />
                    <Grid container columns={numCols} spacing={2} sx={{ marginTop: "3vh", width: width }}>
                        <Grid size={numCols}>
                            <Typography variant="h6">
                                <b>Datos personales</b>
                            </Typography>
                        </Grid>
                        {esDiagPacientes ? (
                            <Grid size={1}>
                                <TextField
                                    select
                                    label="Paciente"
                                    name="paciente"
                                    value={paciente.cedula}
                                    onChange={manejadorCambiosPaciente}
                                    error={errores[11].error}
                                    helperText={errores[11].txt}
                                    fullWidth>
                                    {pacientes.map((x) => (
                                        <MenuItem key={x.cedula} value={x.cedula}>
                                            {x.nombre}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        ) : null}
                        <Grid size={1}>
                            <TextField
                                select
                                label="Sexo"
                                name="sexo"
                                value={datosTxt.sexo}
                                onChange={manejadorCambiosDatosTxt}
                                error={errores[0].error && !esDiagPacientes}
                                helperText={txtErrorSexo}
                                disabled={desactivarCamposAux}
                                fullWidth>
                                {SEXOS.map((x) => (
                                    <MenuItem key={x.val} value={x.val}>
                                        {x.texto}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={1}>
                            <TextField
                                label="Edad"
                                name="edad"
                                value={datosTxt.edad}
                                onChange={manejadorCambiosDatosTxt}
                                error={errores[1].error && !esDiagPacientes}
                                disabled={desactivarCamposAux}
                                helperText={txtErrorEdad}
                                fullWidth />
                        </Grid>
                        <Grid size={numCols}>
                            <Typography variant="h6">
                                <b>Síntomas clínicos</b>
                            </Typography>
                        </Grid>
                        <Grid container size={numCols} columns={numCols} columnSpacing={0} rowSpacing={0} rowGap={0} columnGap={0}>
                            {SINTOMAS.map((x) => (
                                <Grid size={1} key={x.nombre}>
                                    <Check
                                        nombre={x.nombre}
                                        etiqueta={x.texto}
                                        desactivado={desactivarCampos}
                                        activado={datosBin[x.nombre]}
                                        manejadorCambios={manejadorCambiosDatosBin} />
                                </Grid>
                            ))}
                        </Grid>
                        <Grid size={numCols}>
                            <Typography variant="h6">
                                <b>Signos vitales</b>
                            </Typography>
                        </Grid>
                        <Grid size={1}>
                            <TextField
                                label="Presión sistólica (mmHg)"
                                name="presionSis"
                                value={datosTxt.presionSis}
                                onChange={manejadorCambiosDatosTxt}
                                error={errores[2].error}
                                disabled={desactivarCampos}
                                helperText={errores[2].txt}
                                fullWidth />
                        </Grid>
                        <Grid size={1}>
                            <TextField
                                label="Presión diastólica (mmHg)"
                                name="presionDias"
                                value={datosTxt.presionDias}
                                onChange={manejadorCambiosDatosTxt}
                                error={errores[3].error}
                                disabled={desactivarCampos}
                                helperText={errores[3].txt}
                                fullWidth />
                        </Grid>
                        <Grid size={1}>
                            <TextField
                                label="Frecuencia respiratoria"
                                name="frecRes"
                                value={datosTxt.frecRes}
                                onChange={manejadorCambiosDatosTxt}
                                error={errores[4].error}
                                disabled={desactivarCampos}
                                helperText={errores[4].txt}
                                fullWidth />
                        </Grid>
                        <Grid size={1}>
                            <TextField
                                label="Frecuencia cardíaca"
                                name="frecCard"
                                value={datosTxt.frecCard}
                                onChange={manejadorCambiosDatosTxt}
                                error={errores[5].error}
                                disabled={desactivarCampos}
                                helperText={errores[5].txt}
                                fullWidth />
                        </Grid>
                        <Grid size={1}>
                            <TextField
                                label="Saturación de la sangre"
                                name="so2"
                                value={datosTxt.so2}
                                onChange={manejadorCambiosDatosTxt}
                                error={errores[6].error}
                                disabled={desactivarCampos}
                                helperText={errores[6].txt}
                                fullWidth />
                        </Grid>
                        <Grid size={numCols}>
                            <Typography variant="h6">
                                <b>Exámenes de laboratorio</b>
                            </Typography>
                        </Grid>
                        <Grid size={1}>
                            <TextField
                                label="Conteo de plaquetas"
                                name="plaquetas"
                                value={datosTxt.plaquetas}
                                onChange={manejadorCambiosDatosTxt}
                                error={errores[7].error}
                                disabled={desactivarCampos}
                                helperText={errores[7].txt}
                                fullWidth />
                        </Grid>
                        <Grid size={1}>
                            <TextField
                                label="Hemoglobina"
                                name="hemoglobina"
                                value={datosTxt.hemoglobina}
                                onChange={manejadorCambiosDatosTxt}
                                error={errores[8].error}
                                disabled={desactivarCampos}
                                helperText={errores[8].txt}
                                fullWidth />
                        </Grid>
                        <Grid size={1}>
                            <TextField
                                label="Conteo de glóbulos blancos"
                                name="wbc"
                                value={datosTxt.wbc}
                                onChange={manejadorCambiosDatosTxt}
                                error={errores[9].error}
                                disabled={desactivarCampos}
                                helperText={errores[9].txt}
                                fullWidth />
                        </Grid>
                        <Grid size={numCols}>
                            <Typography variant="h6">
                                <b>Condiciones médicas preexistentes</b>
                            </Typography>
                        </Grid>
                        <Grid size={numCols}>
                            <Check
                                nombre="otraEnfermedad"
                                etiqueta="El paciente padece otra enfermedad."
                                activado={datosBin.otraEnfermedad}
                                desactivado={desactivarCamposAux}
                                manejadorCambios={manejadorCambiosDatosBin} />
                        </Grid>
                        {datosBin.otraEnfermedad ? (
                            <Grid size={numCols}>
                                <SelectChip
                                    valor={otrasEnfermedades}
                                    listaValores={COMORBILIDADES}
                                    manejadorCambios={manejadorCambiosComor}
                                    nombre="comorbilidades"
                                    error={errores[10].error}
                                    txtError={txtErrorOtrasEnfermedades}
                                    desactivado={desactivarCamposAux}
                                    etiqueta="Padecimiento(s) del paciente"
                                />
                            </Grid>
                        ) : null}
                        {(redibujarCaptcha) ? (<Grid size={numCols} display="flex" justifyContent="center">
                            <ReCAPTCHA
                                theme={temaCaptcha}
                                onChange={manejadorReCAPTCHA}
                                sitekey={reCAPTCHAApi}
                                ref={CAPTCHA} />
                        </Grid>) : null}
                        <Grid display="flex" justifyContent="center" size={numCols}>
                            <Stack direction="row" spacing={2}>
                                <Tooltip title={toolBtnVaciar}>
                                    <Button
                                        startIcon={<CloseIcon />}
                                        variant="contained"
                                        onClick={manejadorBtnVaciar}
                                        sx={{
                                            textTransform: "none"
                                        }}>
                                        <b>Vaciar campos</b>
                                    </Button>
                                </Tooltip>
                                <Tooltip title={toolBtnDiagnosticar}>
                                    <span>
                                        <Button
                                            startIcon={diagnostico.diagnosticado ? <PersonSearchIcon /> : <DiagnosticoIcono />}
                                            variant="contained"
                                            onClick={manejadorBtnDiagnosticar}
                                            disabled={desactivarBtn}
                                            sx={{
                                                textTransform: "none"
                                            }}>
                                            <b>{txtBtnDiagnostico}</b>
                                        </Button>
                                    </span>
                                </Tooltip>
                            </Stack>
                        </Grid>
                    </Grid>
                </>)}
            <ModalSimple
                abrir={modal.mostrar}
                titulo={modal.titulo}
                mensaje={modal.mensaje}
                txtBtn="Cerrar"
                manejadorBtnModal={() => setModal((x) => ({ ...x, mostrar: false }))}>
                <Box>
                    {diagnostico.resultado ? (
                        <Typography variant="body1">
                            ⚠️ Atención, se ha <b>diagnosticado al paciente con TEP</b>, teniendo una probabilidad del <b>{diagnostico.probabilidad.toFixed(2)}%</b>.
                        </Typography>
                    ) : (
                        <Typography variant="body1">
                            El paciente <b>no ha sido diagnosticado con TEP</b>, la probabilidad de no padecerlo es del <b>{diagnostico.probabilidad.toFixed(2) - 1}%</b>.
                        </Typography>
                    )}
                </Box>
            </ModalSimple>
        </>
    );
};