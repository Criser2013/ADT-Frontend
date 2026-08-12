import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from '@mui/icons-material/Refresh';
import {
    Button, Typography, TextField, Tooltip, MenuItem, IconButton, Grid
} from "@mui/material";
import {
    CAMPOS_BIN, CAMPOS_DECIMALES, CAMPOS_ENTEROS,
    COMORBILIDADES, SEXOS
} from "../../constants";
import { Captcha } from "../captcha";
import { Check } from "../tabs";
import { Controller, useForm } from "react-hook-form";
import { Diagnostico, Paciente } from "../../models";
import { DiagnosticoIcono } from "../icons/IconosSidebar";
import { ModalSimple } from "../modals";
import { PantallaCarga, TabHeader } from "../layout";
import { SelectChip } from "../selects";
import { useAuth, useOperacionesDiagnosticos } from "../../hooks";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { v6 } from "uuid";
import { validarFloatPos, validarNumero } from "../../utils/Validadores";

const valoresPredet = {
    paciente: new Paciente("null", null, "txtSelectPaciente", 2, null, null, null, false),
    id: v6(),
    sexo: 2, fumador: false, bebedor: false, tos: false, fiebre: false,
    crepitaciones: false, dolor_toracico: false, malignidad: false,
    hemoptisis: false, disnea: false, sibilancias: false,
    derrame: false, TEP_TVP_previo: false, edema_de_m_inferiores: false,
    sintomas_disautonomicos: false,
    inmovilidad_de_m_inferiores: false, viaje_prolongado: false, proc_quirurgico_traumatismo: false,
    otra_enfermedad: false, soplos: false,
    edad: "", presion_sistolica: "", presion_diastolica: "", frecuencia_respiratoria: "",
    frecuencia_cardiaca: "", saturacion_de_la_sangre: "", plt: "", hb: "", wbc: "",
    comorbilidades: []
};
const numColumnas = { xs: 1, md: 2, lg: 3 };


/**
 * Formulario para realizar un diagnostico de TEP.
 * @param {String} titulo Título del encabezado.
 * @param {Boolean} esDiagPacientes Indica si el formulario es para diagnosticar pacientes.
 * @param {Array<Paciente>} pacientes Lista de pacientes registrados.
 * @param {Array<Object>} pestanas Lista de pestañas con objetos de la forma { texto: String, url: String }.
 * @param {Function} manejadorRecarga Función para ejecutar la carga de las instancias de pacientes.
 * @param {Boolean} indicadorDatosCargados Indica si los datos de pacientes han sido cargados.
 * @returns {JSX.Element}
 */
export default function FormDiagnostico({
    titulo, esDiagPacientes = false, pacientes = [],
    pestanas, manejadorRecarga = null, indicadorDatosCargados = false
}) {
    const navigate = useNavigate();
    const { generarDiagnostico } = useOperacionesDiagnosticos();
    const { t } = useTranslation();
    const { usuario } = useAuth();
    const [cargando, setCargando] = useState(esDiagPacientes);
    const [cargandoBtn, setCargandoBtn] = useState(false);
    const [captchaAceptado, setCaptchaAceptado] = useState(false);
    const [modal, setModal] = useState({ mostrar: false, texto: "" });
    const { getValues, setValue, control, handleSubmit, reset, watch, formState: { errors } } = useForm({
        defaultValues: valoresPredet, mode: "onBlur"
    });
    const listaPacientes = useMemo(() =>
        Array.isArray(pacientes) ? [valoresPredet.paciente, ...pacientes] : [valoresPredet.paciente]
        , [pacientes]);
    const otraEnfermedad = watch("otra_enfermedad");

    useEffect(() => {
        if (esDiagPacientes && indicadorDatosCargados) {
            setCargando(false);
        }
    }, [esDiagPacientes, indicadorDatosCargados, setCargando]);

    function manejadorBtnVaciar() {
        reset(valoresPredet);
        setCaptchaAceptado(false);
    };

    /**
     * @param {Event} e Evento de cambio del select de pacientes.
     */
    function manejadorCambioPaciente(e) {
        const paciente = e.target.value;

        if (paciente.id != "null") {
            setValue("sexo", paciente.sexo);
            setValue("edad", paciente.edad.toString());
            setValue("otra_enfermedad", paciente.otraEnfermedad);
            setValue("comorbilidades", paciente.comorbilidades);
        } else {
            setValue("sexo", 2);
            setValue("edad", "");
            setValue("otra_enfermedad", false);
            setValue("comorbilidades", []);
        }

        setValue("paciente", paciente);
    };

    async function manejadorBtnRecargar() {
        setCargando(true);
        setCaptchaAceptado(false);
        const idPaciente = getValues("paciente").id;

        if (idPaciente != "null") {
            setValue("paciente", valoresPredet.paciente);
            setValue("sexo", 2);
            setValue("edad", "");
            setValue("otra_enfermedad", false);
            setValue("comorbilidades", []);
        }
        await manejadorRecarga();
        setCargando(false);
    };

    /**
     * @param {Object} datos Contenido del formulario de diagnóstico.
     */
    async function manejadorGuardado(datos) {
        setCargando(true);
        const binarios = {};
        const numericos = {};

        for (const i of CAMPOS_BIN) {
            binarios[i] = datos[i];
        }
        for (const i of CAMPOS_DECIMALES) {
            numericos[i] = parseFloat(datos[i].replace(",", "."));
        }
        for (const i of CAMPOS_ENTEROS) {
            numericos[i] = parseInt(datos[i], 10);
        }

        const inst = new Diagnostico(
            datos.id, usuario.uid, esDiagPacientes ? datos.paciente.id : null,
            datos.comorbilidades, new Date(), datos.sexo, datos.otra_enfermedad, binarios, numericos
        );
        const { success, error } = await generarDiagnostico(inst);

        if (success) {
            navigate(`/diagnosticos/${inst.id}-${inst.usuario}`);
        } else {
            setModal({ mostrar: true, texto: t("errGuardarDiag", { error: t(error) }) });
            setCaptchaAceptado(false);
            setCargando(false);
        }
    };

    return (
        <>
            {cargando ? <PantallaCarga /> :
                (<>
                    <TabHeader
                        titulo={titulo}
                        pestanas={pestanas}
                        activarBtnAtras={false} />
                    <Grid container columns={numColumnas} spacing={2} sx={{ marginTop: "3vh" }}>
                        <Grid size={numColumnas}>
                            <Typography variant="h6" fontWeight="bold">
                                {t("titDatosPersonales")}
                            </Typography>
                        </Grid>
                        {esDiagPacientes ? (
                            <Grid container size={1} columns={12} columnGap={2}>
                                <Grid size={11}>
                                    <Controller
                                        name="paciente"
                                        control={control}
                                        rules={{
                                            required: t("errValidarPaciente"),
                                            validate: (x) => x.id != "null" || t("errValidarPaciente")
                                        }}
                                        render={({ field }) => (
                                            <TextField
                                                select
                                                fullWidth
                                                label={t("txtPaciente")}
                                                {...field}
                                                value={field.value}
                                                onChange={manejadorCambioPaciente}
                                                error={errors.paciente}
                                                helperText={errors.paciente?.message} >
                                                {listaPacientes.map((x) => (
                                                    <MenuItem key={x.id} value={x}>
                                                        {t(x.nombre)}
                                                    </MenuItem>
                                                ))}
                                            </TextField>)} />
                                </Grid>
                                <Grid size={1} display="flex" justifyContent="center" alignItems="center">
                                    <Tooltip title={t("txtBtnRecargarPacientes")}>
                                        <IconButton onClick={manejadorBtnRecargar}>
                                            <RefreshIcon fontSize="medium" />
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
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
                                        error={errors.sexo}
                                        helperText={errors.sexo?.message}
                                        disabled={esDiagPacientes}
                                        fullWidth>
                                        {SEXOS.map((x) => (
                                            <MenuItem key={x.val} value={x.val}>
                                                {t(x.texto)}
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
                                        label={t("edad")}
                                        {...field}
                                        error={errors.edad}
                                        disabled={esDiagPacientes}
                                        helperText={errors.edad?.message}
                                        fullWidth />
                                )}
                            />
                        </Grid>
                        <Grid size={numColumnas}>
                            <Typography variant="h6" fontWeight="bold">
                                {t("titSintomasClinicos")}
                            </Typography>
                        </Grid>
                        <Grid
                            container
                            size={numColumnas}
                            columns={numColumnas}
                            columnSpacing={0}
                            rowSpacing={0}
                            rowGap={0}
                            columnGap={0} >
                            {CAMPOS_BIN.map((x) => (
                                <Grid size={1} key={x}>
                                    <Controller
                                        name={x}
                                        control={control}
                                        render={({ field }) => (
                                            <Check
                                                marcado={field.value}
                                                manejadorCambios={field.onChange}
                                                nombre={x}
                                                etiqueta={t(x)} />
                                        )} />
                                </Grid>
                            ))}
                        </Grid>
                        <Grid size={numColumnas}>
                            <Typography variant="h6" fontWeight="bold">
                                {t("titSignosVitales")}
                            </Typography>
                        </Grid>
                        {["presion_sistolica", "presion_diastolica", "frecuencia_respiratoria",
                            "frecuencia_cardiaca", "saturacion_de_la_sangre"].map((campo) => (
                                <Grid size={1} key={campo}>
                                    <Controller
                                        name={campo}
                                        control={control}
                                        rules={{
                                            required: t("errCampoObligatorio"),
                                            validate: (value) => validarFloatPos(value) || t("errValidarNumPos")
                                        }}
                                        render={({ field }) => (
                                            <TextField
                                                label={t(campo)}
                                                {...field}
                                                error={errors[campo]}
                                                helperText={errors[campo]?.message}
                                                fullWidth />
                                        )} />
                                </Grid>
                            ))}
                        <Grid size={numColumnas}>
                            <Typography variant="h6" fontWeight="bold">
                                {t("titExamenes")}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 1, sm: 2, md: 3 }} container columns={numColumnas} spacing={2}>
                            {["plt", "hb", "wbc"].map((campo) => (
                                <Grid key={campo} size={1}>
                                    <Controller
                                        name={campo}
                                        control={control}
                                        rules={{
                                            required: t("errCampoObligatorio"),
                                            validate: (value) => validarFloatPos(value) || t("errValidarNumPos")
                                        }}
                                        render={({ field }) => (
                                            <TextField
                                                label={t(campo)}
                                                {...field}
                                                error={errors[campo]}
                                                helperText={errors[campo]?.message}
                                                fullWidth />
                                        )} />
                                </Grid>
                            ))}
                            <Grid size={numColumnas}>
                                <Typography variant="h6" fontWeight="bold">
                                    {t("titComor")}
                                </Typography>
                            </Grid>
                            <Grid size={numColumnas}>
                                <Controller
                                    name="otra_enfermedad"
                                    control={control}
                                    render={({ field }) => (
                                        <Check
                                            marcado={field.value}
                                            desactivar={esDiagPacientes}
                                            manejadorCambios={field.onChange}
                                            etiqueta={t("txtOtraEnfermedad")} />
                                    )} />
                            </Grid>
                            {otraEnfermedad ? (
                                <Grid size={numColumnas}>
                                    <Controller
                                        name="comorbilidades"
                                        control={control}
                                        rules={{
                                            required: otraEnfermedad ? t("errComor") : false,
                                        }}
                                        render={({ field }) => (
                                            <SelectChip
                                                valores={field.value}
                                                listaValores={COMORBILIDADES}
                                                etiqueta={t("txtComorbilidades")}
                                                manejadorCambios={field.onChange}
                                                error={errors.comorbilidades}
                                                txtError={errors.comorbilidades?.message}
                                                desactivar={esDiagPacientes} />
                                        )}
                                    />
                                </Grid>
                            ) : null}
                            <Grid size={numColumnas} display="flex" justifyContent="center">
                                <Captcha
                                    setCarga={setCargandoBtn}
                                    setCaptchaAceptado={setCaptchaAceptado} />
                            </Grid>
                            <Grid display="flex" justifyContent="center" size={numColumnas} columnGap={1}>
                                <Tooltip title={t("txtAyudaBtnVaciar")}>
                                    <Button
                                        startIcon={<ClearIcon />}
                                        variant="contained"
                                        onClick={manejadorBtnVaciar}
                                        sx={{
                                            textTransform: "none",
                                            textDecoration: "bold"
                                        }}>
                                        <b>{t("txtBtnVaciar")}</b>
                                    </Button>
                                </Tooltip>
                                <Tooltip title={t("txtAyudaBtnDiagnosticar")}>
                                    <span>
                                        <Button
                                            startIcon={<DiagnosticoIcono />}
                                            variant="contained"
                                            onClick={handleSubmit(manejadorGuardado)}
                                            loading={cargandoBtn}
                                            disabled={!captchaAceptado}
                                            loadingPosition="end"
                                            sx={{
                                                textTransform: "none"
                                            }}>
                                            <b>{t("txtBtnDiagnosticar")}</b>
                                        </Button>
                                    </span>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Grid>
                </>)}
            <ModalSimple
                mostrar={modal.mostrar}
                titulo={t("tituloErr")}
                texto={modal.texto}
                txtBtn={t("txtBtnCerrar")}
                manejadorBtn={() => setModal((x) => ({ ...x, mostrar: false }))}
                iconoBtn={<CloseIcon />} />
        </>
    );
};