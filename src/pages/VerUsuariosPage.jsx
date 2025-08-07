import { Button, Grid, Box, CircularProgress, Tooltip, Stack, TextField, MenuItem, Typography, IconButton } from "@mui/material";
import { detTamCarga } from "../utils/Responsividad";
import MenuLayout from "../components/layout/MenuLayout";
import Datatable from "../components/tabs/Datatable";
import TabHeader from "../components/tabs/TabHeader";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router";
import { useNavegacion } from "../contexts/NavegacionContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import ModalAccion from "../components/modals/ModalAccion";
import { CODIGO_ADMIN } from "../../constants";
import { peticionApi } from "../services/Api";
import { verDiagnosticos } from "../firestore/diagnosticos-collection";
import { useCredenciales } from "../contexts/CredencialesContext";
import { cambiarUsuario, eliminarUsuario } from "../firestore/usuarios-collection";
import EditIcon from '@mui/icons-material/Edit';
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import RefreshIcon from '@mui/icons-material/Refresh';
import { Controller, useForm } from "react-hook-form";

/**
 * Página que muestra la lista de usuarios.
 * @returns {JSX.Element}
 */
export default function VerUsuariosPage() {
    const auth = useAuth();
    const navigate = useNavigate();
    const credenciales = useCredenciales();
    const navegacion = useNavegacion();
    const listadoPestanas = [{
        texto: "Lista de usuarios", url: "/usuarios"
    }];
    const [cargando, setCargando] = useState(true);
    const [modal, setModal] = useState({
        mostrar: false, titulo: "", mensaje: ""
    });
    const [modoModal, setModoModal] = useState(2);
    const [datos, setDatos] = useState(null);
    const [usuarios, setUsuarios] = useState(null);
    const [seleccionado, setSeleccionado] = useState(null);
    const [diagnosticos, setDiagnosticos] = useState(null);
    const [seleccionados, setSeleccionados] = useState([]);
    const { setValue, control, handleSubmit, watch } = useForm({
        defaultValues: {
            uid: "", nombre: "", correo: "", rol: 0, estado: true
        }
    });
    const estado = watch("estado");
    const width = useMemo(() => {
        return detTamCarga(navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho);
    }, [navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho]);
    const campos = [
        { id: "nombre", label: "Nombre" },
        { id: "correo", label: "Correo" },
        { id: "rol", label: "Rol" },
        { id: "ultimaConexion", label: "Última conexión" },
        { id: "cantidad", label: "Diagnósticos" },
        { id: "estado", label: "Estado" },
        { id: "accion", label: "Acción" }
    ];
    const txtBtnModal = useMemo(() => {
        return modoModal == 3 ? "Guardar" : "Eliminar";
    }, [modoModal]);
    const desactivarCampos = useMemo(() => {
        const { uid } = auth.authInfo;
        if (seleccionado != null) {
            return uid == seleccionado.uid;
        } else {
            return false;
        }
    }, [auth.authInfo.uid, seleccionado]);
    const mostrarTxtAdvertencia = useMemo(() => {
        return seleccionado != null && (seleccionado.estado && !estado);
    }, [seleccionado, estado]);
    const usuario = useMemo(() => {
        const datos = seleccionado != null ? seleccionado : { nombre: "", correo: "", rol: 0, estado: true, ultimaConexion: "", cantidad: 0 };
        return [
            { nombre: "Nombre", valor: datos.nombre },
            { nombre: "Correo", valor: datos.correo },
            { nombre: "Rol", valor: datos.rol == CODIGO_ADMIN ? "Administrador" : "Usuario" },
            { nombre: "Estado", valor: datos.estado ? "Inactivo" : "Activo" },
            { nombre: "Última conexión", valor: datos.ultimaConexion },
            { nombre: "Diagnósticos aportados", valor: datos.cantidad },
        ];
    }, [seleccionado]);
    const tamForm = useMemo(() => {
        const { dispositivoMovil, orientacion } = navegacion;
        if (!dispositivoMovil) {
            return "47vh";
        } else if (dispositivoMovil && orientacion == "horizontal") {
            return "70vh";
        } else {
            return "30vh";
        }
    }, [navegacion.dispositivoMovil, navegacion.orientacion]);
    const numCols = useMemo(() => {
        const { dispositivoMovil, orientacion } = navegacion;
        if (dispositivoMovil && (orientacion == "vertical" || navegacion.ancho < 500)) {
            return "column";
        } else {
            return "row";
        }
    }, [navegacion.dispositivoMovil, navegacion.orientacion, navegacion.ancho]);
    const rol = useMemo(() => auth.authInfo.rolVisible, [auth.authInfo.rolVisible]);
    const DB = useMemo(() => credenciales.obtenerInstanciaDB(), [credenciales.obtenerInstanciaDB()]);

    /**
     * Coloca el título de la página.
     */
    useEffect(() => {
        document.title = "Lista de usuarios";

        if (auth.authInfo.user != null && rol != null && rol == CODIGO_ADMIN) {
            manejadorRecargar(auth.authInfo.user.accessToken);
        } else if (rol != null && rol != CODIGO_ADMIN) {
            navigate("/menu", { replace: true });
        }
    }, [rol, auth.authInfo.user]);

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
     */
    const cargarUsuarios = async (token) => {
        const res = await peticionApi(token, "admin/usuarios", "GET", null,
            "Ha ocurrido un error al cargar los usuarios. Por favor reintenta nuevamente."
        );
        if (!res.success) {
            setUsuarios([]);
            setModoModal(2);
            setModal({
                mostrar: true, mensaje: res.error,
                titulo: "❌ Error al cargar los datos",
            });
        } else {
            setUsuarios(res.data.usuarios);
        }
    };

    /**
     * Carga los diagnósticos desde la base de datos.
     */
    const cargarDiagnosticos = async () => {
        const res = await verDiagnosticos(DB);
        if (!res.success) {
            setDiagnosticos([]);
            setModoModal(2);
            setModal({
                mostrar: true, mensaje: res.error,
                titulo: "❌ Error al cargar los diagnósticos",
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
     * @returns Array
     */
    const formatearCeldas = (datos) => {
        const { uid } = auth.authInfo;
        const aux = [];

        for (let i = 0; i < datos.length; i++) {
            if (datos[i].rol != "N/A") {
                aux.push({
                    uid: datos[i].uid, nombre: datos[i].nombre, correo: datos[i].correo,
                    rol: datos[i].rol == CODIGO_ADMIN ? "Administrador" : "Usuario",
                    estado: datos[i].estado ? "Activo" : "Inactivo",
                    cantidad: datos[i].cantidad, ultimaConexion: datos[i].ultima_conexion,
                    accion: datos[i].uid == uid ? "N/A" : <Botonera instancia={datos[i]} />
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
            mostrar: true, titulo: "⚠️ Alerta",
            mensaje: "¿Estás seguro de querer eliminar a los pacientes seleccionados?"
        });
    };

    /**
     * Manejador del clic en una celda de la tabla.
     * @param {JSON} dato - Instancia
     */
    const manejadorClicCelda = (dato) => {
        const ejecutar = sessionStorage.getItem("ejecutar-callback");
        if (ejecutar == "true" || ejecutar == null) {
            const aux = { ...dato };
            aux.estado = aux.estado == "Activo" ? false : true;
            setSeleccionado(aux);
            setModoModal(4);
            setModal({
                mostrar: true, titulo: "ℹ️ Detalles del usuario", mensaje: ""
            });
        }
    };

    /**
     * Manejador del botón derecho del modal.
     */
    const manejadorBtnModal = async () => {
        switch (modoModal) {
            case 0:
                setCargando(true);
                eliminarUsuarios([seleccionado.uid]);
                break;
            case 1:
                setCargando(true);
                if (!verificarAutoeliminacion(seleccionados)) {
                    eliminarUsuarios(seleccionados);
                }
                break;
            case 3:
                setCargando(true);
                handleSubmit(actualizarUsuario)();
        }

        sessionStorage.setItem("ejecutar-callback", "true");
        setModal({ ...modal, mostrar: false });
    };

    /**
     * Recarga los datos de la página.
     */
    const manejadorRecargar = (token = null) => {
        const credencial = (token == null) ? auth.authInfo.user.accessToken : token;

        if (!cargando) {
            setCargando(true);
        }

        setDatos(null);
        setUsuarios(null);
        setDiagnosticos(null);
        setSeleccionado(null);
        setSeleccionados([]);
        cargarUsuarios(credencial);
        cargarDiagnosticos();
    };

    /**
     * Actualiza los datos del usuario seleccionado.
     */
    const actualizarUsuario = async (nuevosDatos) => {
        const peticiones = [null, null];
        let res = true;

        if (seleccionado.estado != nuevosDatos.estado) {
            peticiones[0] = desactivarUsuarios([seleccionado.uid], !nuevosDatos.estado);
        }

        if (nuevosDatos.rol != seleccionado.rol) {
            peticiones[1] = cambiarUsuario({ uid: nuevosDatos.uid, rol: nuevosDatos.rol }, DB);
        }

        for (let i = 0; i < 2; i++) {
            if (peticiones[i] != null) {
                peticiones[i] = await peticiones[i];
                res &= (i == 0) ? peticiones[i][0].success : peticiones[i].success;
            }
        }

        if (res) {
            setSeleccionado(null);
            cambiarValoresUsuario({ uid: "", nombre: "", correo: "", rol: 0, estado: true });
            /*setNuevosDatos({
                uid: "", nombre: "", rol: 0, estado: true
            });*/

            manejadorRecargar();
        } else {
            setModoModal(2);
            setModal({
                mostrar: true, titulo: "❌ Error al actualizar el usuario.",
                mensaje: "Se ha producido un error al actualizar el usuario seleccionado. Por favor, inténtalo de nuevo más tarde."
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
        const res = usuarios.includes(auth.authInfo.uid);
        if (res) {
            setTimeout(() => {
                setModoModal(2);
                setModal({
                    mostrar: true, titulo: "⚠️ Alerta",
                    mensaje: "No puedes eliminarte a ti mismo. Por favor, selecciona otros usuarios."
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
     * @returns {Array[Object]}
     */
    const desactivarUsuarios = async (usuarios, estado = true) => {
        setCargando(true);

        const peticiones = [];
        const token = auth.authInfo.user.accessToken;

        for (let i = 0; i < usuarios.length; i++) {
            peticiones[i] = null;
        }

        usuarios.forEach((x, i) => {
            x = encodeURIComponent(x);
            x = x.replaceAll(".", "%2E");
            peticiones[i] = peticionApi(token, `admin/usuarios/${x}?desactivar=${estado}`, "PATCH");
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
        const peticiones = [];
        let exitoTodas = true;
        let exitoAlgunas = false;

        for (let i = 0; i < usuarios.length; i++) {
            peticiones[i] = null;
        }

        const resDesactivar = await desactivarUsuarios(usuarios);

        resDesactivar.forEach((x, i) => {
            if (x.success) {
                peticiones[i] = eliminarUsuario(usuarios[i], DB);
            }
        });

        for (let i = 0; i < peticiones.length; i++) {
            if (peticiones[i] !== null) {
                peticiones[i] = await peticiones[i];
            }
        }

        for (const i of peticiones) {
            exitoTodas &= i.success;
            exitoAlgunas |= i.success;
        }

        if (exitoAlgunas) {
            manejadorRecargar();

            if (!exitoTodas) {
                setModoModal(2);
                setModal({
                    mostrar: true, titulo: "⚠️ Alerta.",
                    mensaje: "Algunos usuarios no se pudieron eliminar. Por favor, revisa los registros."
                });
            }
        } else {
            setModoModal(2);
            setModal({
                mostrar: true, titulo: "❌ Error al eliminar los usuarios.",
                mensaje: "Se ha producido un error al eliminar los usuarios seleccionados. Por favor, inténtalo de nuevo más tarde."
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
        const rol = instancia.rol == CODIGO_ADMIN ? "administrador" : "usuario";
        setSeleccionado(instancia);
        setModoModal(0);
        setModal({
            mostrar: true, titulo: "⚠️ Alerta",
            mensaje: (<>
                ¿Estás seguro de querer eliminar al usuario {instancia.nombre} ({instancia.correo}) — {rol}?
                <br />
                <br />
                <b>ADVERTENCIA:</b> Se bloqueará su acceso a la aplicación <b>permanentemente</b>
            </>)
        });
    };

    const cambiarValoresUsuario = (instancia) => {
        setValue("uid", instancia.uid);
        setValue("correo", instancia.correo);
        setValue("nombre", instancia.nombre);
        setValue("rol", instancia.rol);
        setValue("estado", instancia.estado);
    };

    /**
     * Manejador del botón de editar en cada registro de la tabla.
     * @param {Object} instancia - Instancia del usuario.
     */
    const manejadorBtnEditar = (instancia) => {
        sessionStorage.setItem("ejecutar-callback", "false");
        setSeleccionado(instancia);
        cambiarValoresUsuario(instancia);
        //setNuevosDatos({ uid: instancia.uid, nombre: instancia.nombre, rol: instancia.rol, estado: instancia.estado });
        setModoModal(3);
        setModal({
            mostrar: true, titulo: "✏️ Editar usuario", mensaje: ""
        });
    };

    /**
     * Manejador del botón de cancelar/cerrar en el modal
     */
    const manejadorBtnCancelar = () => {
        sessionStorage.setItem("ejecutar-callback", "true");
        setModal((x) => ({ ...x, mostrar: false }));
    };

    /**
     * Botón de eliminar que se muestra en cada fila de la tabla.
     * @param {Object} instancia - Instancia del usuario.
     * @returns JSX.Element
     */
    const BtnEliminar = ({ instancia }) => {
        return (
            <Tooltip title="Eliminar usuario">
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
            <Tooltip title="Editar usuario">
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

    const FormActualizarUsuario = useCallback(() => {
        return (
            <Stack spacing={2} width={tamForm}>
                <Controller
                    name="nombre"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            label="Nombre"
                            variant="outlined"
                            disabled
                            fullWidth
                            {...field} />)} />
                <Controller
                    name="correo"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            label="Correo electrónico"
                            variant="outlined"
                            disabled
                            fullWidth
                            {...field} />)} />
                <Controller
                    name="rol"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            select
                            label="Rol"
                            variant="outlined"
                            disabled={desactivarCampos}
                            {...field}
                            fullWidth>
                            <MenuItem value={0}>
                                Usuario
                            </MenuItem>
                            <MenuItem value={CODIGO_ADMIN}>
                                Administrador
                            </MenuItem>
                        </TextField>)} />
                <Controller
                    name="estado"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            label="Estado"
                            variant="outlined"
                            fullWidth
                            select
                            disabled={desactivarCampos}
                            {...field}>
                            <MenuItem value={false}>
                                Inactivo
                            </MenuItem>
                            <MenuItem value={true}>
                                Activo
                            </MenuItem>
                        </TextField>)} />
                {mostrarTxtAdvertencia ? <Typography variant="body2">
                    <b>¡Atención! El usuario no podrá ingresar en la aplicación.</b>
                </Typography> : null}
            </Stack>
        );
    }, [control, desactivarCampos, tamForm, mostrarTxtAdvertencia]);

    /**
     * Componente que muestra los detalles del usuario seleccionado.
     * @returns {JSX.Element}
     */
    const VerUsuario = () => {
        dayjs.extend(customParseFormat);
        return (
            <Box>
                {usuario.map((x, i) => {
                    let orientacion = numCols;
                    let espaciado = (numCols == "column") ? 0 : 1;
                    if (i == 2 || i == 3 || i == 5) {
                        orientacion = "row";
                        espaciado = 1;
                    }
                    return (
                        <Stack
                            direction={orientacion}
                            spacing={espaciado}
                            display="flex"
                            justifyContent="start"
                            key={i}
                            width="100%"
                            marginBottom="5px">
                            <Typography variant="body1" fontWeight="bold">
                                {x.nombre}:
                            </Typography>
                            <Typography variant="body1">
                                {i == 4 ? dayjs(x.valor, "DD/MM/YYYY hh:mm A").format(`DD [de] MMMM [de] YYYY [a las] hh:mm A`) : x.valor}.
                            </Typography>
                        </Stack>
                    );
                })}
            </Box>
        );
    };

    /**
     * Cuerpo del modal que se muestra al hacer clic en un usuario o en el botón de editar.
     * @returns {JSX.Element}
     */
    const CuerpoModal = () => {
        switch (modoModal) {
            case 3:
                return <FormActualizarUsuario />;
            case 4:
                return <VerUsuario />;
        }
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
                        titulo="Lista de usuarios"
                        pestanas={listadoPestanas} />
                    <Grid container columns={1} spacing={3} sx={{ marginTop: "3vh", width: width }}>
                        <Grid display="flex" size={1} justifyContent="end">
                            <Tooltip title="Recargar datos">
                                <IconButton onClick={() => manejadorRecargar()}>
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        <Grid size={1}>
                            <Datatable
                                campos={campos}
                                datos={datos}
                                lblBusq="Buscar usuario por nombre o correo electrónico"
                                activarBusqueda={true}
                                campoId="uid"
                                terminoBusqueda={""}
                                lblSeleccion="usuarios seleccionados"
                                camposBusq={["nombre", "correo"]}
                                cbClicCelda={manejadorClicCelda}
                                cbAccion={manejadorEliminar}
                                tooltipAccion="Eliminar usuarios seleccionados"
                                icono={<DeleteIcon />}
                            />
                        </Grid>
                    </Grid>
                </>)}
            <ModalAccion
                abrir={modal.mostrar}
                titulo={modal.titulo}
                mensaje={modal.mensaje}
                manejadorBtnPrimario={manejadorBtnModal}
                manejadorBtnSecundario={manejadorBtnCancelar}
                mostrarBtnSecundario={modoModal != 2 && modoModal != 4}
                txtBtnSimple={txtBtnModal}
                txtBtnSecundario="Cancelar"
                txtBtnSimpleAlt="Cerrar">
                <CuerpoModal />
            </ModalAccion>
        </MenuLayout>
    );
};