import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import { BotoneraTabla, Datatable } from "../../components/datatable";
import { Button, Grid, Tooltip, Typography, IconButton } from "@mui/material";
import { ChipEstado, ChipRol } from "../../components/tabs/Chips";
import { FormUsuario } from "../../components/forms";
import { MenuLayout, TabHeader } from "../../components/layout";
import { ModalDoble, ModalSimple } from "../../components/modals";
import { PantallaCarga } from "../../components/layout";
import { PantallaUsuario } from "../../components/usuarios";
import { Trans, useTranslation } from "react-i18next";
import { useAuth, useDiagnosticos, useOperacionesUsuarios, useUsuarios } from "../../hooks";
import { useEffect, useMemo, useReducer } from "react";
import { useNavigate } from "react-router-dom";


const estadoInicial = {
    modalEdicion: false, modalEliminacion: false,
    instancia: null, seleccionados: null, procesando: false,
    modalError: { mostrar: false, texto: "" },
    modalVisualizacion: false
};

function reducer(state, action) {
    switch (action.type) {
        case "ABRIR_MODAL_EDICION":
            return { ...state, modalEdicion: true, instancia: action.payload };
        case "ABRIR_MODAL_ELIMINACION_SINGULAR":
            return { ...state, modalEliminacion: true, instancia: action.payload };
        case "ABRIR_MODAL_ELIMINACION_MULTIPLE":
            return { ...state, modalEliminacion: true, seleccionados: action.payload };
        case "ABRIR_MODAL_ERROR":
            return { ...state, modalError: { mostrar: true, texto: action.payload } };
        case "ABRIR_MODAL_VISUALIZACION":
            return { ...state, modalVisualizacion: true, instancia: action.payload };
        case "CERRAR_MODAL_EDICION":
            return { ...state, modalEdicion: false, instancia: null };
        case "CERRAR_MODAL_ELIMINACION":
            return { ...state, modalEliminacion: false, seleccionados: null, instancia: null };
        case "CERRAR_MODAL_ERROR":
            return { ...state, modalError: { mostrar: false, texto: state.modalError.texto } };
        case "CERRAR_MODAL_VISUALIZACION":
            return { ...state, modalVisualizacion: false, instancia: null };
        case "FINALIZAR_CARGA_DATOS":
            return { ...state, procesando: false, seleccionados: null, instancia: null };
        case "FINALIZAR_EDICION":
            return { ...state, procesando: false, instancia: null };
        case "INICIAR_CARGA_DATOS":
            return { ...state, procesando: true };
        case "INICIAR_EDICION":
            return { ...state, procesando: true, modalEdicion: false };
        default:
            return state;
    }
};

/**
 * Página que muestra la lista de usuarios.
 * @returns {JSX.Element}
 */
export default function VerUsuariosPage() {
    const navigate = useNavigate();
    const { editarUsuario, eliminarUsuarios, error } = useOperacionesUsuarios();
    const { diagnosticosAgrupadosPorUsuario, diagnosticosCargados } = useDiagnosticos(true, true, null, null, false);
    const { error: errorUsuario, manejadorCargaUsuarios, usuarios } = useUsuarios(true);
    const { t } = useTranslation();
    const { usuario } = useAuth();
    const [state, dispatch] = useReducer(reducer, estadoInicial);
    const { modalEdicion, modalEliminacion, instancia, seleccionados, procesando, modalError, modalVisualizacion } = state;
    const listadoPestanas = [{ texto: t("titListaUsuarios"), url: "/usuarios" }];
    const mostrarPantallaCarga = !usuarios || !diagnosticosCargados || procesando;

    useEffect(() => {
        if (usuario?.rolVisible === false) {
            navigate("/menu");
        }
    }, [usuario?.rolVisible, navigate]);

    useEffect(() => {
        document.title = t("titListaUsuarios");
    }, [t]);

    useEffect(() => {
        if (error || errorUsuario) {
            dispatch({ type: "ABRIR_MODAL_ERROR", payload: error || errorUsuario });
        }
    }, [error, errorUsuario]);

    /**
     * @param {Usuario} usuario Instancia de usuario.
     * @param {Event} e Evento del clic.
     */
    function manejadorBtnEditarFila(usuario, e) {
        e.stopPropagation();
        dispatch({ type: "ABRIR_MODAL_EDICION", payload: usuario });
    };

    /**
     * @param {Array<Usuario>} usuarios - Lista de pacientes seleccionados.
     */
    function manejadorBtnEliminar(usuarios) {
        const esAutoEliminacion = usuarios.some((x) => x.uid == usuario?.uid);
        if (esAutoEliminacion) {
            dispatch({ type: "ABRIR_MODAL_ERROR", payload: t("errAutoEliminado") });
        } else {
            dispatch({ type: "ABRIR_MODAL_ELIMINACION_MULTIPLE", payload: usuarios.map((x) => x.uid) });
        }
    };

    /**
     * @param {Usuario} usuario Instancia de usuario.
     * @param {Event} e Evento del clic.
     */
    function manejadorBtnEliminarFila(usuario, e) {
        e.stopPropagation();
        dispatch({ type: "ABRIR_MODAL_ELIMINACION_SINGULAR", payload: usuario });
    };

    async function manejadorBtnRecargar() {
        dispatch({ type: "INICIAR_CARGA_DATOS" });
        await manejadorCargaUsuarios();
        dispatch({ type: "CERRAR_MODAL_EDICION" });
    };


    /**
     * @param {Object} datos Datos del formulario de edición de usuario.
     */
    async function manejadorBtnModalActualizar(datos) {
        dispatch({ type: "INICIAR_EDICION" });
        const { success, error } = await editarUsuario(datos.uid, datos.rol, datos.estado);
        if (success) {
            await manejadorBtnRecargar();
        } else {
            dispatch({ type: "ABRIR_MODAL_ERROR", payload: error });
        }
        dispatch({ type: "FINALIZAR_EDICION" });
    };

    async function manejadorBtnModalEliminacion() {
        dispatch({ type: "INICIAR_ELIMINADO_USUARIOS" });
        await eliminarUsuarios(seleccionados);
        manejadorBtnRecargar();
    };

    /**
     * @param {Usuario} usuario Instancia de usuario.
     * @param {Event} e Evento del clic.
     */
    function manejadorClicCelda(usuario, e) {
        e.stopPropagation();
        dispatch({ type: "ABRIR_MODAL_VISUALIZACION", payload: usuario });
    };

    const campos = useMemo(() => {
        const CompAccion = (x) => (x.uid == usuario?.uid) ? (
            <BotoneraTabla instancia={x} botones={[
                {
                    id: "editar", color: "primary", icono: <EditIcon />,
                    txtAyuda: "txtAyudaBtnEditarUsuario", manejadorClic: manejadorBtnEditarFila
                },
                {
                    id: "eliminar", color: "error", icono: <DeleteIcon />,
                    txtAyuda: "txtAyudaBtnEliminarUsuario", manejadorClic: manejadorBtnEliminarFila
                }
            ]} />) : null;
        const CompCantidad = (x) => diagnosticosAgrupadosPorUsuario[x.uid] ?
            diagnosticosAgrupadosPorUsuario[x.uid].length : 0;
        const CompEstado = (x) => <ChipEstado valor={x.estado} />;
        const CompRol = (x) => <ChipRol valor={x.esAdmin} />;
        return [
            { id: "uid", label: t("txtUid"), componente: null },
            { id: "nombre", label: t("txtNombre"), componente: null },
            { id: "correo", label: t("txtCorreo"), componente: null },
            { id: "rol", label: t("txtRol"), componente: CompRol },
            { id: "estado", label: t("txtEstado"), componente: CompEstado },
            { id: "fechaRegistro", label: t("txtFechaRegistro"), componente: null },
            { id: "ultimaConexion", label: t("txtUltimaConexion"), componente: null },
            { id: "cantidad", label: t("txtCantDiagnosticos"), componente: CompCantidad },
            { id: "accion", label: t("txtAccion"), componente: CompAccion }
        ];
    }, [usuario?.uid, t, diagnosticosAgrupadosPorUsuario]);

    return (
        <MenuLayout>
            {mostrarPantallaCarga ? <PantallaCarga /> : (
                <>
                    <TabHeader
                        titulo={t("titListaUsuarios")}
                        pestanas={listadoPestanas}
                        activarBtnAtras={false} />
                    <Grid container columns={1} spacing={3} width="100%" sx={{ marginTop: "3vh" }}>
                        <Grid display="flex" size={1} justifyContent="end">
                            <Tooltip title={t("txtAyudaBtnRecargar")}>
                                <IconButton onClick={manejadorBtnRecargar}>
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        <Grid size={1}>
                            <Datatable
                                datos={usuarios}
                                campos={campos}
                                campoId="uid"
                                lblBusq={t("txtBusqUsuario")}
                                lblSeleccion={t("txtSufijoUsuariosSelecs")}
                                tooltipAccion={t("txtAyudaBtnEliminarUsuarios")}
                                activarBusqueda
                                activarSeleccion
                                camposBusqueda={["uid", "nombre", "correo"]}
                                campoOrdenInicial="fechaRegistro"
                                direccionOrdenInicial="asc"
                                callbackClicCelda={manejadorClicCelda}
                                callbackBtnAccion={manejadorBtnEliminar} />
                        </Grid>
                    </Grid>
                </>)}
            <FormUsuario
                mostrar={modalEdicion}
                instancia={instancia}
                manejadorBtn={manejadorBtnModalActualizar}
                manejadorCierre={() => dispatch({ type: "CERRAR_MODAL_EDICION" })} />
            <PantallaUsuario
                mostrar={modalVisualizacion}
                instancia={instancia}
                cantDiagnosticosAportados={diagnosticosAgrupadosPorUsuario[instancia?.uid]?.length || 0}
                manejadorCierre={() => dispatch({ type: "CERRAR_MODAL_VISUALIZACION" })} />
            <ModalDoble
                mostrar={modalEliminacion}
                titulo={t("titAlerta")}
                texto={!instancia ? t("txtEliminarUsuarios") : null}
                txtBtnPrincipal={t("txtBtnEliminar")}
                txtBtnSecundario={t("txtBtnCancelar")}
                manejadorBtnPrincipal={manejadorBtnModalEliminacion}
                manejadorBtnSecundario={() => dispatch({ type: "CERRAR_MODAL_ELIMINACION" })}
                iconoBtnPrincipal={<DeleteIcon />}
                iconoBtnSecundario={<CloseIcon />}>
                {instancia ? (
                    <Trans i18nKey="txtEliminarUsuario" values={instancia} components={{ 1: <br />, 3: <b />, 5: <b /> }}>
                        ¿Estás seguro de querer eliminar al usuario {instancia.nombre} ({instancia.correo}) — {instancia.esAdmin ? t("txtAdministrador") : t("txtUsuario")}?
                        <br />
                        <br />
                        <b>ADVERTENCIA:</b> Se bloqueará su acceso a la aplicación <b>permanentemente</b>
                    </Trans>
                ) : null}
            </ModalDoble>
            <ModalSimple
                mostrar={modalError.mostrar}
                titulo={t("titErr")}
                texto={modalError.texto}
                txtBtn={t("txtBtnCerrar")}
                manejadorCierre={() => dispatch({ type: "CERRAR_MODAL_ERROR" })}
                iconoBtn={<CloseIcon />}/>
        </MenuLayout>
    );
};