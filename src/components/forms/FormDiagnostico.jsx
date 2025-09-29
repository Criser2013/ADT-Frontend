import {
    Grid, Button, Typography, TextField, Stack, Tooltip, Box,
    CircularProgress, MenuItem, IconButton
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavegacion } from "../../contexts/NavegacionContext";
import Check from "../tabs/Check";
import SelectChip from "../tabs/SelectChip";
import { CAMPOS_BIN, CAMPOS_TXT, COMORBILIDADES, SEXOS, SINTOMAS } from "../../../constants";
import CloseIcon from "@mui/icons-material/Close";
import ClearIcon from '@mui/icons-material/Clear';
import { DiagnosticoIcono } from "../icons/IconosSidebar";
import { validarFloatPos, validarNumero } from "../../utils/Validadores";
import { oneHotEncoderOtraEnfermedad, oneHotDecoderOtraEnfermedad, procBool, transformarDatos } from "../../utils/TratarDatos";
import ModalSimple from "../modals/ModalSimple";
import { peticionApi } from "../../services/Api";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { cambiarDiagnostico } from "../../firestore/diagnosticos-collection";
import { useNavigate } from "react-router";
import { v6 } from "uuid";
import { Timestamp } from "firebase/firestore";
import { useCredenciales } from "../../contexts/CredencialesContext";
import TabHeader from "../layout/TabHeader";
import ReCAPTCHA from "react-google-recaptcha";
import { useForm, Controller } from "react-hook-form";
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation  } from "react-i18next";
import i18next from '../../../i18n';

const valoresPredet = {
    paciente: { id: -1, nombre: i18next.t("txtSelectPaciente"), edad: "", sexo: 2, fechaNacimiento: null },
    sexo: 2, edad: "", presionSis: "", presionDias: "", frecRes: "",
    frecCard: "", so2: "", plaquetas: "", hemoglobina: "", wbc: "",
    fumador: false, bebedor: false, tos: false, fiebre: false,
    crepitaciones: false, dolorToracico: false, malignidad: false,
    hemoptisis: false, disnea: false, sibilancias: false,
    derrame: false, tepPrevio: false, edema: false, disautonomicos: false,
    inmovilidad: false, viajeProlongado: false, cirugiaReciente: false,
    otraEnfermedad: false, soplos: false,
    otrasEnfermedades: []
};

/**
 * Formulario para realizar un diagnostico de TEP.
 * @param {Array} listadoPestanas - Lista de pestañas para el encabezado.
 * @param {Array} tituloHeader - Título del encabezado.
 * @param {Array} pacientes - Lista de pacientes registrados.
 * @param {function} manejadorRecarga - Función para manejar la recarga de datos.
 * @param {Boolean} esDiagPacientes - Indica si el formulario es para diagnosticar pacientes.
 * @returns {JSX.Element}
 */
export default function FormDiagnostico({ listadoPestanas, tituloHeader, pacientes = [], esDiagPacientes = false, manejadorRecarga = null }) {
    const auth = useAuth();
    const navegacion = useNavegacion();
    const credenciales = useCredenciales();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [desactivarBtn, setDesactivarBtn] = useState(true);
    const [cargando, setCargando] = useState(true);
    const [modal, setModal] = useState({ mostrar: false, titulo: "", mensaje: "" });
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
    }, [credenciales.obtenerRecaptcha]);
    const [cargandoBtn, setCargandoBtn] = useState(false);
    const [antTema, setAntTema] = useState(navegacion.tema);
    const CAPTCHA = useRef(null);
    const temaCaptcha = useMemo(() => navegacion.tema, [navegacion.tema]);
    const { getValues, setValue, control, handleSubmit, reset, watch, formState: { errors } } = useForm({
        defaultValues: valoresPredet, mode: "onBlur"
    });
    const otraEnfermedad = watch("otraEnfermedad");

    // Quita la pantalla de carga inicial para el diagnóstico anónimo.
    useEffect(() => {
        if (!esDiagPacientes) {
            setCargando(false);
        }
    }, []);

    // Quita la pantalla de carga inicial cuando se tienen los datos de los pacientes.
    useEffect(() => {
        if (esDiagPacientes && (pacientes != null)) {
            setCargando(false);
        }
    }, [esDiagPacientes, pacientes]);

    // Para que se actualice el reCAPTCHA al cambiar el tema

    /**
     * Ejecuta una función mientras se cambia el idioma o el tema.
     * @param {Function} funcion - Función a ejecutar.
     */
    const reiniciarPagina = () => {
        setCargando(true);
        setTimeout(() => {
            setDesactivarBtn(true);
            setCargando(false);
        }, 100);
    };

    useEffect(() => {
        document.title = t("titInicioSesion");
        if (CAPTCHA.current != null) {
            reiniciarPagina();
        }
    }, [navegacion.idioma]);

    useEffect(() => {
        setAntTema(temaCaptcha);
        if (antTema != temaCaptcha) {
            reiniciarPagina();
        }
    }, [antTema, temaCaptcha, navegacion.tema]);

    /**
     * Maneja el envío del formulario.
     * @param {JSON} datos - Datos del formulario.
     */
    const onSubmit = (datos) => {
        setCargando(true);
        diagnosticar(datos);
    };

    /**
     * Manejador para el botón de vaciar campos.
     */
    const manejadorBtnVaciar = () => {
        reset(valoresPredet);
        setDesactivarBtn(true);
    };

    /**
     * Manejador de cambios para menú desplegable de pacientes.
     * @param {Event} e 
     */
    const manejadorCambiosPaciente = (e) => {
        dayjs.extend(customParseFormat);
        const pacienteSeleccionado = pacientes.find((x) => x.id == e.target.value);

        if (e.target.value != -1) {
            const comorbilidades = oneHotDecoderOtraEnfermedad(pacienteSeleccionado);
            setValue("sexo", pacienteSeleccionado.sexo);
            setValue("edad", dayjs().diff(dayjs(
                pacienteSeleccionado.fechaNacimiento, "DD-MM-YYYY"), "year", false
            ));
            setValue("otrasEnfermedades", comorbilidades);
            setValue("otraEnfermedad", pacienteSeleccionado.otraEnfermedad);
        } else {
            setValue("sexo", 2);
            for (const i of CAMPOS_TXT) {
                setValue(i, "");
            }
            for (const i of CAMPOS_BIN) {
                setValue(i, false);
            }
            setValue("otrasEnfermedades", []);
        }

        setValue("paciente", pacienteSeleccionado);
    };

    /**
     * Genera el diagnóstico y muestra el resultado en un modal.
     * @param {JSON} datos - Datos del formulario.
     */
    const diagnosticar = async (datos) => {
        const aux = {};
        const oneHotComor = oneHotEncoderOtraEnfermedad(datos.otraEnfermedad ? datos.otrasEnfermedades : []);

        for (let i = 0; i < CAMPOS_BIN.length; i++) {
            if (i < CAMPOS_TXT.length) {
                aux[CAMPOS_TXT[i]] = datos[CAMPOS_TXT[i]];
            }

            aux[CAMPOS_BIN[i]] = datos[CAMPOS_BIN[i]];
        }

        const cuerpo = transformarDatos(aux, oneHotComor);
        const res = await peticionApi(auth.authInfo.user.accessToken, "diagnosticar", "POST", cuerpo,
            t("errorDiagnostico")
        );
        const { success, data } = res;

        if (!success) {
            setCargando(false);
            setModal({ mostrar: true, titulo: t("tituloError"), mensaje: res.error });
        } else {
            await guardarDiagnostico(oneHotComor, datos, data);
        }
    };

    /**
     * Guarda el diagnóstico en la base de datos.
     * @param {JSON} oneHotComor - Datos de comorbilidades en formato one-hot.
     * @param {JSON} datos - Datos binarios y númericos del formulario.
     * @param {JSON} resultado - Diagnóstico generado por la API.
     */
    const guardarDiagnostico = async (oneHotComor, datos, resultado) => {
        const aux = {};
        

        // Convirtiendo los booleanos a 0 y 1
        for (const i of CAMPOS_BIN) {
            aux[i] = procBool(datos[i]);
        }

        // Transformando los datos de texto a números
        for (const i of CAMPOS_TXT) {
            if (typeof datos[i] == "string") {
                aux[i] = parseFloat(datos[i].replace(",", "."));
            } else {
                aux[i] = datos[i];
            }
        }
        const uid = auth.authInfo.uid;
        const id = `${v6()}-${uid}`;
        const paciente = esDiagPacientes ? datos.paciente.id : "Anónimo";
        const instancia = {
            id: id, medico: uid, ...aux, ...oneHotComor,
            probabilidad: resultado.probabilidad, diagnostico: procBool(resultado.prediccion),
            fecha: Timestamp.now(), validado: 2, paciente: paciente, lime: resultado.lime
        };

        const res = await cambiarDiagnostico(instancia, credenciales.obtenerInstanciaDB());

        if (res.success) {
            const url = esDiagPacientes ? "/diagnostico-paciente" : "/diagnostico-anonimo";
            navegacion.setPaginaAnterior(url);
            navigate(`/diagnosticos/ver-diagnostico?id=${instancia.id}`, { replace: true });
        } else {
            setCargando(false);
            setModal({
                mostrar: true,
                titulo: t("errTitGuardarDiag"),
                mensaje: t("errGuardarDiag", { error: res.data })
            });
        }
    };

    /**
     * Activa o desactiva el botón de inicio de sesión basado en la respuesta de reCAPTCHA.
     * @param {String|null} token - Token de reCAPTCHA recibido al completar el desafío.
     */
    const manejadorReCAPTCHA = async (token) => {
        const res = (typeof token == "string");
        if (res) {
            verificarRespuesta(token);
        } else {
            setDesactivarBtn(true);
        }
    };

    /**
     * Comprueba que la respuesta de reCAPTCHA sea que un usuario es un humano.
     * @param {string} token - Token de ReCAPTCHA
     */
    const verificarRespuesta = async (token) => {
        setCargandoBtn(true);
        const res = await peticionApi("", "recaptcha", "POST", { token: token }, t("errCaptchaApi"));

        if (res.success) {
            if (res.data.success) {
                setDesactivarBtn(false);
            } else {
                setModal({
                    mostrar: true, titulo: t("tituloError"),
                    mensaje: t("errCaptcha")
                });
                CAPTCHA.current.reset();
            }
        } else {
            let txtError = res.error;
            if (typeof res.error != "string") {
                for (const i of res.error) {
                    txtError += `${i} `;
                }
            }
            CAPTCHA.current.reset();
            setModal({ titulo: t("tituloError"), mostrar: true, mensaje: txtError });
        }
        setCargandoBtn(false);
    };

    /**
     * Manejador de botón de recarga de pacientes.
     */
    const manejadorBtnRecargar = () => {
        setCargando(true);

        if (getValues("paciente").id != -1) {
            setValue("paciente", { id: -1, nombre: t("txtSelecPaciente"), edad: "", sexo: 2, fechaNacimiento: null });
            setValue("sexo", 2);
            setValue("edad", "");
        }
    };

    return (
        <>
            {cargando ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="85vh">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <TabHeader
                        activarBtnAtras={false}
                        titulo={tituloHeader}
                        pestanas={listadoPestanas} />
                    <Grid container columns={numCols} spacing={2} sx={{ marginTop: "3vh" }}>
                        <Grid size={numCols}>
                            <Typography variant="h6">
                                <b>{t("titDatosPersonales")}</b>
                            </Typography>
                        </Grid>
                        {esDiagPacientes ? (
                            <Grid size={1}>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <Controller
                                        name="paciente"
                                        control={control}
                                        rules={{
                                            required: t("errValidarPaciente"),
                                            validate: (x) => x.id != -1 || t("errValidarPaciente")
                                        }}
                                        render={({ field }) => (
                                            <TextField
                                                select
                                                label={t("txtPaciente")}
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
                                    <Tooltip title={t("txtBtnRecargarPacientes")}>
                                        <IconButton onClick={() => manejadorRecarga(manejadorBtnRecargar, setCargando)}>
                                            <RefreshIcon fontSize="medium" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Grid>
                        ) : null}
                        <Grid size={1}>
                            <Controller
                                name="sexo"
                                control={control}
                                rules={{
                                    required: !esDiagPacientes && t("errValidarSexo"),
                                    validate: (x) => (esDiagPacientes || (x != 2 || t("errValidarSexo")))
                                }}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        label={t("txtCampoSexo")}
                                        {...field}
                                        error={!!errors.sexo}
                                        helperText={errors.sexo?.message}
                                        disabled={esDiagPacientes}
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
                                    required: !esDiagPacientes && t("errValidarEdad"),
                                    validate: (value) => (esDiagPacientes || (validarNumero(value) || t("errValidarEdad")))
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label={t("txtCampoEdad")}
                                        {...field}
                                        error={!!errors.edad}
                                        disabled={esDiagPacientes}
                                        helperText={errors.edad?.message}
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={numCols}>
                            <Typography variant="h6">
                                <b>{t("titSintomasClinicos")}</b>
                            </Typography>
                        </Grid>
                        <Grid container size={numCols} columns={numCols} columnSpacing={0} rowSpacing={0} rowGap={0} columnGap={0}>
                            {SINTOMAS.map((x) => (
                                <Grid size={1} key={x}>
                                    <Controller
                                        name={x}
                                        control={control}
                                        render={({ field }) => (
                                            <Check
                                                nombre={x}
                                                etiqueta={t(x)}
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
                                <b>{t("titSignosVitales")}</b>
                            </Typography>
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="presionSis"
                                control={control}
                                rules={{
                                    required: t("errCampoObligatorio"),
                                    validate: (value) => validarFloatPos(value) || t("errValidarNumPos")
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label={`${t("txtCampoPresionSist")} (mmHg)`}
                                        {...field}
                                        error={!!errors.presionSis}
                                        helperText={errors.presionSis?.message}
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
                                    required: t("errCampoObligatorio"),
                                    validate: (value) => validarFloatPos(value) || t("errValidarNumPos")
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label={`${t("txtCampoPresionDiast")} (mmHg)`}
                                        {...field}
                                        error={!!errors.presionDias}
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
                                    required: t("errCampoObligatorio"),
                                    validate: (value) => validarFloatPos(value) || t("errValidarNumPos")
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label={t("txtCampoFrecRes")}
                                        {...field}
                                        error={!!errors.frecRes}
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
                                    required: t("errCampoObligatorio"),
                                    validate: (value) => validarFloatPos(value) || t("errValidarNumPos")
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label={t("txtCampoFrecCard")}
                                        {...field}
                                        error={!!errors.frecCard}
                                        helperText={errors.frecCard?.message}
                                        fullWidth />)} />
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="so2"
                                control={control}
                                rules={{
                                    required: t("errCampoObligatorio"),
                                    validate: (value) => validarFloatPos(value) || t("errValidarNumPos")
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label={t("txtCampoSO2")}
                                        {...field}
                                        error={!!errors.so2}
                                        helperText={errors.so2?.message}
                                        fullWidth />)} />
                        </Grid>
                        <Grid size={numCols}>
                            <Typography variant="h6">
                                <b>{t("titExamenes")}</b>
                            </Typography>
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="plaquetas"
                                control={control}
                                rules={{
                                    required: t("errCampoObligatorio"),
                                    validate: (value) => validarFloatPos(value) || t("errValidarNumPos")
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label={t("txtCampoPLT")}
                                        {...field}
                                        error={!!errors.plaquetas}
                                        helperText={errors.plaquetas?.message}
                                        fullWidth />)} />
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="hemoglobina"
                                control={control}
                                rules={{
                                    required: t("errCampoObligatorio"),
                                    validate: (value) => validarFloatPos(value) || t("errValidarNumPos")
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label={t("txtCampoHB")}
                                        {...field}
                                        error={!!errors.hemoglobina}
                                        helperText={errors.hemoglobina?.message}
                                        fullWidth />)} />
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="wbc"
                                control={control}
                                rules={{
                                    required: t("errCampoObligatorio"),
                                    validate: (value) => validarFloatPos(value) || t("errValidarNumPos")
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label={t("txtCampoWBC")}
                                        {...field}
                                        error={!!errors.wbc}
                                        helperText={errors.wbc?.message}
                                        fullWidth />)} />
                        </Grid>
                        <Grid size={numCols}>
                            <Typography variant="h6">
                                <b>{t("titComor")}</b>
                            </Typography>
                        </Grid>
                        <Grid size={numCols}>
                            <Controller
                                name="otraEnfermedad"
                                control={control}
                                render={({ field }) => (
                                    <Check
                                        nombre="otraEnfermedad"
                                        etiqueta={t("txtOtraEnfermedad")}
                                        activado={field.value}
                                        desactivado={esDiagPacientes}
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
                                        required: otraEnfermedad ? t("errComor") : false,
                                    }}
                                    render={({ field }) => (
                                        <SelectChip
                                            valor={field.value}
                                            listaValores={COMORBILIDADES}
                                            manejadorCambios={field.onChange}
                                            nombre="comorbilidades"
                                            error={!!errors.otrasEnfermedades}
                                            txtError={errors.otrasEnfermedades?.message}
                                            desactivado={esDiagPacientes}
                                            etiqueta={t("txtComorbilidades")}
                                        />
                                    )}
                                />
                            </Grid>
                        ) : null}
                        <Grid size={numCols} display="flex" justifyContent="center">
                            <ReCAPTCHA
                                theme={temaCaptcha}
                                onChange={manejadorReCAPTCHA}
                                sitekey={reCAPTCHAApi}
                                ref={CAPTCHA} />
                        </Grid>
                        <Grid display="flex" justifyContent="center" size={numCols}>
                            <Stack direction="row" spacing={2}>
                                <Tooltip title={t("txtAyudaBtnVaciar")}>
                                    <Button
                                        startIcon={<ClearIcon />}
                                        variant="contained"
                                        onClick={manejadorBtnVaciar}
                                        sx={{
                                            textTransform: "none"
                                        }}>
                                        <b>{t("txtBtnVaciar")}</b>
                                    </Button>
                                </Tooltip>
                                <Tooltip title={t("txtAyudaBtnDiagnosticar")}>
                                    <span>
                                        <Button
                                            startIcon={<DiagnosticoIcono />}
                                            variant="contained"
                                            onClick={handleSubmit(onSubmit)}
                                            loading={cargandoBtn}
                                            disabled={desactivarBtn}
                                            loadingPosition="end"
                                            sx={{
                                                textTransform: "none"
                                            }}>
                                            <b>{t("txtBtnDiagnosticar")}</b>
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
                txtBtn={t("txtBtnCerrar")}
                iconoBtn={<CloseIcon />}
                manejadorBtnModal={() => setModal((x) => ({ ...x, mostrar: false }))} />
        </>
    );
};