import { Button, Grid, Box, CircularProgress, Tooltip, Stack, TextField, MenuItem, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useAuth, useDiagnosticos, useUsuarios, useOperacionesUsuarios } from "../../hooks";

import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { ChipEstado, ChipRol } from "../../components/tabs/Chips";
import { Trans, useTranslation } from "react-i18next";


import { MenuLayout, TabHeader } from "../../components/layout";
import { FormUsuario } from "../../components/forms";
import PantallaUsuario from "../../components/usuarios/PantallaUsuario";
import { PantallaCarga } from "../../components/layout";
import { BotoneraTabla, Datatable } from "../../components/datatable";
import { ModalDoble } from "../../components/modals";

// modalEdicion
// modalVer
// modalEliminacion

const estadoInicial = {
    modalEdicion: false, modalEliminacion: false,
    instancia: null, seleccionados: [], procesando: false,
    modalError: { mostrar: false, texto: "" },
    modalVisualizacion: false
};

function reducer(state) {
    switch (state.type) {
        case "ABRIR_MODAL_EDICION":
            return { ...state, modalEdicion: true, instancia: state.payload };
        case "CERRAR_MODAL_EDICION":
            return { ...state, modalEdicion: false, instancia: null };

        case "INICIAR_EDICION":
            return { ...state, procesando: true, modalEdicion: false };
        case "FINALIZAR_EDICION":
            return { ...state, procesando: false, instancia: null };

        case "ABRIR_MODAL_VISUALIZACION":
            return { ...state, modalVisualizacion: true, instancia: state.payload };
        case "CERRAR_MODAL_VISUALIZACION":
            return { ...state, modalVisualizacion: false, instancia: null };

        case "ABRIR_MODAL_ERROR":
            return { ...state, modalError: { mostrar: true, texto: state.payload } };
        case "CERRAR_MODAL_ERROR":
            return { ...state, modalError: { mostrar: false, texto: state.modalError.texto } };

        case "CERRAR_MODAL_ELIMINACION":
            return {
                ...state, modalEliminacion: false, seleccionados: [], instancia: null
            };
        default:
            return state;
    }
}

/**
 * Página que muestra la lista de usuarios.
 * @returns {JSX.Element}
 */
export default function VerUsuariosPage() {
    const { usuario } = useAuth();


    const { usuarios, error, manejadorCargaUsuarios } = useUsuarios(true);
    const [state, dispatch] = useReducer(reducer, estadoInicial);

    const { modalEdicion, modalEliminacion, instancia, seleccionados, procesando, modalError, modalVisualizacion } = state;
    const { editarUsuario, eliminarUsuarios, error } = useOperacionesUsuarios();

    const { t } = useTranslation();
    const listadoPestanas = [{ texto: t("titListaUsuarios"), url: "/usuarios" }];
    const [cargando, setCargando] = useState(true);

    const [datos, setDatos] = useState(null);


    useEffect(() => {
        document.title = t("titListaUsuarios");
    }, [t]);


    /**
     * Cuenta la cantidad de diagnósticos por médico.
     * @param {Array[JSON]} diagnosticos - Lista de diagnósticos.
     * @param {Array[JSON]} medicos - Lista de médicos.
     */
    /*const contarDiagnosticos = (diagnosticos, medicos) => {
        const aux = {};

        for (const i of diagnosticos) {
            if (aux[i.medico] == undefined) {
                aux[i.medico] = 1;
            } else {
                aux[i.medico] += 1;
            }
        }

        for (let i = 0; i < medicos.length; i++) {
            medicos[i].cantidad = aux[medicos[i].uid] || 0;
        }

        setDatos(formatearCeldas(medicos));
    };*/

    /**
     * Manejador de clic en el botón de eliminar pacientes de la tabla.
     * @param {Array} seleccionados - Lista de pacientes seleccionados.
     */
    const manejadorEliminar = (seleccionados) => {
        setSeleccionados(seleccionados);
        setModoModal(1);
        setModal({
            mostrar: true, titulo: t("titAlerta"), icono: <DeleteIcon />,
            mensaje: t("txtEliminarUsuarios")
        });
    };

    /**
     * @param {Usuario} usuario Instancia de usuario.
     * @param {Event} e Evento del clic.
     */
    function manejadorClicCelda(usuario, e) {
        e.stopPropagation();
        dispatch({ type: "ABRIR_MODAL_VISUALIZACION", payload: usuario });
    };

    /**
     * Recarga los datos de la página.
     */
    const manejadorRecargar = async (token = null) => {
        const credencial = (token == null) ? usuario?.tokenFirebase : token;

        if (!cargando) {
            setCargando(true);
        }

        setDatos(null);
        setUsuarios(null);
        setDiagnosticos(null);
        setSeleccionado(null);
        setSeleccionados([]);
        const usuarios = await cargarUsuarios(credencial);
        cargarDiagnosticos(usuarios.map((x) => x.uid));
    };

    /**
     * @param {Object} datos Datos del formulario de edición de usuario.
     */
    async function manejadorBtnActualizarUsuario(datos) {
        dispatch({ type: "INICIAR_EDICION" });
        const { success, error } = await editarUsuario(datos.uid, datos.rol, datos.estado);
        if (success) {
            manejadorRecargar();
        } else {
            dispatch({ type: "ABRIR_MODAL_ERROR", payload: error });
        }
        dispatch({ type: "FINALIZAR_EDICION" });
    };

    /**
     * Verifica si el usuario está intentando autoeliminarse.
     * @param {Array[String]} usuarios - Lista de correos de usuarios seleccionados.
     * @returns Boolean
     */
    const verificarAutoeliminacion = (usuarios) => {
        const res = usuarios.includes(usuario?.uid);
        if (res) {
            setTimeout(() => {
                setModoModal(2);
                setModal({
                    mostrar: true, titulo: t("titAlerta"), icono: <CloseIcon />,
                    mensaje: t("errAutoEliminado")
                });
                setCargando(false);
            }, 500);
        }

        return res;
    };

    /**
     * Manejador del botón de editar en cada registro de la tabla.
     * @param {Object} instancia - Instancia del usuario.
     */
    const manejadorBtnEditar = (instancia) => {
        sessionStorage.setItem("ejecutar-callback", "false");
        setSeleccionado(instancia);
        setModoModal(3);
        setModal({
            mostrar: true, titulo: t("titEditarUsuario"), mensaje: "", icono: <SaveIcon />
        });
    };

    async function manejadorBtnModalEliminacion() {
        dispatch({ type: "INICIAR_ELIMINADO_USUARIOS" });
        await eliminarUsuarios(seleccionados);
        manejadorBtnRecargar();
    }


    const campos = useMemo(() => {
        const CompAccion = (x) => <BotoneraTabla instancia={x} botones={[
            {
                id: "editar", color: "primary", icono: <EditIcon />,
                txtAyuda: "txtAyudaBtnEditarUsuario", manejadorClic: manejadorBtnEditar
            },
            {
                id: "eliminar", color: "error", icono: <DeleteIcon />,
                txtAyuda: "txtAyudaBtnEliminarUsuario", manejadorClic: manejadorBtnEliminar
            }
        ]} />;
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
            { id: "cantidad", label: t("txtCantDiagnosticos"), componente: null },
            { id: "accion", label: t("txtAccion"), componente: CompAccion }
        ];
    }, []);

    useEffect(() => {
        if (error) {
            dispatch({ type: "ABRIR_MODAL_ERROR", payload: error });
        }
    }, [error]);

    return (
        <MenuLayout>
            {cargando ? <PantallaCarga /> : (
                <>
                    <TabHeader
                        titulo={t("titListaUsuarios")}
                        pestanas={listadoPestanas}
                        activarBtnAtras={false} />
                    <Grid container columns={1} spacing={3} width="100%" sx={{ marginTop: "3vh" }}>
                        <Grid display="flex" size={1} justifyContent="end">
                            <Tooltip title={t("txtAyudaBtnRecargar")}>
                                <IconButton onClick={() => manejadorRecargar()}>
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
                                callbackBtnAccion={manejadorEliminar}
                                icono={<DeleteIcon />} />
                        </Grid>
                    </Grid>
                </>)}
            <FormUsuario
                mostrar={modalEdicion}
                instancia={instancia}
                manejadorBtn={manejadorBtnActualizarUsuario}
                manejadorCierre={() => dispatch({ type: "CERRAR_MODAL_EDICION" })} />
            <PantallaUsuario
                mostrar={modalVisualizacion}
                instancia={instancia}
                cantDiagnosticosAportados={instancia?.cantidad}
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
        </MenuLayout>
    );
};