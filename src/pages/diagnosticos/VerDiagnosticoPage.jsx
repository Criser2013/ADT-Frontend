import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    Box, CircularProgress, Grid, Typography, Divider, Stack, Tooltip,
    Button, IconButton
} from "@mui/material";
import { BtnFlotante, Check } from "../../components/tabs";
import { CAMPOS_BIN, COMORBILIDADES } from "../../constants";
import { CampoTexto, ContComorbilidades, ContLime } from "../../components/diagnosticos";
import { ChipDiagnostico, ChipSexo, ChipValidado } from "../../components/tabs/Chips";
import { Diagnostico, Paciente, Usuario } from "../../models";
import { FormValidacion } from "../../components/forms";
import { MenuLayout, PantallaCarga, TabHeader } from "../../components/layout";
import { ModalDoble, ModalSimple } from "../../components/modals";
import { useAuth, useDiagnosticos, usePacientes, useUsuarios } from "../../hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { validarId } from "../../utils/Validadores";

const numCols = { xs: 12, lg: 6, xl: 4 };

function detTextoPersona (rol, nombre) {
    if (rol && nombre == "null") {
        return ["txtUsuario", "txtEliminado"];
    } else if (!rol && nombre == "anonimo") {
        return ["txtPaciente", "txtAnonimo"];
    } else if (!rol && nombre == "eliminado") {
        return ["txtPaciente", "txtEliminado"];
    } else {
        return [nombre];
    }
};

/**
 * Página para ver los datos de un diagnóstico.
 * @returns {JSX.Element}
 */
export default function VerDiagnosticoPage() {
    const navigate = useNavigate();
    const { eliminarDiagnosticos, verDiagnostico, validarDiagnostico,
        helperListo: diagnosticosListo } = useDiagnosticos();
    const { id } = useParams();
    const { t } = useTranslation();
    const { usuario } = useAuth();
    const { verPaciente, helperListo: pacientesListo } = usePacientes();
    const { verUsuario, helperListo: usuariosListo } = useUsuarios();
    const [cargando, setCargando] = useState(true);
    const [diagnostico, setDiagnostico] = useState(null);
    const [persona, setPersona] = useState(null);
    const [modalError, setModalError] = useState({ mostrar: false, texto: "" });
    const [modalEliminacion, setModalEliminacion] = useState(false);
    const [modalValidacion, setModalValidacion] = useState(false);

    const camposPersonales = useMemo(() => {
        const campoNombre = { id: "nombre", titulo: usuario?.rolVisible ? t("txtMedico") : t("txtPaciente") };
        const res = detTextoPersona(usuario?.rolVisible, persona?.nombre);
        campoNombre.valor = res.length == 1 ? res[0] : `${t(res[0])} ${t(res[1])}`;

        return [
            { id: "id", titulo: "ID", valor: diagnostico?.id }, campoNombre,
            { id: "sexo", titulo: t("txtCampoSexo"), componente: <ChipSexo valor={diagnostico?.sexo} /> },
            { id: "edad", titulo: t("txtCampoEdad"), valor: `${diagnostico?.sintomasNumericos.edad} ${t("txtSufijoEdad")}` },
            { id: "fecha", titulo: t("txtCampoFechaDiag"), valor: dayjs(diagnostico?.fecha).format(t("formatoFechaCompleta")) },
            { id: "diagnosticoModelo", titulo: t("txtCampoDiagModelo"), componente: <ChipDiagnostico valor={diagnostico?.diagnosticoModelo} /> },
            { id: "probabilidad", titulo: t("txtCampoProbabilidad"), valor: `${(diagnostico?.probabilidad * 100).toFixed(2)}%` },
            { id: "diagnosticoMedico", titulo: t("txtCampoDiagMedico"), componente: <ChipValidado valor={diagnostico?.diagnosticoMedico} /> },
        ];
    }, [usuario, diagnostico, persona, t]);
    const camposVitales = useMemo(() => [
        { id: "presionSistolica", titulo: t("txtCampoPresionSist"), valor: `${diagnostico?.sintomasNumericos.presion_sistolica} mmHg.` },
        { id: "presionDiastolica", titulo: t("txtCampoPresionDiast"), valor: `${diagnostico?.sintomasNumericos.presion_diastolica} mmHg.` },
        { id: "frecuenciaCardiaca", titulo: t("txtCampoFrecCard"), valor: `${diagnostico?.sintomasNumericos.frecuencia_cardiaca} lpm.` },
        { id: "frecuenciaRespiratoria", titulo: t("txtCampoFrecRes"), valor: `${diagnostico?.sintomasNumericos.frecuencia_respiratoria} rpm.` },
        { id: "saturacionDeLaSangre", titulo: t("txtCampoSO2"), valor: `${diagnostico?.sintomasNumericos.saturacion_de_la_sangre} %` },
    ], [diagnostico, t]);
    const camposExamenes = useMemo(() => [
        { id: "plt", titulo: t("txtCampoPLT"), valor: `${diagnostico?.sintomasNumericos.plt} /µL.` },
        { id: "hb", titulo: t("txtCampoHB"), valor: `${diagnostico?.sintomasNumericos.hb} g/dL.` },
        { id: "wbc", titulo: t("txtCampoWBC"), valor: `${diagnostico?.sintomasNumericos.wbc} /µL.` },
    ], [diagnostico, t]);
    const listadoPestanas = useMemo(() => {
        const res = detTextoPersona(usuario?.rolVisible, persona?.nombre);
        const nombre = res.length == 1 ? res[0] : `${t(res[0])} ${t(res[1])}`;
        return [
            { texto: usuario?.rolVisible ? t("txtDatosRecolectados") : t("txtHistorialDiagnosticos"), url: "/diagnosticos" },
            { texto: `${usuario?.rolVisible ? t("txtDiagnostico") : t("txtPaciente")} — ${nombre} - ${diagnostico?.fecha.toLocaleString()}` }
        ];
    }, [usuario, persona, diagnostico, t]);

    useEffect(() => {
        const expIdUsuario = /-\w{28}$/;
        const res = validarId(id.replace(expIdUsuario, "")) && expIdUsuario.test(id);
        if (!res) {
            navigate("/diagnosticos");
        }
    }, [id, navigate]);

    useEffect(() => {
        let titulo = usuario?.rolVisible ? t("titDiagnostico") : t("titVerDiagnostico");
        if (diagnostico && persona) {
            const res = detTextoPersona(usuario?.rolVisible, persona?.nombre);
            const nombre = res.length == 1 ? res[0] : `${t(res[0])} ${t(res[1])}`;
            titulo = `${t("txtDiagnostico")} — ${nombre} - ${diagnostico?.fecha.toLocaleString()}`;
        }
        document.title = titulo;
    }, [usuario, persona, diagnostico, t]);

    const cargarDiagnostico = useCallback(async (id) => {
        const { success, data } = await verDiagnostico(id);
        if (success) {
            setDiagnostico(data);
        } else {
            navigate("/diagnosticos");
        }
    }, [navigate, verDiagnostico]);

    /**
     * @param {String} id  UID del paciente.
     * @param {Boolean} esAnonimo Indica si el paciente es anónimo o no.
     */
    const cargarPaciente = useCallback(async (id, esAnonimo = false) => {
        if (esAnonimo) {
            setPersona(
                new Paciente(
                    "null", null, "anonimo", 2, null, null, null, false, []
                )
            );
            return;
        }
        const { success, data, error } = await verPaciente(id);
        if (success) {
            setPersona(data);
        } else {
            setPersona(
                new Paciente(
                    "null", null, "eliminado", 2, null, null, null, false, []
                )
            );
            setModalError({ mostrar: true, texto: error });
        }
    }, [setPersona, verPaciente]);

    /**
    * @param {String} uid UID del usuario.
    */
    const cargarUsuario = useCallback(async (uid) => {
        const { success, data, error } = await verUsuario(uid);
        if (success) {
            setPersona(data);
        } else {
            setPersona(
                new Usuario(
                    "null", null, "", false, false, null, null
                )
            );
            setModalError({ mostrar: true, texto: error });
        }
    }, [setPersona, verUsuario]);

    function cerrarModalEliminacion() {
        setModalEliminacion(false);
    };

    function cerrarModalError() {
        setModalError({ ...modalError, mostrar: false });
    };

    function cerrarModalValidacion() {
        setModalValidacion(false);
    };

    async function manejadorBtnBorrar() {
        cerrarModalEliminacion();
        setCargando(true);
        const { success, error } = await eliminarDiagnosticos(id);
        if (success) {
            navigate("/diagnosticos");
        } else {
            setModalError({ mostrar: true, texto: error });
            setCargando(false);
        }
    };

    function manejadorBtnEliminar() {
        setModalEliminacion(true);
    };

    /**
     * @param {Object} diagnosticoMedico Diagnóstico TEP confirmado por el médico.
     */
    async function manejadorBtnValidar({ diagnosticoMedico }) {
        cerrarModalValidacion();
        setCargando(true);
        const { success, data, error } = await validarDiagnostico(diagnostico, diagnosticoMedico);
        if (success) {
            setDiagnostico(data);
        } else {
            setModalError({ mostrar: true, texto: t(error) });
        }
        setCargando(false);
    };

    function manejadorBtnValidarDiagnostico() {
        setModalValidacion(true);
    };

    useEffect(() => {
        if (usuario?.rolVisible && usuariosListo) {
            const uid = id.substring(37);
            cargarUsuario(uid);
        }
    }, [usuario?.rolVisible, usuariosListo, cargarUsuario, id]);

    useEffect(() => {
        if (!usuario?.rolVisible && diagnostico && pacientesListo) {
            const uid = diagnostico.paciente;
            cargarPaciente(uid, !uid);
        }
    }, [diagnostico, usuario?.rolVisible, pacientesListo, cargarPaciente]);

    useEffect(() => {

        if (diagnosticosListo && !diagnostico) {
            cargarDiagnostico(id);
        }
    }, [diagnosticosListo, diagnostico, cargarDiagnostico, id]);

    useEffect(() => {
        setCargando(true);
    }, [usuario?.modoUsuario]);

    useEffect(() => {
        setCargando(!(diagnostico && persona));
    }, [persona, diagnostico]);

    return (
        <>
            <MenuLayout>
                {cargando ? (
                    <PantallaCarga />
                ) : (
                    <>
                        <TabHeader
                            activarBtnAtras
                            titulo={t("titDiagnostico")}
                            pestanas={listadoPestanas}
                            tooltip={t("txtVolverAtrasDiagnosticos")} />
                        <Grid container
                            columns={12}
                            spacing={1}
                            marginTop="3vh">
                            {usuario?.rolVisible ? (
                                <Grid size={12} display="flex" justifyContent="end" margin="-2vh 0vw">
                                    <Tooltip title={t("txtAyudaEliminarDiagnostico")}>
                                        <IconButton color="inherit" onClick={manejadorBtnEliminar}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Grid>) : null}
                            <Grid size={12}>
                                <Typography variant="h5" paddingBottom="2vh">
                                    {t("titDatosPersonales")}
                                </Typography>
                            </Grid>
                            {camposPersonales.map((X) => (
                                <CampoTexto
                                    key={X.id}
                                    tamano={numCols}
                                    titulo={X.titulo}
                                    valor={X?.valor}
                                    componente={X?.componente} />
                            ))}
                            <Grid size={12} paddingTop="3vh">
                                <Divider />
                            </Grid>
                            <Grid size={12} paddingTop="3vh">
                                <ContLime diagnostico={diagnostico} />
                            </Grid>
                            <Grid size={12} paddingTop="3vh">
                                <Divider />
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="h5" paddingBottom="0.2vh">
                                    {t("titSintomasClinicos")}
                                </Typography>
                            </Grid>
                            <Grid container size={12} columns={12} columnSpacing={0} rowSpacing={0} rowGap={0} columnGap={0}>
                                {CAMPOS_BIN.map((x) => (
                                    <Grid size={numCols} key={x}>
                                        <Check
                                            desactivar
                                            marcado={diagnostico.sintomasBinarios[x]}
                                            manejadorCambios={null}
                                            etiqueta={t(x)} />
                                    </Grid>
                                ))}
                            </Grid>
                            <Grid size={12} paddingTop="3vh">
                                <Divider />
                            </Grid>
                            <Grid size={12} paddingBottom="2vh">
                                <Typography variant="h5">
                                    {t("titSignosVitales")}
                                </Typography>
                            </Grid>
                            {camposVitales.map((x) => (
                                <CampoTexto
                                    key={x.id}
                                    tamano={numCols}
                                    titulo={x.titulo}
                                    valor={x?.valor}
                                    componente={x?.componente} />
                            ))}
                            <Grid size={12} paddingTop="3vh">
                                <Divider />
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="h5" paddingBottom="2vh">
                                    {t("titExamenes")}
                                </Typography>
                            </Grid>
                            {camposExamenes.map((x) => (
                                <CampoTexto
                                    key={x.id}
                                    tamano={numCols}
                                    titulo={x.titulo}
                                    valor={x?.valor}
                                    componente={x?.componente} />
                            ))}
                            <Grid size={12} paddingTop="3vh">
                                <Divider />
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="h5" paddingBottom="1vh">
                                    {t("titComor")}
                                </Typography>
                            </Grid>
                            {diagnostico?.otraEnfermedad ? (
                                <Grid size={12}>
                                    <ContComorbilidades comorbilidades={diagnostico?.comorbilidades} />
                                </Grid>
                            ) : (
                                <Grid size={numCols}>
                                    <Typography variant="body1" fontWeight="bold">
                                        {t("txtNoComor")}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                        {(!usuario?.rolVisible && !diagnostico?.validado) ? (
                            <BtnFlotante
                                txtBtn={t("txtBtnValidar")}
                                txtAyudaBtn={t("txtAyudaBtnValidar")}
                                manejadorBtn={manejadorBtnValidarDiagnostico}
                                icono={<CheckCircleOutlineIcon />} />
                        ) : null}
                    </>
                )}
                <FormValidacion
                    mostrar={modalValidacion}
                    manejadorBtn={manejadorBtnValidar}
                    manejadorCierre={cerrarModalValidacion} />
                <ModalDoble
                    mostrar={modalEliminacion}
                    titulo={t("titAlerta")}
                    texto={t("txtEliminarDiagnostico")}
                    txtBtnPrincipal={t("txtBtnEliminar")}
                    txtBtnSecundario={t("txtBtnCancelar")}
                    manejadorBtnPrincipal={manejadorBtnBorrar}
                    manejadorBtnSecundario={cerrarModalEliminacion}
                    iconoBtnPrincipal={<DeleteIcon />}
                    iconoBtnSecundario={<CloseIcon />} />
                <ModalSimple
                    mostrar={modalError.mostrar}
                    titulo={t("tituloErr")}
                    texto={t(modalError.texto)}
                    txtBtn={t("txtBtnCerrar")}
                    manejadorBtn={cerrarModalError}
                    iconoBtn={<CloseIcon />} />
            </MenuLayout>
        </>
    );
};