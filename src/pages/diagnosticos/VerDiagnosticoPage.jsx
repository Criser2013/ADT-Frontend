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
import { detTextoPersona } from "../../utils/TratarDatos";
import { Diagnostico, Paciente, Usuario } from "../../models";
import { FormValidacion } from "../../components/forms";
import { MenuLayout, PantallaCarga, TabHeader } from "../../components/layout";
import { ModalDoble, ModalSimple } from "../../components/modals";
import { useAuth, useDiagnostico, useOperacionesDiagnosticos } from "../../hooks";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";


const numCols = { xs: 12, lg: 6, xl: 4 };

/**
 * Página para ver los datos de un diagnóstico.
 * @returns {JSX.Element}
 */
export default function VerDiagnosticoPage() {
    const navigate = useNavigate();
    const { eliminarDiagnosticos, validarDiagnostico } = useOperacionesDiagnosticos();
    const { id } = useParams();
    const { diagnostico, persona, error, manejadorCargaDiagnostico } = useDiagnostico(id, true);
    const { t } = useTranslation();
    const { usuario: usuarioAutenticado } = useAuth();
    const [modalEliminacion, setModalEliminacion] = useState(false);
    const [modalError, setModalError] = useState({ mostrar: false, texto: "" });
    const [modalValidacion, setModalValidacion] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const textoPersona = useMemo(() =>
        detTextoPersona(usuarioAutenticado?.rolVisible ? "usuario" : "paciente", persona?.nombre, t)
    , [t, persona, usuarioAutenticado?.rolVisible]);
    const camposPersonales = useMemo(() => [
        { id: "id", titulo: "ID", valor: diagnostico?.mostrarId(usuarioAutenticado?.rolVisible) },
        { id: "nombre", titulo: usuarioAutenticado?.rolVisible ? t("txtMedico") : t("txtPaciente"), valor: textoPersona },
        { id: "sexo", titulo: t("txtCampoSexo"), componente: <ChipSexo valor={diagnostico?.sexo} /> },
        { id: "edad", titulo: t("edad"), valor: `${diagnostico?.sintomasNumericos.edad} ${t("txtSufijoEdad")}` },
        { id: "fecha", titulo: t("txtCampoFechaDiag"), valor: dayjs(diagnostico?.fecha).format(t("formatoFechaCompleta")) },
        { id: "diagnosticoModelo", titulo: t("txtCampoDiagModelo"), componente: <ChipDiagnostico valor={diagnostico?.diagnosticoModelo} /> },
        { id: "probabilidad", titulo: t("txtCampoProbabilidad"), valor: `${(diagnostico?.probabilidad * 100).toFixed(2)}%` },
        { id: "diagnosticoMedico", titulo: t("txtCampoDiagMedico"), componente: <ChipValidado valor={diagnostico?.diagnosticoMedico} /> },
    ], [usuarioAutenticado?.rolVisible, diagnostico, t, textoPersona]);
    const camposVitales = useMemo(() => [
        { id: "presionSistolica", titulo: t("presion_sistolica"), valor: `${diagnostico?.sintomasNumericos.presion_sistolica} mmHg.` },
        { id: "presionDiastolica", titulo: t("presion_diastolica"), valor: `${diagnostico?.sintomasNumericos.presion_diastolica} mmHg.` },
        { id: "frecuenciaCardiaca", titulo: t("frecuencia_cardiaca"), valor: `${diagnostico?.sintomasNumericos.frecuencia_cardiaca} lpm.` },
        { id: "frecuenciaRespiratoria", titulo: t("frecuencia_respiratoria"), valor: `${diagnostico?.sintomasNumericos.frecuencia_respiratoria} rpm.` },
        { id: "saturacionDeLaSangre", titulo: t("saturacion_de_la_sangre"), valor: `${diagnostico?.sintomasNumericos.saturacion_de_la_sangre} %` },
    ], [diagnostico, t]);
    const camposExamenes = useMemo(() => [
        { id: "plt", titulo: t("plt"), valor: `${diagnostico?.sintomasNumericos.plt} /µL.` },
        { id: "hb", titulo: t("hb"), valor: `${diagnostico?.sintomasNumericos.hb} g/dL.` },
        { id: "wbc", titulo: t("wbc"), valor: `${diagnostico?.sintomasNumericos.wbc} /µL.` },
    ], [diagnostico, t]);
    const listadoPestanas = useMemo(() => [
        { texto: usuarioAutenticado?.rolVisible ? t("txtDatosRecolectados") : t("txtHistorialDiagnosticos"), url: "/diagnosticos" },
        { texto: `${usuarioAutenticado?.rolVisible ? t("txtDiagnostico") : t("txtPaciente")} — ${textoPersona} - ${diagnostico?.fecha.toLocaleString()}` }
    ], [usuarioAutenticado?.rolVisible, textoPersona, diagnostico, t]);
    const mostrarPantallaCarga = !diagnostico || !persona || procesando;

    useEffect(() => {
        let titulo = usuarioAutenticado?.rolVisible ? t("titDiagnostico") : t("titVerDiagnostico");
        if (diagnostico && persona) {
            titulo = `${t("txtDiagnostico")} — ${textoPersona} - ${diagnostico?.fecha.toLocaleString()}`;
        }
        document.title = titulo;
    }, [usuarioAutenticado, persona, diagnostico, t, textoPersona]);

    useEffect(() => {
        if (["errIdInvalido", "accesoDenegado"].includes(error)) {
            navigate("/diagnosticos");
            return;
        } else if (error) {
            setModalError({ mostrar: true, texto: error });
        }
    }, [usuarioAutenticado?.uid, error, navigate, id]);

    async function manejadorBtnBorrar() {
        setModalEliminacion(false);
        setProcesando(true);
        const { success, error } = await eliminarDiagnosticos(id);
        if (success) {
            navigate("/diagnosticos");
            return;
        }
        setModalError({ mostrar: true, texto: error });
        setProcesando(false);
    }

    /**
     * @param {Object} diagnosticoMedico Diagnóstico TEP confirmado por el médico.
     */
    async function manejadorBtnValidar({ diagnosticoMedico }) {
        setModalValidacion(false);
        setProcesando(true);
        const { success, error } = await validarDiagnostico(diagnostico, diagnosticoMedico);
        if (success) {
            await manejadorCargaDiagnostico();
        } else {
            setModalError({ mostrar: true, texto: error });
        }
        setProcesando(false);
    };

    return (
        <>
            <MenuLayout>
                {mostrarPantallaCarga ? <PantallaCarga /> :
                    (<>
                        <TabHeader
                            activarBtnAtras
                            titulo={t("titDiagnostico")}
                            pestanas={listadoPestanas}
                            tooltip={t("txtVolverAtrasDiagnosticos")} />
                        <Grid container
                            columns={12}
                            spacing={1}
                            marginTop="3vh">
                            {usuarioAutenticado?.rolVisible ? (
                                <Grid size={12} display="flex" justifyContent="end" margin="-2vh 0vw">
                                    <Tooltip title={t("txtAyudaEliminarDiagnostico")}>
                                        <IconButton color="inherit" onClick={() => setModalEliminacion(true)}>
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
                        {(!usuarioAutenticado?.rolVisible && !diagnostico?.validado) ? (
                            <BtnFlotante
                                txtBtn={t("txtBtnValidar")}
                                txtAyudaBtn={t("txtAyudaBtnValidar")}
                                manejadorBtn={() => setModalValidacion(true)}
                                icono={<CheckCircleOutlineIcon />} />
                        ) : null}
                    </>
                    )}
                <FormValidacion
                    mostrar={modalValidacion}
                    manejadorBtn={manejadorBtnValidar}
                    manejadorCierre={() => setModalValidacion(false)} />
                <ModalDoble
                    mostrar={modalEliminacion}
                    titulo={t("titAlerta")}
                    texto={t("txtEliminarDiagnostico")}
                    txtBtnPrincipal={t("txtBtnEliminar")}
                    txtBtnSecundario={t("txtBtnCancelar")}
                    manejadorBtnPrincipal={manejadorBtnBorrar}
                    manejadorBtnSecundario={() => setModalEliminacion(false)}
                    iconoBtnPrincipal={<DeleteIcon />}
                    iconoBtnSecundario={<CloseIcon />} />
                <ModalSimple
                    mostrar={modalError.mostrar}
                    titulo={t("tituloErr")}
                    texto={t(modalError.texto)}
                    txtBtn={t("txtBtnCerrar")}
                    manejadorBtn={() => setModalError((x) => ({ ...x, mostrar: false}))}
                    iconoBtn={<CloseIcon />} />
            </MenuLayout>
        </>
    );
};