import {
    Grid, Button, Typography, TextField, Stack, Tooltip, Box,
    CircularProgress, MenuItem, IconButton
} from "@mui/material";
import { useEffect, useState } from "react";

import { CAMPOS_BIN, CAMPOS_DECIMALES, CAMPOS_ENTEROS, COMORBILIDADES, SEXOS } from "../../constants";
import CloseIcon from "@mui/icons-material/Close";
import ClearIcon from '@mui/icons-material/Clear';
import { DiagnosticoIcono } from "../icons/IconosSidebar";
import { validarFloatPos, validarNumero } from "../../utils/Validadores";


import { useNavigate } from "react-router";
import { v6 } from "uuid";
import { Timestamp } from "firebase/firestore";
import TabHeader from "../layout/TabHeader";
import ReCAPTCHA from "react-google-recaptcha";
import { useForm, Controller } from "react-hook-form";
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from "react-i18next";

import { Check } from "../tabs";
import { SelectChip } from "../selects";
import { PantallaCarga } from "../layout";
import { Captcha } from "../captcha";
import { useAuth, useDiagnosticos } from "../../hooks";
import { Diagnostico, Paciente } from "../../models";
import { ModalSimple } from "../modals";


const valoresPredet = {
    paciente: new Paciente(null, null, "txtSelectPaciente", 2, null, null, null, false),
    id: v6(),
    sexo: 2, fumador: false, bebedor: false, tos: false, fiebre: false,
    crepitaciones: false, dolor_toracico: false, malignidad: false,
    hemoptisis: false, disnea: false, sibilancias: false,
    derrame: false, TEVP_TVP_previo: false, edema_de_m_inferiores: false,
    sintomas_disautonomicos: false,
    inmovilidad_de_m_inferiores: false, viaje_prolongado: false, proc_quirurgico_traumatismo: false,
    otra_enfermedad: false, soplos: false,
    edad: "", presion_sistolica: "", presion_diastolica: "", frecuencia_respiratoria: "",
    frecuencia_cardiaca: "", saturacion_de_la_sangre: "", plt: "", hb: "", wbc: "",
    comorbilidades: []
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

    const { usuario } = useAuth();
    const { generarDiagnostico } = useDiagnosticos();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const [desactivarBtn, setDesactivarBtn] = useState(true);
    const [cargando, setCargando] = useState(true);
    const [modal, setModal] = useState({ mostrar: false, titulo: "", mensaje: "" });
    const [cargandoBtn, setCargandoBtn] = useState(false);
    const { getValues, setValue, control, handleSubmit, reset, watch, formState: { errors } } = useForm({
        defaultValues: valoresPredet, mode: "onBlur"
    });
    const otraEnfermedad = watch("otraEnfermedad");

    // Quita la pantalla de carga inicial cuando se tienen los datos de los pacientes.
    useEffect(() => {
        if (esDiagPacientes && (pacientes != null)) {
            setCargando(false);
        }
    }, [esDiagPacientes, pacientes]);


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
            datos.comorbilidades, new Date(), datos.otraEnfermedad, binarios, numericos
        );
        const { success, data, error } = await generarDiagnostico(inst);

        if (success) {
            navigate(`/diagnosticos/${inst.id}`, { state: Diagnostico.fromJson(data) });
        } else {
            setModal({ mostrar: true, texto: t("errGuardarDiag", { error: error }) });
            setCargando(false);
        }
    }

    function manejadorBtnVaciar() {
        reset(valoresPredet);
        setDesactivarBtn(true);
    }

    /**
     * @param {Event} e Evento de cambio del select de pacientes.
     */
    const manejadorCambioPaciente = (e) => {
        const paciente = pacientes.find((x) => x.id == e.target.value);

        if (e.target.value != -1) {
            setValue("sexo", paciente.sexo);
            setValue("edad", paciente.edad);
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
        const idPaciente = getValues("paciente").id;

        if (idPaciente) {
            setValue("paciente", valoresPredet.paciente);
            setValue("sexo", 2);
            setValue("edad", "");
            setValue("otra_enfermedad", false);
            setValue("comorbilidades", []);
        }
        await manejadorRecarga();
    };

    function cerrarModal() {
        setModal((x) => ({ ...x, mostrar: false }));
    };

    return (
        <>
            {cargando ? (
                <PantallaCarga />
            ) : (
                <>
                    <TabHeader
                        titulo={tituloHeader}
                        pestanas={listadoPestanas}
                        activarBtnAtras={false} />
                    <Grid container columns={{ xs: 1, sm: 2, md: 3 }} spacing={2} sx={{ marginTop: "3vh" }}>
                        <Grid size={{ xs: 1, sm: 2, md: 3 }}>
                            <Typography variant="h6" fontWeight="bold">
                                {t("titDatosPersonales")}
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
                                                onChange={manejadorCambioPaciente}
                                                error={!!errors.paciente}
                                                helperText={errors.paciente?.message}
                                                fullWidth>
                                                {pacientes.map((x) => (
                                                    <MenuItem key={x.id} value={x}>
                                                        {x.nombre}
                                                    </MenuItem>
                                                ))}
                                            </TextField>)} />
                                    <Tooltip title={t("txtBtnRecargarPacientes")}>
                                        <IconButton onClick={manejadorBtnRecargar}>
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
                        <Grid size={{ xs: 1, sm: 2, md: 3 }}>
                            <Typography variant="h6" fontWeight="bold">
                                {t("titSintomasClinicos")}
                            </Typography>
                        </Grid>
                        <Grid container size={{ xs: 1, sm: 2, md: 3 }} columns={{ xs: 1, sm: 2, md: 3 }} columnSpacing={0} rowSpacing={0} rowGap={0} columnGap={0}>
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
                        <Grid size={{ xs: 1, sm: 2, md: 3 }}>
                            <Typography variant="h6" fontWeight="bold">
                                {t("titSignosVitales")}
                            </Typography>
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="presion_sistolica"
                                control={control}
                                rules={{
                                    required: t("errCampoObligatorio"),
                                    validate: (value) => validarFloatPos(value) || t("errValidarNumPos")
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label={`${t("txtCampoPresionSist")} (mmHg)`}
                                        {...field}
                                        error={errors.presion_sistolica}
                                        helperText={errors.presion_sistolica?.message}
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="presion_diastolica"
                                control={control}
                                rules={{
                                    required: t("errCampoObligatorio"),
                                    validate: (value) => validarFloatPos(value) || t("errValidarNumPos")
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label={`${t("txtCampoPresionDiast")} (mmHg)`}
                                        {...field}
                                        error={errors.presion_diastolica}
                                        helperText={errors.presion_diastolica?.message}
                                        fullWidth />
                                )}
                            />
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="frecuencia_respiratoria"
                                control={control}
                                rules={{
                                    required: t("errCampoObligatorio"),
                                    validate: (value) => validarFloatPos(value) || t("errValidarNumPos")
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label={t("txtCampoFrecRes")}
                                        {...field}
                                        error={errors.frecuencia_respiratoria}
                                        helperText={errors.frecuencia_respiratoria?.message}
                                        fullWidth />
                                )}
                            />
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="frecuencia_cardiaca"
                                control={control}
                                rules={{
                                    required: t("errCampoObligatorio"),
                                    validate: (value) => validarFloatPos(value) || t("errValidarNumPos")
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label={t("txtCampoFrecCard")}
                                        {...field}
                                        error={errors.frecuencia_cardiaca}
                                        helperText={errors.frecuencia_cardiaca?.message}
                                        fullWidth />)} />
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="saturacion_de_la_sangre"
                                control={control}
                                rules={{
                                    required: t("errCampoObligatorio"),
                                    validate: (value) => validarFloatPos(value) || t("errValidarNumPos")
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label={t("txtCampoSO2")}
                                        {...field}
                                        error={errors.saturacion_de_la_sangre}
                                        helperText={errors.saturacion_de_la_sangre?.message}
                                        fullWidth />)} />
                        </Grid>
                        <Grid size={{ xs: 1, sm: 2, md: 3 }}>
                            <Typography variant="h6" fontWeight="bold">
                                {t("titExamenes")}
                            </Typography>
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="plt"
                                control={control}
                                rules={{
                                    required: t("errCampoObligatorio"),
                                    validate: (value) => validarFloatPos(value) || t("errValidarNumPos")
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label={t("txtCampoPLT")}
                                        {...field}
                                        error={errors.plt}
                                        helperText={errors.plt?.message}
                                        fullWidth />)} />
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="hb"
                                control={control}
                                rules={{
                                    required: t("errCampoObligatorio"),
                                    validate: (value) => validarFloatPos(value) || t("errValidarNumPos")
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label={t("txtCampoHB")}
                                        {...field}
                                        error={errors.hb}
                                        helperText={errors.hb?.message}
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
                                        error={errors.wbc}
                                        helperText={errors.wbc?.message}
                                        fullWidth />)} />
                        </Grid>
                        <Grid size={{ xs: 1, sm: 2, md: 3 }}>
                            <Typography variant="h6" fontWeight="bold">
                                {t("titComor")}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 1, sm: 2, md: 3 }}>
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
                            <Grid size={{ xs: 1, sm: 2, md: 3 }}>
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
                        <Grid size={{ xs: 1, sm: 2, md: 3 }} display="flex" justifyContent="center">
                            <Captcha
                                setCarga={setCargandoBtn}
                                setCaptchaAceptado={setDesactivarBtn} />
                        </Grid>
                        <Grid display="flex" justifyContent="center" size={{ xs: 1, sm: 2, md: 3 }}>
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
                                            onClick={handleSubmit(manejadorGuardado)}
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
                mostrar={modal.mostrar}
                titulo={t("titError")}
                texto={modal.texto}
                txtBtn={t("txtBtnCerrar")}
                manejadorBtnModal={cerrarModal}
                iconoBtn={<CloseIcon />} />
        </>
    );
};