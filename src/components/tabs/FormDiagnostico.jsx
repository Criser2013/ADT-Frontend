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
import { oneHotEncondingOtraEnfermedad, oneHotInversoOtraEnfermedad, procBool, transformarDatos } from "../../utils/TratarDatos";
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
import { useForm, Controller } from "react-hook-form";

const valoresPredet = {
    paciente: { id: -1, nombre: "Seleccionar paciente", edad: "", sexo: 2, fechaNacimiento: null},
    sexo: 2, edad: "", presionSis: "", presionDias: "", frecRes: "",
    frecCard: "", so2: "", plaquetas: "", hemoglobina: "", wbc: "",
    fumador: false, bebedor: false, tos: false, fiebre: false,
    crepitaciones: false, dolorToracico: false, malignidad: false,
    hemoptisis: false, disnea: false, sibilancias: false,
    derrame: false, tepPrevio: false, edema: false, disautonomicos: false,
    inmovilidad: false, viajeProlongado: false, cirugiaReciente: false,
    otraEnfermedad: false, soplos: false,
    otrasEnfermedades: [] // Inicializamos el array vacío
};

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
    const [recargarCaptcha, setRecargarCaptcha] = useState(false);
    const [desactivarBtn, setDesactivarBtn] = useState(true);
    const [diagnostico, setDiagnostico] = useState({ resultado: false, probabilidad: 0, diagnosticado: false });
    const [cargando, setCargando] = useState(false);
    const [modal, setModal] = useState({ mostrar: false, titulo: "", mensaje: "" });
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
    const [desactivarCampos, setDesactivarCampos] = useState(false);
    const desactivarCamposAux = useMemo(() => desactivarCampos || esDiagPacientes, [desactivarCampos, esDiagPacientes]);
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
    const { setValue, control, handleSubmit, reset, watch, formState: { errors } } = useForm({
        defaultValues: valoresPredet, mode: "onBlur"
    });
    const otraEnfermedad = watch("otraEnfermedad");

    // Para que se actualice el reCAPTCHA al cambiar el tema
    useEffect(() => {
        setRecargarCaptcha(false);
        setTimeout(() => setRecargarCaptcha(true), 100);
    }, [navegacion.tema]);

    /**
     * Maneja el envío del formulario.
     * @param {JSON} datos - Datos del formulario.
     */
    const onSubmit = (datos) => {
        if (diagnostico.diagnosticado) {
            setModal({ mostrar: true, titulo: "Resultado del diagnóstico", mensaje: "" });
            return;
        }

        setCargando(true);
        diagnosticar(datos);
    };

    /**
     * Manejador para el botón de vaciar campos.
     */
    const manejadorBtnVaciar = () => {
        reset(valoresPredet);
        setDesactivarBtn(true);
        setDesactivarCampos(false);
        setDiagnostico({ resultado: false, probabilidad: 0, diagnosticado: false });
    };

    /**
     * Manejador de cambios para menú desplegable de pacientes.
     * @param {Event} e 
     */
    const manejadorCambiosPaciente = (e) => {
        dayjs.extend(customParseFormat);
        const pacienteSeleccionado = pacientes.find((x) => x.id == e.target.value);

        if (e.target.value != -1) {
            const comorbilidades = oneHotInversoOtraEnfermedad(pacienteSeleccionado);
            setValue("sexo", pacienteSeleccionado.sexo);
            setValue("edad", dayjs().diff(dayjs(
                pacienteSeleccionado.fechaNacimiento, "DD-MM-YYYY"), "year", false
            ));
            setValue("otrasEnfermedades", comorbilidades);
            setValue("otraEnfermedad", pacienteSeleccionado.otraEnfermedad);
        } else {
            const camposTxt = ["edad", "presionSis", "presionDias", "frecRes",
                "frecCard", "so2", "plaquetas", "hemoglobina", "wbc"];
            const camposBin = [
                "fumador", "bebedor", "tos", "fiebre", "crepitaciones",
                "dolorToracico", "malignidad", "hemoptisis", "disnea", "sibilancias",
                "derrame", "tepPrevio", "edema", "disautonomicos", "inmovilidad",
                "viajeProlongado", "cirugiaReciente", "otraEnfermedad", "soplos"
            ];
            setValue("sexo", 2);
            for (const i of camposTxt) {
                setValue(i, "");
            }
            for (const i of camposBin) {
                setValue(i, false);
            }
            setValue("otrasEnfermedades", []);
        }

        setValue("paciente", pacienteSeleccionado);
    };

    /**
     * Genera el diagnóstico y muestra el resultado en un modal.
     */
    const diagnosticar = async (datos) => {
        const aux = {};
        const oneHotComor = oneHotEncondingOtraEnfermedad(datos.otraEnfermedad ? datos.otrasEnfermedades : []);
        const camposTxt = ["edad", "presionSis", "presionDias", "frecRes",
            "frecCard", "so2", "plaquetas", "hemoglobina", "wbc"];
        const camposBin = [
            "sexo", "fumador", "bebedor", "tos", "fiebre", "crepitaciones",
            "dolorToracico", "malignidad", "hemoptisis", "disnea", "sibilancias",
            "derrame", "tepPrevio", "edema", "disautonomicos", "inmovilidad",
            "viajeProlongado", "cirugiaReciente", "otraEnfermedad", "soplos"
        ];

        for (let i=0; i< camposBin.length; i++) {
            if (i < camposTxt.length) {
                aux[camposTxt[i]] = datos[camposTxt[i]];
            }

            aux[camposBin[i]] = datos[camposBin[i]];
        }


        const cuerpo = transformarDatos(aux, oneHotComor);
        const res = await peticionApi(auth.authInfo.user.accessToken, "diagnosticar", "POST", cuerpo,
            "Ha ocurrido un error al generar el diagnóstico. Por favor reintenta nuevamente."
        );
        const { success, data } = res;

        if (!success) {
            setModal({ mostrar: true, titulo: "Error", mensaje: res.error });
        } else if (success && esDiagPacientes) {
            await guardarDiagnostico(oneHotComor, datos, data);
        } else {
            setDesactivarCampos(true);
            setDiagnostico({ resultado: data.prediccion, probabilidad: data.probabilidad * 100, diagnosticado: true });
            setModal({ mostrar: true, titulo: "Resultado del diagnóstico", mensaje: "" });
        }

        setCargando(false);
        setRecargarCaptcha(true);
    };

    /**
     * Guarda el diagnóstico en la base de datos.
     * @param {JSON} oneHotComor - Datos de comorbilidades en formato one-hot.
     * @param {JSON} datos - Datos binarios y númericos del formulario.
     * @param {JSON} resultado - Diagnóstico generado por la API.
     */
    const guardarDiagnostico = async (oneHotComor, datos, resultado) => {
        const aux = {};
        const camposTxt = ["edad", "presionSis", "presionDias", "frecRes",
            "frecCard", "so2", "plaquetas", "hemoglobina", "wbc"];
        const camposBin = [
            "sexo", "fumador", "bebedor", "tos", "fiebre", "crepitaciones",
            "dolorToracico", "malignidad", "hemoptisis", "disnea", "sibilancias",
            "derrame", "tepPrevio", "edema", "disautonomicos", "inmovilidad",
            "viajeProlongado", "cirugiaReciente", "otraEnfermedad", "soplos"
        ];

        // Convirtiendo los booleanos a 0 y 1
        for (const i of camposBin) {
            aux[i] = procBool(datos[i]);
        }

        // Transformando los datos de texto a números
        for (const i of camposTxt) {
            if (typeof datos[i] == "string") {
                aux[i] = parseFloat(datos[i].replace(",", "."));
            } else {
                aux[i] = datos[i];
            }
        }

        const instancia = {
            id: v6(), medico: auth.authInfo.uid, ...aux, ...oneHotComor,
            probabilidad: resultado.probabilidad, diagnostico: procBool(resultado.prediccion),
            fecha: Timestamp.now(), validado: 2, paciente: datos.paciente.id,
        };

        const res = await cambiarDiagnostico(instancia, credenciales.obtenerInstanciaDB());

        if (res.success) {
            navegacion.setPaginaAnterior("/diagnostico-paciente");
            navigate(`/diagnosticos/ver-diagnostico?id=${instancia.id}`, { replace: true, state: instancia });
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
                                <Controller
                                    name="paciente"
                                    control={control}
                                    rules={{ required: "Debes seleccionar un paciente",
                                        validate: (x) => x.id != -1 || "Debes seleccionar un paciente"
                                     }}
                                    render={({ field }) => (
                                        <TextField
                                            select
                                            label="Paciente"
                                            {...field}
                                            value={field.value.id}
                                            onChange={manejadorCambiosPaciente}
                                            error={!!errors.paciente}
                                            helperText={errors.paciente?.message}
                                            fullWidth>
                                            {pacientes.map((x) => (
                                                <MenuItem key={x.id} value={x.id}>
                                                    {x.nombre}
                                                </MenuItem>
                                            ))}
                                        </TextField>)} />
                            </Grid>
                        ) : null}
                        <Grid size={1}>
                            <Controller
                                name="sexo"
                                control={control}
                                rules={{
                                    required: "Selecciona el sexo del paciente",
                                    validate: (x) => x != 2 || "Debes seleccionar el sexo del paciente"
                                }}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        label="Sexo"
                                        {...field}
                                        error={!!errors.sexo}
                                        helperText={errors.sexo?.message}
                                        disabled={desactivarCamposAux}
                                        fullWidth>
                                        {SEXOS.map((x) => (
                                            <MenuItem key={x.val} value={x.val}>
                                                {x.texto}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )} />
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="edad"
                                control={control}
                                rules={{
                                    required: "La edad es obligatoria",
                                    validate: (value) => validarNumero(value) || "Edad inválida"
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label="Edad"
                                        {...field}
                                        error={!!errors.edad}
                                        disabled={desactivarCamposAux}
                                        helperText={errors.edad?.message}
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={numCols}>
                            <Typography variant="h6">
                                <b>Síntomas clínicos</b>
                            </Typography>
                        </Grid>
                        <Grid container size={numCols} columns={numCols} columnSpacing={0} rowSpacing={0} rowGap={0} columnGap={0}>
                            {SINTOMAS.map((x) => (
                                <Grid size={1} key={x.nombre}>
                                    <Controller
                                        name={x.nombre}
                                        control={control}
                                        render={({ field }) => (
                                            <Check
                                                nombre={x.nombre}
                                                etiqueta={x.texto}
                                                desactivado={desactivarCampos}
                                                activado={field.value}
                                                manejadorCambios={field.onChange}
                                            />
                                        )}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                        <Grid size={numCols}>
                            <Typography variant="h6">
                                <b>Signos vitales</b>
                            </Typography>
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="presionSis"
                                control={control}
                                rules={{
                                    required: "La presión sistólica es obligatoria",
                                    validate: (value) => validarFloatPos(value) || "Solo debes ingresar números positivos"
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label="Presión sistólica (mmHg)"
                                        {...field}
                                        error={!!errors.presionSis}
                                        helperText={errors.presionSis?.message}
                                        disabled={desactivarCampos}
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="presionDias"
                                control={control}
                                rules={{
                                    required: "La presión diastólica es obligatoria",
                                    validate: (value) => validarFloatPos(value) || "Solo debes ingresar números positivos"
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label="Presión diastólica (mmHg)"
                                        {...field}
                                        error={!!errors.presionDias}
                                        disabled={desactivarCampos}
                                        helperText={errors.presionDias?.message}
                                        fullWidth />
                                )}
                            />
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="frecRes"
                                control={control}
                                rules={{
                                    required: "La frecuencia respiratoria es obligatoria",
                                    validate: (value) => validarFloatPos(value) || "Solo debes ingresar números positivos"
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label="Frecuencia respiratoria"
                                        {...field}
                                        error={!!errors.frecRes}
                                        disabled={desactivarCampos}
                                        helperText={errors.frecRes?.message}
                                        fullWidth />
                                )}
                            />
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="frecCard"
                                control={control}
                                rules={{
                                    required: "La frecuencia cardíaca es obligatoria",
                                    validate: (value) => validarFloatPos(value) || "Solo debes ingresar números positivos"
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label="Frecuencia cardíaca"
                                        {...field}
                                        error={!!errors.frecCard}
                                        disabled={desactivarCampos}
                                        helperText={errors.frecCard?.message}
                                        fullWidth />)} />
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="so2"
                                control={control}
                                rules={{
                                    required: "La saturación de oxígeno es obligatoria",
                                    validate: (value) => validarFloatPos(value) || "Solo debes ingresar números positivos"
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label="Saturación de la sangre"
                                        {...field}
                                        error={!!errors.so2}
                                        disabled={desactivarCampos}
                                        helperText={errors.so2?.message}
                                        fullWidth />)} />
                        </Grid>
                        <Grid size={numCols}>
                            <Typography variant="h6">
                                <b>Exámenes de laboratorio</b>
                            </Typography>
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="plaquetas"
                                control={control}
                                rules={{
                                    required: "El conteo de plaquetas es obligatorio",
                                    validate: (value) => validarFloatPos(value) || "Solo debes ingresar números positivos"
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label="Conteo de plaquetas"
                                        {...field}
                                        error={!!errors.plaquetas}
                                        disabled={desactivarCampos}
                                        helperText={errors.plaquetas?.message}
                                        fullWidth />)} />
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="hemoglobina"
                                control={control}
                                rules={{
                                    required: "La hemoglobina es obligatoria",
                                    validate: (value) => validarFloatPos(value) || "Solo debes ingresar números positivos"
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label="Hemoglobina"
                                        {...field}
                                        error={!!errors.hemoglobina}
                                        disabled={desactivarCampos}
                                        helperText={errors.hemoglobina?.message}
                                        fullWidth />)} />
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="wbc"
                                control={control}
                                rules={{
                                    required: "El conteo de glóbulos blancos es obligatorio",
                                    validate: (value) => validarFloatPos(value) || "Solo debes ingresar números positivos"
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label="Conteo de glóbulos blancos"
                                        {...field}
                                        error={!!errors.wbc}
                                        disabled={desactivarCampos}
                                        helperText={errors.wbc?.message}
                                        fullWidth />)} />
                        </Grid>
                        <Grid size={numCols}>
                            <Typography variant="h6">
                                <b>Condiciones médicas preexistentes</b>
                            </Typography>
                        </Grid>
                        <Grid size={numCols}>
                            <Controller
                                name="otraEnfermedad"
                                control={control}
                                render={({ field }) => (
                                    <Check
                                        nombre="otraEnfermedad"
                                        etiqueta="El paciente padece otra enfermedad."
                                        activado={field.value}
                                        desactivado={desactivarCamposAux}
                                        manejadorCambios={field.onChange}
                                    />
                                )}
                            />
                        </Grid>
                        {otraEnfermedad ? (
                            <Grid size={numCols}>
                                <Controller
                                    name="otrasEnfermedades"
                                    control={control}
                                    rules={{
                                        required: otraEnfermedad ? "Selecciona al menos un padecimiento" : false,
                                    }}
                                    render={({ field }) => (
                                        <SelectChip
                                            valor={field.value}
                                            listaValores={COMORBILIDADES}
                                            manejadorCambios={field.onChange}
                                            nombre="comorbilidades"
                                            error={!!errors.otrasEnfermedades}
                                            txtError={errors.otrasEnfermedades?.message}
                                            desactivado={desactivarCamposAux}
                                            etiqueta="Padecimiento(s) del paciente"
                                        />
                                    )}
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
                                            onClick={handleSubmit(onSubmit)}
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