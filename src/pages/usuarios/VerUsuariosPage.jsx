import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
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
    instancia: null, usuariosSeleccionados: null, procesando: false,
    modalError: { mostrar: false, texto: "" },
    modalVisualizacion: false
};

function reducer(state, action) {
    switch (action.type) {
        case "ABRIR_MODAL_EDICION":
            return { ...state, modalEdicion: true, instancia: action.payload };
        case "ABRIR_MODAL_ELIMINACION_SINGULAR":
            return { ...state, modalEliminacion: true, instancia: action.payload, usuariosSeleccionados: null };
        case "ABRIR_MODAL_ELIMINACION_MULTIPLE":
            return { ...state, modalEliminacion: true, usuariosSeleccionados: action.payload, instancia: null };
        case "ABRIR_MODAL_ERROR":
            return { ...state, modalError: { mostrar: true, texto: action.payload } };
        case "ABRIR_MODAL_VISUALIZACION":
            return { ...state, modalVisualizacion: true, instancia: action.payload };
        case "CERRAR_MODAL_EDICION":
            return { ...state, modalEdicion: false };
        case "CERRAR_MODAL_ELIMINACION":
            return { ...state, modalEliminacion: false };
        case "CERRAR_MODAL_ERROR":
            return { ...state, modalError: { mostrar: false, ...state.modalError } };
        case "CERRAR_MODAL_VISUALIZACION":
            return { ...state, modalVisualizacion: false };
        case "FINALIZAR_CARGA_DATOS":
            return { ...state, procesando: false, usuariosSeleccionados: null, instancia: null };
        case "FINALIZAR_EDICION":
            return { ...state, procesando: false, instancia: null };
        case "INICIAR_CARGA_DATOS":
            return { ...state, procesando: true };
        case "INICIAR_EDICION":
            return { ...state, procesando: true, modalEdicion: false };
        case "INICIAR_ELIMINADO_USUARIOS":
            return { ...state, procesando: true, modalEliminacion: false };
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
    const { modalEdicion, modalEliminacion, instancia, UsuariosSeleccionados, procesando, modalError, modalVisualizacion } = state;
    const datos = useMemo(() => usuarios?.map((usuario) => {
            usuario.cantidad = diagnosticosAgrupadosPorUsuario[usuario.uid]?.length || 0;
            return usuario;
        }) || [], [usuarios, diagnosticosAgrupadosPorUsuario]);
    const listadoPestanas = [{ texto: t("titListaUsuarios"), url: "/usuarios" }];
    const mostrarPantallaCarga = !usuarios || !diagnosticosCargados || procesando;
    const rolUsuario = instancia?.esAdmin ? t("txtAdministrador") : t("txtUsuario");

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

    useEffect(() => {
        dispatch({ type: "FINALIZAR_CARGA_DATOS" });
    }, [usuarios, diagnosticosCargados]);

    /**
     * @param {Usuario} usuario Instancia de usuario.
     * @param {Event} e Evento del clic.
     */
    function manejadorBtnEditarFila(usuario, e) {
        e.stopPropagation();
        dispatch({ type: "ABRIR_MODAL_EDICION", payload: usuario });
    };

    /**
     * @param {Array<Usuario>} usuarios Lista de pacientes seleccionados.
     */
    function manejadorBtnEliminar(usuarios) {
        const esAutoEliminacion = usuarios.some((x) => x.uid == usuario?.uid);
        if (esAutoEliminacion) {
            dispatch({ type: "ABRIR_MODAL_ERROR", payload: "errAutoEliminado" });
        } else {
            dispatch({ type: "ABRIR_MODAL_ELIMINACION_MULTIPLE", payload: usuarios });
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
    };


    /**
     * @param {Object} datos Datos del formulario de edición de usuario.
     */
    async function manejadorBtnModalActualizar(datos) {
        dispatch({ type: "INICIAR_EDICION" });
        const { success, error } = await editarUsuario(datos.uid, datos.rol, !datos.estado);
        if (!success) { 
            dispatch({ type: "ABRIR_MODAL_ERROR", payload: error });
        }
        manejadorBtnRecargar();
    };

    async function manejadorBtnModalEliminacion() {
        dispatch({ type: "INICIAR_ELIMINADO_USUARIOS" });
        const { success, error } = await eliminarUsuarios(
            Array.isArray(UsuariosSeleccionados) ? UsuariosSeleccionados : instancia
        );
        if (!success) {
            dispatch({ type: "ABRIR_MODAL_ERROR", payload: error });
        } else {
            dispatch({ type: "CERRAR_MODAL_ELIMINACION" });
        }
        await manejadorBtnRecargar();
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
        const CompAccion = (x) => (x.uid != usuario?.uid) ? (
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
        const CompFechaRegistro = (x) => dayjs(x.fechaRegistro).format(t("formatoFechaHoraResumida"));
        const CompFechaUltimoAcceso = (x) => dayjs(x.fechaUltimoAcceso).format(t("formatoFechaHoraResumida"));
        const CompEstado = (x) => <ChipEstado valor={x.estado} />;
        const CompRol = (x) => <ChipRol valor={x.esAdmin} />;
        return [
            { id: "uid", label: "ID", componente: null, ordenable: true },
            { id: "nombre", label: t("txtNombre"), componente: null, ordenable: true },
            { id: "correo", label: t("txtCorreo"), componente: null, ordenable: true },
            { id: "esAdmin", label: t("txtRol"), componente: CompRol, ordenable: true },
            { id: "estado", label: t("txtEstado"), componente: CompEstado, ordenable: true },
            { id: "fechaRegistro", label: t("txtFechaRegistro"), componente: CompFechaRegistro, ordenable: true },
            { id: "fechaUltimoAcceso", label: t("txtUltimaConexion"), componente: CompFechaUltimoAcceso, ordenable: true },
            { id: "cantidad", label: t("txtDiagnosticos"), componente: null, ordenable: true },
            { id: "accion", label: t("txtAccion"), componente: CompAccion, ordenable: false }
        ];
    }, [usuario?.uid, t]);

    return (
        <MenuLayout>
            {mostrarPantallaCarga ? <PantallaCarga /> : (
                <>
                    <TabHeader
                        titulo={t("titListaUsuarios")}
                        pestanas={listadoPestanas}
                        activarBtnAtras={false} />
                    <Grid container columns={1} spacing={3} width="100%" sx={{ marginTop: "3vh" }}>
                        <Grid display="flex" size={1} justifyContent="begin">
                            <Tooltip title={t("txtAyudaBtnRecargar")}>
                                <IconButton onClick={manejadorBtnRecargar}>
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        <Grid size={1}>
                            <Datatable
                                datos={datos}
                                campos={campos}
                                campoId="uid"
                                lblBusqueda={t("txtBusqUsuario")}
                                lblSeleccion={t("txtSufijoUsuariosSelecs")}
                                tooltipAccion={t("txtAyudaBtnEliminarUsuarios")}
                                activarBusqueda
                                activarSeleccion
                                camposBusqueda={["uid", "nombre", "correo"]}
                                campoOrdenInicial="fechaRegistro"
                                direccionOrdenInicial="desc"
                                callbackClicCelda={manejadorClicCelda}
                                callbackBtnAccion={manejadorBtnEliminar}
                                icono={<DeleteIcon />} />
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
                    <Trans
                        i18nKey="txtEliminarUsuario"
                        values={{ instancia, rolUsuario }}
                        components={{ 1: <br />, 3: <b />, 5: <b /> }} />
                ) : null}
            </ModalDoble>
            <ModalSimple
                mostrar={modalError.mostrar}
                titulo={t("tituloErr")}
                texto={t(modalError.texto)}
                txtBtn={t("txtBtnCerrar")}
                manejadorBtn={() => dispatch({ type: "CERRAR_MODAL_ERROR" })}
                iconoBtn={<CloseIcon />}/>
        </MenuLayout>
    );
};