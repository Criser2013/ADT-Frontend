import { Button, Grid, Box, CircularProgress, Tooltip, Stack, TextField, MenuItem, Typography, IconButton } from "@mui/material";
import { detTamCarga } from "../../utils/Responsividad";
import MenuLayout from "../../components/layout/MenuLayout";
import Datatable from "../../components/tabs/Datatable";
import TabHeader from "../../components/layout/TabHeader";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router";
import { useNavegacion } from "../../hooks/Navegacion";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import ModalDoble from "../../components/modals/ModalDoble";
import { peticionApi } from "../../services/Api";
import { verDiagnosticos } from "../../firestore/diagnosticos-collection";
import { useCredenciales } from "../../contexts/CredencialesContext";
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import { Controller, useForm } from "react-hook-form";
import SaveIcon from '@mui/icons-material/Save';
import { ChipEstado, ChipRol } from "../../components/tabs/Chips";
import { Trans, useTranslation } from "react-i18next";

import { FormUsuario } from "../../components/forms";
import PantallaUsuario from "../../components/usuarios/PantallaUsuario";

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
        default:
            return state;
    }
}

/**
 * Página que muestra la lista de usuarios.
 * @returns {JSX.Element}
 */
export default function VerUsuariosPage() {
    const { autenticado, usuario } = useAuth();
    const navigate = useNavigate();
    const { firestore } = useCredenciales();
    const navegacion = useNavegacion();


    const [state, dispatch] = useReducer(reducer, estadoInicial);

    const { modalEdicion, modalEliminacion, instancia, seleccionados, procesando, modalError, modalVisualizacion } = state;

    const { t } = useTranslation();
    const listadoPestanas = useMemo(() => [{
        texto: t("titListaUsuarios"), url: "/usuarios"
    }], [navegacion.idioma]);
    const [cargando, setCargando] = useState(true);
    const [modal, setModal] = useState({
        mostrar: false, titulo: "", mensaje: "", icono: null
    });
    const [modoModal, setModoModal] = useState(2);
    const [datos, setDatos] = useState(null);
    const [usuarios, setUsuarios] = useState(null);
    const [seleccionado, setSeleccionado] = useState(null);
    const [diagnosticos, setDiagnosticos] = useState(null);
    const { setValue, control, handleSubmit, watch } = useForm({
        defaultValues: {
            uid: "", nombre: "", correo: "", rol: false, estado: true
        }
    });
    const width = useMemo(() => {
        return detTamCarga(navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho);
    }, [navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho]);
    const campos = useMemo(() => [
        { id: "nombre", label: t("txtNombre"), componente: null, ordenable: true },
        { id: "correo", label: t("txtCorreo"), componente: null, ordenable: true },
        { id: "rol", label: t("txtRol"), componente: (x) => <ChipRol rol={x.rol} />, ordenable: true },
        { id: "ultimaConexion", label: t("txtUltimaConexion"), componente: null, ordenable: true },
        { id: "cantidad", label: t("txtDiagnosticos"), componente: null, ordenable: true },
        { id: "estado", label: t("txtEstado"), componente: (x) => <ChipEstado estado={x.estado} /> },
        { id: "accion", label: t("txtAccion"), ordenable: false, componente: null }
    ], [navegacion.idioma]);
    const txtBtnModal = useMemo(() => {
        return modoModal == 3 ? t("txtBtnGuardar") : t("txtBtnEliminar");
    }, [modoModal, navegacion.idioma]);

    const admin = useMemo(() => usuario?.rolVisible, [usuario?.rolVisible]);

    /**
     * Coloca el título de la página.
     */
    useEffect(() => {
        if (!usuario && admin) {
            manejadorRecargar(usuario?.tokenDrive);
        } else if (!autenticado || !admin) {
            navigate("/menu", { replace: true });
        }
    }, [admin, usuario, autenticado]);

    useEffect(() => {
        document.title = t("titListaUsuarios");
    }, [navegacion.idioma]);

    /**
     * Cuando se cargan los médicos y diagnósticos, se cuentan los diagnósticos por médico
     * y se formatean los datos.
     */
    useEffect(() => {
        if (usuarios != null && diagnosticos != null && datos == null) {
            contarDiagnosticos(diagnosticos, usuarios);
            setCargando(false);
        }
    }, [usuarios, diagnosticos, datos]);

    /**
     * Carga los datos de los pacientes desde Drive.
     * @param {String} token - Token de acceso de Firebase del usuario.
     * @returns {Array[JSON]} Lista de usuarios o un array vacío en caso de error.
     */
    const cargarUsuarios = async (token) => {
        const res = await peticionApi(
            "admin/usuarios", "GET", {}, null, token, navegacion.idioma,
            t("errCargarUsuarios")
        );
        if (!res.success) {
            setUsuarios([]);
            setModoModal(2);
            setModal({
                mostrar: true, mensaje: res.error, icono: <CloseIcon />,
                titulo: t("titErrCargaDatos"),
            });
            return [];
        } else {
            setUsuarios(res.data.usuarios);
            return res.data.usuarios;
        }
    };

    /**
     * Carga los diagnósticos desde la base de datos.
     * @param {Array[string]} usuarios - Lista de UID de los médicos.
     */
    const cargarDiagnosticos = async (usuarios) => {
        const res = await verDiagnosticos(usuarios, firestore);
        if (!res.success) {
            setDiagnosticos([]);
            setModoModal(2);
            setModal({
                mostrar: true, mensaje: res.error, icono: <CloseIcon />,
                titulo: t("titErrCargarDiagnosticos"),
            });
        } else {
            setDiagnosticos(res.data);
        }
    };

    /**
     * Cuenta la cantidad de diagnósticos por médico.
     * @param {Array[JSON]} diagnosticos - Lista de diagnósticos.
     * @param {Array[JSON]} medicos - Lista de médicos.
     */
    const contarDiagnosticos = (diagnosticos, medicos) => {
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
    };

    /**
     * Formatea el rol, estado y elimina los usuarios eliminados.
     * @param {Array} datos - Lista de datos
     * @returns {Array}
     */
    const formatearCeldas = (datos) => {
        const { uid } = usuario;
        const aux = [];

        for (let i = 0; i < datos.length; i++) {
            if (datos[i].rol != "N/A") {
                aux.push({
                    uid: datos[i].uid, nombre: datos[i].nombre, correo: datos[i].correo,
                    rol: datos[i].administrador ? t("txtAdministrador") : t("txtUsuario"),
                    estado: datos[i].estado ? t("txtActivo") : t("txtInactivo"),
                    registro: datos[i].fecha_registro,
                    cantidad: datos[i].cantidad, ultimaConexion: datos[i].ultima_conexion,
                    accion: datos[i].uid == uid ? "" : <Botonera instancia={datos[i]} />
                });
            }
        }

        return aux;
    };

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
     * Actualiza los datos del usuario seleccionado.
     */
    const actualizarUsuario = async (nuevosDatos) => {
        const res = (await desactivarUsuarios([{ uid: seleccionado.uid, rol: nuevosDatos.rol }], !nuevosDatos.estado, false))[0];

        if (res.success) {
            manejadorRecargar();
        } else {
            setModoModal(2);
            setModal({
                mostrar: true, titulo: t("errTitActualizarUsuario"), icono: <CloseIcon />,
                mensaje: t("errActualizarUsuario")
            });
            setCargando(false);
        }
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
     * Desactiva los usuarios seleccionados.
     * @param {Array[String]} usuarios - Lista de usuarios a desactivar.
     * @param {Boolean} estado - Estado a establecer (true para activar, false para desactivar).
     * @param {boolean} banear - Si es true, se eliminará permanentemente al usuario (solo para desactivación).
     * @returns {Array[Object]}
     */
    const desactivarUsuarios = async (usuarios, estado = true, banear = false) => {
        setCargando(true);

        const peticiones = [];
        const token = usuario?.tokenFirebase;

        for (let i = 0; i < usuarios.length; i++) {
            peticiones[i] = null;
        }

        usuarios.forEach((x, i) => {
            const cuerpo = { desactivar: estado, administrador: x.rol, eliminado: banear };
            let uid = encodeURIComponent(x.uid);
            uid = uid.replaceAll(".", "%2E");
            peticiones[i] = peticionApi(
                `admin/usuarios/${uid}`, "PATCH", {}, cuerpo, token, navegacion.idioma, ""
            );
        });

        for (let i = 0; i < peticiones.length; i++) {
            peticiones[i] = await peticiones[i];
        }

        return peticiones;
    };

    /**
     * Elimina los usuarios seleccionados y maneja la respuesta.
     * @param {Array} usuarios - Lista de usuarios a eliminar.
     */
    const eliminarUsuarios = async (usuarios) => {
        let exitoTodas = true;
        let exitoAlgunas = false;
        const res = await desactivarUsuarios(usuarios, true, true);

        for (const i of res) {
            exitoTodas &= i.success;
            exitoAlgunas |= i.success;
        }

        if (exitoAlgunas) {
            manejadorRecargar();

            if (!exitoTodas) {
                setModoModal(2);
                setModal({
                    mostrar: true, titulo: t("errTitEliminarAlgunosUsuarios"), icono: <CloseIcon />,
                    mensaje: t("errEliminarAlgunosUsuarios")
                });
            }
        } else {
            setModoModal(2);
            setModal({
                mostrar: true, titulo: t("errTitEliminarUsuarios"), icono: <CloseIcon />,
                mensaje: t("errEliminarUsuarios")
            });
            setCargando(false);
        }
    };

    /**
     * Manejador del botón de eliminar en cada registro de la tabla.
     * @param {Object} instancia - Instancia del usuario.
     */
    const manejadorBtnEliminar = (instancia) => {
        sessionStorage.setItem("ejecutar-callback", "false");
        const rol = instancia.rol ? t("txtAdministrador").toLowerCase() : t("txtUsuario").toLocaleLowerCase();
        setSeleccionado(instancia);
        setModoModal(0);
        setModal({
            mostrar: true, titulo: t("titAlerta"), icono: <DeleteIcon />,
            mensaje: (
                <Trans i18nKey="txtEliminarUsuario" values={{ instancia, rol }} components={{ 1: <br />, 3: <b />, 5: <b /> }}>
                    ¿Estás seguro de querer eliminar al usuario {instancia.nombre} ({instancia.correo}) — {rol}?
                    <br />
                    <br />
                    <b>ADVERTENCIA:</b> Se bloqueará su acceso a la aplicación <b>permanentemente</b>
                </Trans>)
        });
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

    /**
     * Botón de eliminar que se muestra en cada fila de la tabla.
     * @param {Object} instancia - Instancia del usuario.
     * @returns JSX.Element
     */
    const BtnEliminar = ({ instancia }) => {
        return (
            <Tooltip title={t("txtAyudaBtnEliminarUsuario")}>
                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => manejadorBtnEliminar(instancia)}>
                    <DeleteIcon />
                </Button>
            </Tooltip>
        );
    };

    /**
     * Botón para editar los datos de un usuario que se muestra en cada fila de la tabla.
     * @param {Object} instancia - Instancia del usuario.
     * @returns JSX.Element
     */
    const BtnEditar = ({ instancia }) => {
        return (
            <Tooltip title={t("txtAyudaBtnEditarUsuario")}>
                <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => manejadorBtnEditar(instancia)}>
                    <EditIcon />
                </Button>
            </Tooltip>
        );
    };

    /**
     * Botonera de acciones para cada usuario.
     * @param {Object} instancia - Instancia del usuario.
     * @returns {JSX.Element}
     */
    const Botonera = ({ instancia }) => {
        return (
            <Stack direction="row" spacing={1}>
                <BtnEliminar instancia={instancia} />
                <BtnEditar instancia={instancia} />
            </Stack>
        );
    };

    return (
        <MenuLayout>
            {cargando ? (
                <Box display="flex" justifyContent="center" alignItems="center" width={width} height="85vh">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <TabHeader
                        activarBtnAtras={false}
                        titulo={t("titListaUsuarios")}
                        pestanas={listadoPestanas} />
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
                                campos={campos}
                                datos={datos}
                                lblBusq={t("txtBusqUsuario")}
                                activarBusqueda
                                campoId="uid"
                                terminoBusqueda={""}
                                lblSeleccion={t("txtSufijoUsuariosSelecs")}
                                camposBusq={["nombre", "correo"]}
                                cbClicCelda={manejadorClicCelda}
                                cbAccion={manejadorEliminar}
                                tooltipAccion={t("txtAyudaBtnEliminarUsuarios")}
                                icono={<DeleteIcon />}
                                campoOrdenInicial="nombre"
                                dirOrden="asc"
                                cargarInfoToda
                            />
                        </Grid>
                    </Grid>
                </>)}
                <FormUsuario
                    mostrar={modalEdicion}
                    instancia={instancia}
                    manejadorBtn={actualizarUsuario}
                    manejadorCierre={() => dispatch({ type: "CERRAR_MODAL_EDICION" })} />
                <PantallaUsuario
                    mostrar={modalVisualizacion}
                    instancia={instancia}
                    cantDiagnosticosAportados={instancia?.cantidad}
                    manejadorCierre={() => dispatch({ type: "CERRAR_MODAL_VISUALIZACION" })} />
        </MenuLayout>
    );
};