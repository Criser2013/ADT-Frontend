import { Button, Grid, Box, CircularProgress, Tooltip } from "@mui/material";
import { detTamCarga } from "../utils/Responsividad";
import MenuLayout from "../components/layout/MenuLayout";
import Datatable from "../components/tabs/Datatable";
import TabHeader from "../components/tabs/TabHeader";
import DeleteIcon from "@mui/icons-material/Delete";
//import { useNavigate } from "react-router";
import { useNavegacion } from "../contexts/NavegacionContext";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import ModalAccion from "../components/modals/ModalAccion";
import { CODIGO_ADMIN } from "../../constants";
import { peticionApi } from "../services/Api";
import { verDiagnosticos } from "../firestore/diagnosticos-collection";
import { useCredenciales } from "../contexts/CredencialesContext";
import { eliminarUsuario } from "../firestore/usuarios-collection";

/**
 * Página que muestra la lista de usuarios.
 * @returns JSX.Element
 */
export default function VerUsuariosPage() {
    const auth = useAuth();
    //const navigate = useNavigate();
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
    const rol = useMemo(() => auth.authInfo.rol, [auth.authInfo.rol]);
    const DB = useMemo(() => credenciales.obtenerInstanciaDB(), [credenciales.obtenerInstanciaDB()]);

    /**
     * Coloca el título de la página.
     */
    useEffect(() => {
        document.title = "Lista de usuarios";

        if (auth.authInfo.user != null) {
            cargarUsuarios(auth.authInfo.user.accessToken);
            cargarDiagnosticos();
        }/* else {
            navigate("/menu", { replace: true });
        }*/
    }, [rol, auth.authInfo.user]);

    /**
     * Cuando se cargan los médicos y diagnósticos, se cuentan los diagnósticos por médico
     * y se formatean los datos.
     */
    useEffect(() => {
        if (usuarios != null && diagnosticos != null && datos == null) {
            console.log(usuarios)
            console.log(diagnosticos);
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
                titulo: "Error al cargar los datos",
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
            setUsuarios([]);
            setModoModal(2);
            setModal({
                mostrar: true, mensaje: res.error,
                titulo: "Error al cargar los diagnósticos",
            });
        } else {
            setDiagnosticos(res.data);
        }
    };

    /**
     * Cuenta la cantidad de diagnósticos por médico.
     * @param {Array[JSON]} diagnosticos - Lista de diagnósticos.
     * @param {Array[JSON]} medicos - Lista de médicos.
     * @returns 
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
            medicos[i].cantidad = aux[medicos[i].correo] || 0;
        }

        setDatos(formatearCeldas(medicos));
    };

    /**
     * Formatea el rol, estado y elimina los usuarios eliminados.
     * @param {Array} datos - Lista de datos
     * @returns Array
     */
    const formatearCeldas = (datos) => {
        const { correo } = auth.authInfo;
        const aux = [];

        for (let i = 0; i < datos.length; i++) {
            if (datos[i].rol != "N/A") {
                aux.push({
                    nombre: datos[i].nombre, correo: datos[i].correo,
                    rol: datos[i].rol == CODIGO_ADMIN ? "Administrador" : "Usuario",
                    estado: datos[i].estado ? "Activo" : "Inactivo",
                    cantidad: datos[i].cantidad, ultimaConexion: datos[i].ultima_conexion,
                    accion: datos[i].correo == correo ? "N/A" : <BtnEliminar instancia={datos[i]} />
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
            mostrar: true, titulo: "Alerta",
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
            console.log(dato);
        }
    };

    /**
     * Manejador del botón derecho del modal.
     */
    const manejadorBtnModal = async () => {
        switch (modoModal) {
            case 0:
                setCargando(true);
                eliminarUsuarios([seleccionado.correo]);
                break;
            case 1:
                setCargando(true);
                eliminarUsuarios(seleccionados);
                break;
        }

        sessionStorage.setItem("ejecutar-callback", "true");
        setModal({ ...modal, mostrar: false });
    };

    /**
     * Desactiva los usuarios seleccionados.
     * @param {Array[String]} usuarios - Lista de usuarios a desactivar.
     * @returns {Array[Object]}
     */
    const desactivarUsuarios = async (usuarios) => {
        setCargando(true);

        const peticiones = [];
        const token = auth.authInfo.user.accessToken;

        for (let i = 0; i < usuarios.length; i++) {
            peticiones[i] = null;
        }

        usuarios.forEach((x, i) => {
            x = encodeURIComponent(x);
            x = x.replaceAll(".", "%2E");
            peticiones[i] = peticionApi(token, `admin/usuarios/${x}?desactivar=${true}`, "PATCH");
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
            setDatos(null);
            setUsuarios(null);
            setDiagnosticos(null);

            cargarUsuarios(auth.authInfo.user.accessToken, usuarios);
            cargarDiagnosticos();

            if (!exitoTodas) {
                setModoModal(2);
                setModal({
                    mostrar: true, titulo: "Alerta.",
                    mensaje: "Algunos usuarios no se pudieron eliminar. Por favor, revisa los registros."
                });
            }
        } else {
            setModoModal(2);
            setModal({
                mostrar: true, titulo: "Error al eliminar los usuarios.",
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
        instancia = instancia.instancia;
        const rol = instancia.rol == CODIGO_ADMIN ? "administrador" : "usuario";
        setSeleccionado(instancia);
        setModoModal(0);
        setModal({
            mostrar: true, titulo: "Alerta",
            mensaje: `¿Estás seguro de querer eliminar al usuario ${instancia.nombre} — ${rol} (${instancia.correo})?`
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
    const BtnEliminar = (instancia) => {
        return (
            <Tooltip title="Eliminar usuario">
                <Button
                    variant="outlined"
                    color="error"
                    onClick={() => manejadorBtnEliminar(instancia)}>
                    <DeleteIcon />
                </Button>
            </Tooltip>
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
                        titulo="Lista de usuarios"
                        pestanas={listadoPestanas} />
                    <Grid container columns={1} spacing={3} sx={{ marginTop: "3vh", width: width }}>
                        <Grid size={1}>
                            <Datatable
                                campos={campos}
                                datos={datos}
                                lblBusq="Buscar usuario por nombre o correo electrónico"
                                activarBusqueda={true}
                                campoId="correo"
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
                mostrarBtnSecundario={modoModal != 2}
                txtBtnSimple="Eliminar"
                txtBtnSecundario="Cancelar"
                txtBtnSimpleAlt="Cerrar" />
        </MenuLayout>
    );
};