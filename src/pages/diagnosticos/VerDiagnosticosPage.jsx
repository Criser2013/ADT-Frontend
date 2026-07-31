import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AdvertenciaEspacio } from "../../components/menu";
import { BtnTabla, Datatable } from "../../components/datatable";
import { Grid, Box, CircularProgress, Tooltip, IconButton, Button, Typography } from "@mui/material";
import { Check } from "../../components/tabs";
import { ChipDiagnostico, ChipSexo, ChipValidado } from "../../components/tabs/Chips";
import { detTextoPersona } from "../../utils/TratarDatos";
import { Diagnostico } from '../../models';
import { FormExportacion, FormValidacion } from "../../components/forms";
import { MenuLayout, TabHeader, PantallaCarga } from "../../components/layout";
import { ModalDoble, ModalSimple } from "../../components/modals";
import { useAuth, useDiagnosticos, useOperacionesDiagnosticos } from "../../hooks";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";


const estadoInicial = {
    diagnosticosSeleccionados: [], instancia: null, modalEliminacion: false,
    modalError: { mostrar: false, texto: "" }, modalExportacion: false,
    modalValidacion: false, procesando: false,
};

function reducer(state, action) {
    switch (action.type) {
        case "ABRIR_MODAL_ELIMINACION_MULTIPLE":
            return { ...state, modalEliminacion: true, diagnosticosSeleccionados: action.payload };
        case "ABRIR_MODAL_ELIMINACION_SINGULAR":
            return { ...state, modalEliminacion: true, instancia: action.payload };
        case "ABRIR_MODAL_ERROR":
            return { ...state, modalError: { mostrar: true, texto: action.payload } };
        case "ABRIR_MODAL_EXPORTACION":
            return { ...state, modalExportacion: true };
        case "ABRIR_MODAL_VALIDACION":
            return { ...state, modalValidacion: true, instancia: action.payload };
        case "CERRAR_MODAL_ELIMINACION":
            return { ...state, modalEliminacion: false, diagnosticosSeleccionados: [], instancia: null };
        case "CERRAR_MODAL_ERROR":
            return { ...state, modalError: { ...state.modalError, mostrar: false } };
        case "CERRAR_MODAL_EXPORTACION":
            return { ...state, modalExportacion: false };
        case "CERRAR_MODAL_VALIDACION":
            return { ...state, modalValidacion: false, instancia: null };
        case "FINALIZAR_CARGA_DATOS":
            return { ...state, procesando: false, diagnosticosSeleccionados: [], instancia: null };
        case "FINALIZAR_VALIDACION_INSTANCIA":
            return { ...state, procesando: false, instancia: null };
        case "INICIAR_CARGA_DATOS":
            return { ...state, procesando: true };
        case "INICIAR_ELIMINADO_INSTANCIAS":
            return { ...state, procesando: true, modalEliminacion: false, diagnosticosSeleccionados: [], instancia: null };
        case "INICIAR_VALIDACION_INSTANCIA":
            return { ...state, procesando: true, modalValidacion: false };
        default:
            return state;
    }
};

/**
 * Página para ver los diagnósticos del usuario.
 * @returns {JSX.Element}
 */
export default function VerDiagnosticosPage() {
    const navigate = useNavigate();
    const { eliminarDiagnosticos, validarDiagnostico } = useOperacionesDiagnosticos();
    const { usuario } = useAuth();
    const { cantDiagnosticosNoValidados, diagnosticos, diagnosticosCargados,
        error, mapeoDiagnosticos, manejadorCargaDiagnosticos } = useDiagnosticos(
            usuario?.rolVisible, usuario?.uid, null, true
        );
    const { t } = useTranslation();
    const [state, dispatch] = useReducer(reducer, estadoInicial);
    const { diagnosticosSeleccionados, instancia, modalEliminacion, modalError, modalExportacion, modalValidacion, procesando } = state;
    const listadoPestanas = [
        { texto: usuario?.rolVisible ? t("txtDatosRecolectados") : t("txtHistorialDiagnosticos"), url: "/diagnosticos" }
    ];
    const mostrarPantallaCarga = procesando || !diagnosticosCargados;

    useEffect(() => {
        document.title = usuario?.rolVisible ? t("txtDatosRecolectados") : t("txtHistorialDiagnosticos");
    }, [usuario?.rolVisible, t]);

    useEffect(() => {
        if (error) {
            dispatch({ type: "ABRIR_MODAL_ERROR", payload: error });
        }
    }, [error]);

    useEffect(() => {
        dispatch({ type: "INICIAR_CARGA_DATOS" });
    }, [usuario?.rolVisible]);

    useEffect(() => {
        dispatch({ type: "FINALIZAR_CARGA_DATOS" });
    }, [diagnosticos]);

    async function manejadorBtnRecargar() {
        dispatch({ type: "INICIAR_CARGA_DATOS" });
        await manejadorCargaDiagnosticos(
            usuario?.rolVisible, usuario?.uid, null
        );
        dispatch({ type: "FINALIZAR_CARGA_DATOS" });
    };

    async function manejadorBtnModalEliminacion() {
        dispatch({ type: "INICIAR_ELIMINADO_INSTANCIAS" });
        await eliminarDiagnosticos(
            Array.isArray(diagnosticosSeleccionados) ? diagnosticosSeleccionados : instancia
        );
        await manejadorCargaDiagnosticos(
            usuario?.rolVisible, usuario?.uid, null
        );
        dispatch({ type: "FINALIZAR_PROCESO" });
    };

    /**
     * @param {DiagnosticoDto} diagnostico Instancia del diagnóstico a eliminar.
     * @param {Event} e Evento del clic.
     */
    const manejadorBtnEliminarFila = useCallback((diagnostico, e) => {
        e.stopPropagation();
        dispatch({ type: "ABRIR_MODAL_ELIMINACION_SINGULAR", payload: diagnostico.idCompuesto });
    }, []);

    /**
     * @param {DiagnosticoDto} diagnostico Instancia del diagnóstico a validar.
     * @param {Event} e Evento del clic.
     */
    const manejadorBtnValidarFila = useCallback((diagnostico, e) => {
        e.stopPropagation();
        dispatch({ type: "ABRIR_MODAL_VALIDACION", payload: mapeoDiagnosticos[diagnostico.idCompuesto] });
    }, [mapeoDiagnosticos]);

    /**
     * @param {Boolean} diagnosticoMedico Valor de validación del diagnóstico.
     */
    async function manejadorBtnValidar({ diagnosticoMedico }) {
        dispatch({ type: "INICIAR_VALIDACION_INSTANCIA" });
        const { success } = await validarDiagnostico(instancia, diagnosticoMedico);
        if (success) {
            await manejadorCargaDiagnosticos(usuario?.rolVisible, usuario?.uid, null);
        }
        dispatch({ type: "FINALIZAR_VALIDACION_INSTANCIA" });
    };

    const campos = useMemo(() => {
        const idCampoNombre = usuario?.rolVisible ? "usuario" : "paciente";
        const etiquetaCampoNombre = usuario?.rolVisible ? t("txtUsuario") : t("txtPaciente");
        const CompBtnEliminacion = (x) => (
            <BtnTabla
                instancia={x}
                manejadorBtn={manejadorBtnEliminarFila}
                txtAyuda="txtAyudaEliminarDiagnostico"
                color="error"
                icono={<DeleteIcon />} />
        );
        const CompBtnValidacion = (x) => x.validado ? null : (
            <BtnTabla
                instancia={x}
                manejadorBtn={manejadorBtnValidarFila}
                txtAyuda="txtAyudaValidar"
                icono={<CheckCircleOutlineIcon />} />
        );
        const CompVerDiagnostico = (x) => <ChipDiagnostico valor={x.diagnosticoModelo} />;
        const CompVerFecha = (x) => dayjs(x.fecha).format(t("formatoFechaHoraResumida"));
        const CompVerId = (x) => x.mostrarId(usuario?.rolVisible);
        const CompVerNombre = (x) => detTextoPersona(idCampoNombre, x[idCampoNombre], t);
        const CompVerSexo = (x) => <ChipSexo valor={x.sexo} />;
        const CompVerValidado = (x) => <ChipValidado valor={x.diagnosticoMedico} />;
        const camposBase = [
            { id: "idCompuesto", label: "ID", componente: CompVerId, ordenable: true },
            { id: idCampoNombre, label: etiquetaCampoNombre, componente: CompVerNombre, ordenable: true },
            { id: "fecha", label: t("txtFecha"), componente: CompVerFecha, ordenable: true },
            { id: "edad", label: t("edad"), componente: null, ordenable: true },
            { id: "sexo", label: t("txtCampoSexo"), componente: CompVerSexo, ordenable: true },
            { id: "diagnosticoModelo", label: t("txtCampoDiagModelo"), componente: CompVerDiagnostico, ordenable: true },
            { id: "diagnosticoMedico", label: t("txtCampoDiagMedico"), componente: CompVerValidado, ordenable: true },
        ];

        if (!usuario?.rolVisible) {
            camposBase.splice(
                2, 0, { id: "cedula", label: t("txtCedula"), componente: null, ordenable: true }
            );
            if (cantDiagnosticosNoValidados > 0) {
                camposBase.push({
                    id: "accion", label: t("txtAccion"), componente: CompBtnValidacion, ordenable: false
                });
            }
        } else {
            camposBase.push({
                id: "accion", label: t("txtAccion"), componente: CompBtnEliminacion, ordenable: false
            });
        }
        return camposBase;
    }, [usuario?.rolVisible, t, manejadorBtnValidarFila, manejadorBtnEliminarFila, cantDiagnosticosNoValidados]);

    return (
        <MenuLayout>
            {mostrarPantallaCarga ? <PantallaCarga /> : (
                <>
                    <TabHeader
                        titulo={usuario?.rolVisible ? t("txtHistorialDiagnosticos") : t("txtDatosRecolectados")}
                        pestanas={listadoPestanas}
                        activarBtnAtras={false} />
                    <Grid container columns={1} spacing={3} sx={{ marginTop: "3vh" }}>
                        <AdvertenciaEspacio numDiagnosticos={diagnosticos?.length} />
                        <Grid size={1} display="flex" justifyContent="space-between" alignItems="center">
                            <Tooltip title={t("txtAyudaBtnRecargar")}>
                                <IconButton onClick={manejadorBtnRecargar}>
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={usuario?.rolVisible ? t("txtAyudaBtnExportarAdmin") : t("txtAyudaBtnExportar")}>
                                <span>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => dispatch({ type: "ABRIR_MODAL_EXPORTACION" })}
                                        disabled={diagnosticos?.length == 0}
                                        sx={{ textTransform: "none" }}
                                        startIcon={usuario?.rolVisible ? <AddToDriveIcon /> : <FileDownloadIcon />}>
                                        <b>{t("txtBtnExportar")}</b>
                                    </Button>
                                </span>
                            </Tooltip>
                        </Grid>
                        <Datatable
                            datos={diagnosticos}
                            campos={campos}
                            campoId="idCompuesto"
                            lblBusqueda={usuario?.rolVisible ? t("txtBusqDiagAdmin") : t("txtBusqDiag")}
                            lblSeleccion={t("txtSufijoDiagsSelecs")}
                            tooltipAccion={t("txtAyudaEliminarDiags")}
                            activarBusqueda
                            activarSeleccion={usuario?.rolVisible}
                            camposBusqueda={usuario?.rolVisible ? ["idCompuesto", "usuario"] : ["idCompuesto", "cedula", "paciente"]}
                            campoOrdenInicial="fecha"
                            direccionOrdenInicial="asc"
                            callbackClicCelda={(x) => navigate(`/diagnosticos/${x.idCompuesto}`)}
                            callbackBtnAccion={(diagnosticos) => dispatch({
                                type: "ABRIR_MODAL_ELIMINACION_MULTIPLE", payload: diagnosticos.map((x) => x.idCompuesto)
                            })}
                            icono={<DeleteIcon />} />
                    </Grid>
                </>)}
            <FormValidacion
                mostrar={modalValidacion}
                manejadorBtn={manejadorBtnValidar}
                manejadorCierre={() => dispatch({ type: "CERRAR_MODAL_VALIDACION" })} />
            <ModalDoble
                mostrar={modalEliminacion}
                titulo={t("titAlerta")}
                texto={t("txtConfirmacionEliminarDiags")}
                txtBtnPrincipal={t("txtBtnEliminar")}
                txtBtnSecundario={t("txtBtnCancelar")}
                manejadorBtnPrincipal={manejadorBtnModalEliminacion}
                manejadorBtnSecundario={() => dispatch({ type: "CERRAR_MODAL_ELIMINACION" })}
                iconoBtnPrincipal={<DeleteIcon />}
                iconoBtnSecundario={<CloseIcon />} />
            <FormExportacion
                mostrar={modalExportacion}
                diagnosticos={diagnosticos}
                manejadorCierre={() => dispatch({ type: "CERRAR_MODAL_EXPORTACION" })} />
            <ModalSimple
                mostrar={modalError.mostrar}
                titulo={t("titErr")}
                texto={t(modalError.texto)}
                txtBtn={t("txtBtnCerrar")}
                manejadorBtn={() => dispatch({ type: "CERRAR_MODAL_ERROR" })}
                iconoBtn={<CloseIcon />} />
        </MenuLayout>
    );
};