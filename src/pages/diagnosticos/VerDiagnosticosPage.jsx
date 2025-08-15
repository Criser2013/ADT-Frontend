import { Grid, Box, CircularProgress, Tooltip, IconButton, Button, Typography } from "@mui/material";
import MenuLayout from "../../components/layout/MenuLayout";
import Datatable from "../../components/tabs/Datatable";
import TabHeader from "../../components/layout/TabHeader";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useDrive } from "../../contexts/DriveContext";
import dayjs from "dayjs";
import ModalAccion from "../../components/modals/ModalAccion";
import { useCredenciales } from "../../contexts/CredencialesContext";
import { cambiarDiagnostico, verDiagnosticos, verDiagnosticosPorMedico, eliminarDiagnosticos } from "../../firestore/diagnosticos-collection";
import { peticionApi } from "../../services/Api";
import { detTxtDiagnostico, nombresCampos } from "../../utils/TratarDatos";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { descargarArchivoXlsx } from "../../utils/XlsxFiles";
import { EXPORT_FILENAME } from "../../../constants";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FormSeleccionar from "../../components/forms/FormSeleccionar";
import { CODIGO_ADMIN } from "../../../constants";
import Check from "../../components/tabs/Check";
import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import RefreshIcon from '@mui/icons-material/Refresh';
import AdvertenciaEspacio from "../../components/menu/AdvertenciaEspacio";
import CloseIcon from "@mui/icons-material/Close";
import { ChipDiagnostico, ChipValidado, ChipSexo } from "../../components/tabs/Chips";

/**
 * Página para ver los diagnósticos del usuario.
 * @returns {JSX.Element}
 */
export default function VerDiagnosticosPage() {
    const auth = useAuth();
    const drive = useDrive();
    const navigate = useNavigate();
    const navegacion = useNavegacion();
    const credenciales = useCredenciales();
    const [cargando, setCargando] = useState(true);
    const [modal, setModal] = useState({
        mostrar: false, titulo: "", mensaje: "", icono: null
    });
    const [activar2Btn, setActivar2Btn] = useState(false);
    const [archivoDescargado, setArchivoDescargado] = useState(false);
    const [datos, setDatos] = useState([]);
    const [diagnosticos, setDiagnosticos] = useState(null);
    const [personas, setPersonas] = useState(null);
    const [seleccionados, setSeleccionados] = useState([]);
    const [validar, setValidar] = useState(2);
    const [instancia, setInstancia] = useState(null);
    const [modoModal, setModoModal] = useState(0);
    const [tipoArchivo, setTipoArchivo] = useState("xlsx");
    const [errorDiagnostico, setErrorDiagnostico] = useState(false);
    const [preprocesar, setPreprocesar] = useState(false);
    const [guardarDrive, setGuardarDrive] = useState(false);
    const rol = useMemo(() => auth.authInfo.rolVisible, [auth.authInfo.rolVisible]);
    const DB = useMemo(() => credenciales.obtenerInstanciaDB(), [credenciales.obtenerInstanciaDB]);
    const camposVariables = (rol != CODIGO_ADMIN) ? [
        { id: "nombre", label: "Paciente", componente: null, ordenable: true },
        { id: "paciente", label: "Cédula", componente: null, ordenable: true }
    ] : [{ id: "nombre", label: "Médico", componente: null, ordenable: true }];
    const camposFijos = camposVariables.concat([
        { id: "fecha", label: "Fecha", componente: null, ordenable: true },
        { id: "edad", label: "Edad", componente: null, ordenable: true },
        { id: "sexo", label: "Sexo", componente: (x) => <ChipSexo sexo={x.sexo} />, ordenable: true },
        { id: "diagnostico", label: "Diagnóstico modelo", componente: (x) => <ChipDiagnostico diagnostico={x.diagnostico} />, ordenable: true },
        { id: "validado", label: "Diagnóstico médico", componente: (x) => <ChipValidado validado={x.validado} />, ordenable: true }
    ]);
    const camposTabla = useMemo(() => {
        return (rol != CODIGO_ADMIN) ? camposFijos.concat([{ id: "accion", label: "Acción", componente: null, ordenable: false }]) : camposFijos;
    }, [rol]);
    const camposBusq = useMemo(() => {
        return (rol != CODIGO_ADMIN) ? ["nombre", "paciente"] : ["nombre"];
    }, [rol]);
    const activarSeleccion = useMemo(() => {
        return rol == CODIGO_ADMIN;
    }, [rol]);
    const titulo = useMemo(() => {
        return (rol != CODIGO_ADMIN) ? "Historial de diagnósticos" : "Datos recolectados";
    }, [rol]);
    const lblBusq = useMemo(() => {
        return (rol != CODIGO_ADMIN) ? "Buscar diagnóstico por nombre o número de cédula del paciente" : "Buscar diagnóstico por nombre del médico";
    }, [rol]);
    const listadoPestanas = useMemo(() => {
        const txt = (rol == CODIGO_ADMIN) ? "Datos recolectados" : "Historial diagnósticos";
        return [{ texto: txt, url: "/diagnosticos" }];
    }, [rol]);
    const desactivarBtns = useMemo(() => {
        return datos.length == 0;
    }, [datos.length]);
    const lblBtnPrimarioModal = useMemo(() => {
        switch (modoModal) {
            case 1:
                return "Eliminar";
            case 2:
                return "Validar";
            case 3:
                return "Exportar";
            default:
                return "Aceptar";
        }
    }, [modoModal]);
    const cantNoConfirmados = useMemo(() => {
        const aux = diagnosticos != null ? diagnosticos.filter((x) => x.validado == 2) : [];
        return aux.length;
    }, [diagnosticos]);
    const desactivarBtnModal = useMemo(() => {
        return (diagnosticos != null && cantNoConfirmados == diagnosticos.length) && modoModal == 3 && preprocesar;
    }, [diagnosticos, cantNoConfirmados, modoModal, preprocesar]);
    const txtToolExportar = useMemo(() => {
        if (rol == CODIGO_ADMIN) {
            return "Descarga los diagnósticos recolectados como una Hoja de Excel o CSV. También puedes crear una copia en Google Drive.";
        } else {
            return "Descarga los diagnósticos como una Hoja de Excel o CSV.";
        }
    }, [rol]);
    const cantDiagnosticos = useMemo(() => {
        return (diagnosticos != null) ? diagnosticos.length : 0;
    }, [diagnosticos]);

    /**
     * Carga el token de sesión y comienza a descargar el archivo de pacientes.
     */
    useEffect(() => {
        const token = sessionStorage.getItem("session-tokens");
        if (token != null) {
            drive.setToken(JSON.parse(token).accessToken);
        } else if (auth.tokenDrive != null) {
            drive.setToken(auth.tokenDrive);
        }
    }, [auth.tokenDrive]);

    /**
     * Carga los diagnósticos y los pacientes dependiendo del rol del usuario.
     */
    useEffect(() => {
        document.title = rol != CODIGO_ADMIN ? "Historial de diagnósticos" : "Datos recolectados";
        const { uid } = auth.authInfo;
        const descargar = sessionStorage.getItem("descargando-drive");
        const exp = (descargar == null || descargar == "false");

        if (rol != null && uid != null && DB != null && drive.token != null && exp && !archivoDescargado) {
            sessionStorage.setItem("descargando-drive", "true");
            manejadorRecargar(drive.token, uid, rol, DB);
        }
    }, [auth.authInfo.uid, drive.token, rol, DB, archivoDescargado]);

    /**
     * Cuando el admin cambia el modo usuario se fuerza a recargar la página.
     */
    useEffect(() => {
        if (navegacion.recargarPagina) {
            setArchivoDescargado(false);
            navegacion.setRecargarPagina(false);
        }
    }, [navegacion.recargarPagina]);

    /**
     * Una vez se cargan los diagnósticos y los pacientes, formatea las celdas.
     */
    useEffect(() => {
        if (diagnosticos != null && personas != null && (diagnosticos.length > 0 && typeof diagnosticos[0].fecha != "string")) {
            setDatos(formatearCeldas(personas, diagnosticos.map((x) => ({ ...x }))));
            setCargando(false);
        } else if (diagnosticos != null && personas != null && diagnosticos.length == 0) {
            setDatos([]);
            setCargando(false);
        }
    }, [diagnosticos, personas]);

    /**
     * Si el usuario es médico, se carga la lista de pacientes desde Drive.
     */
    useEffect(() => {
        if (rol != CODIGO_ADMIN) {
            setPersonas(drive.datos);
        }
    }, [drive.datos]);

    /**
     * Recarga los datos de la página.
     * @param {String} token - Token de acceso de Drive.
     * @param {String} usuario - UID del usuario.
     * @param {Number} cargo - Rol del usuario (0: médico, 1001: administrador).
     * @param {Object} db - Instancia de Firestore.
     */
    const manejadorRecargar = (token = null, usuario = null, cargo = null, db = null) => {
        const credencial = (rol == CODIGO_ADMIN || token == null) ? auth.authInfo.user.accessToken : token;
        const uid = (usuario == null) ? auth.authInfo.uid : usuario;
        const rolUsuario = (cargo == null) ? rol : cargo;
        const BD = (db == null) ? DB : db;

        if (!cargando) {
            setCargando(true);
        }

        if (personas != null) {
            setDatos([]);
            setPersonas(null);
            setDiagnosticos(null);
            setSeleccionados([]);
            setInstancia(null);
        }

        cargarDiagnosticos(uid, rolUsuario, BD);
        cargarPacientes(credencial);
    };

    /**
     * Carga los datos de los pacientes desde Drive y luego los diagnósticos.
     * @param {String} token - Token de acceso de Firebase del usuario.
     */
    const cargarPacientes = async (token = "") => {
        const res = (rol != CODIGO_ADMIN) ? await drive.cargarDatos() :
            await peticionApi(token, "admin/usuarios", "GET", null,
                "Ha ocurrido un error al cargar los usuarios. Por favor reintenta nuevamente."
            );
        setArchivoDescargado(true);
        if (res.success && rol == CODIGO_ADMIN) {
            sessionStorage.setItem("descargando-drive", "false");
            setPersonas(res.data.usuarios);
        } else if (res.success && rol != CODIGO_ADMIN) {
            return;
        } else {
            setModoModal(0);
            setActivar2Btn(false);
            setModal({
                mostrar: true, mensaje: res.error, icono: <CloseIcon />,
                titulo: `❌ Error al cargar los datos ${(rol != CODIGO_ADMIN) ? "de los pacientes" : "de los usuarios"}`,
            });
            setPersonas([]);
        }
    };

    /**
     * Carga los datos de los diagnósticos y dependiendo del rol, de los médicos.
     * @param {String} uid - UID del médico.
     * @param {Number} rol - Rol del usuario (0: médico, 1001: administrador).
     * @param {Object} DB - Instancia de Firestore.
     */
    const cargarDiagnosticos = async (uid, rol, DB) => {
        const res = (rol != CODIGO_ADMIN) ? await verDiagnosticosPorMedico(uid, DB) : await verDiagnosticos(DB);
        if (res.success) {
            setDiagnosticos(res.data);
        } else {
            setModoModal(0);
            setActivar2Btn(false);
            setModal({
                mostrar: true, titulo: "❌ Error al cargar los diagnósticos", icono: <CloseIcon />,
                mensaje: "Ha ocurrido un error al cargar los diagnósticos. Por favor, inténtalo de nuevo más tarde."
            });
            setCargando(false);
        }
    };

    /**
     * Calcula la edad de los pacientes y añade los nombres de los pacientes o
     * el nombre del médico según el rol del usuario.
     * @param {Array} personas - Lista de pacientes (para usuarios) o médicos (para administradores).
     * @param {Array} diags - Lista de diagnósticos.
     * @returns Array
     */
    const formatearCeldas = (personas, diags) => {
        const aux = {};
        const auxDiag = diags.map((d) => d);

        for (const i of personas) {
            let clave = i.id;

            if (rol == CODIGO_ADMIN) {
                clave = i.uid;
            }

            aux[clave] = { nombre: i.nombre, cedula: (rol != CODIGO_ADMIN) ? i.cedula : i.uid };
        }

        for (let i = 0; i < diags.length; i++) {
            auxDiag[i].sexo = auxDiag[i].sexo == 0 ? "Masculino" : "Femenino";
            const campos = (rol != CODIGO_ADMIN) ? "paciente" : "medico";
            const persona = aux[auxDiag[i][campos]];

            if (rol != CODIGO_ADMIN) {
                auxDiag[i].paciente = (persona != undefined) ? persona.cedula : "N/A";
            }

            auxDiag[i].nombre = (persona != undefined) ? persona.nombre : "N/A";
            auxDiag[i].diagnostico = detTxtDiagnostico(auxDiag[i].diagnostico);
            auxDiag[i].fecha = dayjs(auxDiag[i].fecha.toDate()).format("DD/MM/YYYY");
            auxDiag[i].accion = (auxDiag[i].validado == 2 && rol != CODIGO_ADMIN) ? <BtnValidar diagnostico={i} /> : "N/A";
            auxDiag[i].validado = detTxtDiagnostico(auxDiag[i].validado);

            delete auxDiag[i].medico;
        }

        return auxDiag;
    };

    /**
     * Manejador de clic en el botón de eliminar diagnósticos de la tabla.
     * @param {Array} seleccionados - Lista de diagnósticos seleccionados.
     */
    const manejadorEliminar = (seleccionados) => {
        setSeleccionados(seleccionados);
        setActivar2Btn(true);
        setModoModal(1);
        setGuardarDrive(false);
        setPreprocesar(false);
        setModal({
            mostrar: true, titulo: "⚠️ Alerta", icono: <DeleteIcon />,
            mensaje: "¿Estás seguro de querer eliminar los diagnósticos seleccionados?"
        });
    };

    /**
     * Manejador del clic en una celda de la tabla.
     * @param {JSON} dato - Instancia
     */
    const manejadorClicCelda = (dato) => {
        const ejecutar = sessionStorage.getItem("ejecutar-callback");
        if (ejecutar == "true" || ejecutar == null) {
            navegacion.setPaginaAnterior("/diagnosticos");
            sessionStorage.removeItem("ejecutar-callback");
            navigate(`/diagnosticos/ver-diagnostico?id=${dato.id}`);
        }
    };

    /**
     * Manejador del botón derecho del modal.
     */
    const manejadorBtnModal = async () => {
        if (activar2Btn && modoModal == 1) {
            setCargando(true);
            borrarDiagnosticos(seleccionados);
            setModal({ ...modal, mostrar: false });
            setErrorDiagnostico(false);
            sessionStorage.setItem("ejecutar-callback", "true");
            setInstancia(null);
        } else if (activar2Btn && modoModal == 2) {
            setErrorDiagnostico(false);
            validarCambio();
        } else if (modoModal == 3) {
            exportarDiagnosticos();
        } else {
            setModal({ ...modal, mostrar: false });
            setErrorDiagnostico(false);
            sessionStorage.setItem("ejecutar-callback", "true");
            setInstancia(null);
        }
    };

    /**
     * Eliminar los pacientes seleccionados de Drive y maneja la respuesta.
     * @param {Array} pacientes - Lista de diagnósticos a eliminar.
     */
    const borrarDiagnosticos = async (diagnosticos) => {
        const peticiones = [];

        for (let i = 0; i < diagnosticos.length; i++) {
            peticiones[i] = null;
        }

        diagnosticos.forEach((x, i) => {
            peticiones[i] = eliminarDiagnosticos(x, DB);
        });

        for (let i = 0; i < peticiones.length; i++) {
            peticiones[i] = await peticiones[i];
        }

        if (peticiones.every((x) => x.success)) {
            setCargando(true);
            cargarDiagnosticos(auth.authInfo.uid, rol, DB);
            cargarPacientes(auth.authInfo.user.accessToken);
        } else {
            setModoModal(0);
            setActivar2Btn(false);
            setModal({
                mostrar: true, titulo: "❌ Error al eliminar los diagnósticos.", icono: <CloseIcon />,
                mensaje: "Se ha producido un error al eliminar los diagnósticos seleccionados. Por favor, inténtalo de nuevo más tarde."
            });
            setCargando(false);
        }
    };

    /**
     * Revisa que el valor de validación sea vàlido (0 o 1).
     * Si es válido actualiza el diagnóstico.
     */
    const validarCambio = () => {
        setErrorDiagnostico(validar == 2);

        if (validar != 2) {
            validarDiagnostico(instancia);
            sessionStorage.setItem("ejecutar-callback", "true");
            setModal((x) => ({ ...x, mostrar: false }));
        }
    };

    /**
     * Cambia el estado de validación de un diagnóstico.
     * @param {JSON} indice - Diagnóstico a validar.
     */
    const validarDiagnostico = async (indice) => {
        setCargando(true);
        const res = await cambiarDiagnostico({ ...diagnosticos[indice.diagnostico], validado: validar }, DB);

        if (res.success) {
            cargarDiagnosticos(auth.authInfo.uid, rol, DB);
            cargarPacientes(auth.authInfo.user.accessToken);
        } else {
            setActivar2Btn(false);
            setModoModal(0);
            setModal({
                mostrar: true, titulo: "❌ Error", icono: <CloseIcon />,
                mensaje: "No se pudo validar el diagnóstico. Inténtalo de nuevo más tarde."
            });
            setCargando(false);
        }
    };

    /**
     * Botón para validar diagnóstico
     * @param {JSON} diagnostico - Diagnóstico a validar.
     * @returns JSX.Element
     */
    const BtnValidar = (diagnostico) => {
        const func = (x) => {
            setErrorDiagnostico(false);
            setValidar(2);
            sessionStorage.setItem("ejecutar-callback", "false");
            setInstancia(x);
            setActivar2Btn(true);
            setModoModal(2);
            setModal({
                mostrar: true, titulo: "✏️ Validar diagnóstico", mensaje: "", icono: <CheckCircleOutlineIcon />,
            });
        };

        return (
            <Tooltip title="Validar diagnóstico">
                <Button onClick={() => func(diagnostico)} color="primary" variant="outlined">
                    <CheckCircleOutlineIcon />
                </Button>
            </Tooltip>
        );
    };

    /**
     * Manejador del botón cancelar del modal.
     */
    const manejadorBtnCancelar = () => {
        setModal({ ...modal, mostrar: false });
        sessionStorage.setItem("ejecutar-callback", "true");
        setInstancia(null);
    };

    /**
     * Manejador del botón para exportar los diagnósticos.
     */
    const exportarDiagnosticos = async () => {
        const aux = diagnosticos.map((x) => ({ ...x }));
        const opciones = {
            weekday: "long", year: "numeric", month: "long",
            day: "numeric", hour: "numeric", minute: "numeric"
        };
        const fecha = new Date().toLocaleDateString("es-CO", opciones).replaceAll(".", "");
        const auxArr = [];
        const nombreArchivo = preprocesar ? `${EXPORT_FILENAME}${fecha}-Preprocesados` : `${EXPORT_FILENAME}${fecha}`;

        for (let i = 0; i < aux.length; i++) {
            // Solo se incluyen los diagnósticos validados si se requiere preprocesar y lo pide un admin
            if (!preprocesar || (preprocesar && aux[i].validado != 2) || (rol != CODIGO_ADMIN)) {
                aux[i].paciente = datos[i].nombre;
                aux[i] = nombresCampos(aux[i], rol == CODIGO_ADMIN, preprocesar);
                auxArr.push(aux[i]);
            }
        }

        setModal((x) => ({ ...x, mostrar: false }));

        let res = { success: false, data: [], error: "" };

        if (guardarDrive && rol == CODIGO_ADMIN) {
            res = await drive.crearCopiaDiagnosticos(nombreArchivo, auxArr, tipoArchivo);
        }

        res = descargarArchivoXlsx(auxArr, nombreArchivo, tipoArchivo);

        if (!res.success) {
            setModoModal(0);
            setActivar2Btn(false);
            setModal({
                mostrar: true, titulo: "❌ Error", icono: <CloseIcon />,
                mensaje: `No se pudo exportar el archivo. Inténtalo de nuevo más tarde: ${res.error}.`
            });
        }
    };

    /**
     * Manejador del botón de exportar diagnósticos.
     */
    const manejadorBtnExportar = () => {
        setActivar2Btn(true);
        setModoModal(3);
        setModal({
            mostrar: true, titulo: "📁 Exportar diagnósticos",
            mensaje: "", icono: <FileDownloadIcon />
        });
    };

    /**
     * Cuerpo del modal de confirmación.
     * @returns JSX.Element
     */
    const CuerpoModal = () => {
        let txt = "";
        let func = null;
        let error = false;
        let txtError = "";
        let valor = null;
        let valores = [];

        if (modoModal == 3) {
            txt = "Selecciona el tipo de archivo a exportar:";
            func = setTipoArchivo;
            valor = tipoArchivo;
            valores = [
                { valor: "xlsx", texto: "Hoja de cálculo de Excel (xlsx)" },
                { valor: "csv", texto: "Archivo separado por comas (csv)" }
            ];
        } else if (modoModal == 2) {
            txt = "Selecciona el diagnóstico de TEP del paciente:";
            func = setValidar;
            error = errorDiagnostico;
            txtError = "Selecciona el diagnóstico definitivo del paciente";
            valor = validar;
            valores = [
                { valor: 2, texto: "Seleccione el diagnóstico" },
                { valor: 0, texto: "Negativo" },
                { valor: 1, texto: "Positivo" }
            ];
        }

        if (modoModal > 1 && modoModal < 4) {
            return (
                <FormSeleccionar
                    texto={txt}
                    onChange={func}
                    error={error}
                    txtError={txtError}
                    valor={valor}
                    valores={valores}>
                    {((modoModal == 3 && cantNoConfirmados > 0) && (rol == CODIGO_ADMIN) && preprocesar) ? (
                        <Typography variant="body2">
                            <b>⚠️ ¡Atención! Hay {cantNoConfirmados} diagnóstico(s) sin validar.</b>
                        </Typography>
                    ) : null}
                    {(modoModal == 3 && rol == CODIGO_ADMIN) ? (
                        <>
                            <Check
                                activado={preprocesar}
                                manejadorCambios={(e) => setPreprocesar(e.target.checked)}
                                etiqueta="Preprocesar (no se exportan diagnósticos sin validar)"
                                tamano="medium" />
                            <Check
                                activado={guardarDrive}
                                manejadorCambios={(e) => setGuardarDrive(e.target.checked)}
                                etiqueta="Crear una copia en Google Drive"
                                tamano="medium" />
                        </>
                    ) : null}
                </FormSeleccionar>
            );
        } else {
            return null;
        }
    };

    return (
        <MenuLayout>
            {cargando ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="85vh">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <TabHeader
                        activarBtnAtras={false}
                        titulo={titulo}
                        pestanas={listadoPestanas} />
                    <Grid container columns={1} spacing={3} sx={{ marginTop: "3vh" }}>
                        <AdvertenciaEspacio rol={rol} cantidadDiagnosticos={cantDiagnosticos} />
                        <Grid size={1} display="flex" justifyContent="space-between" alignItems="center">
                            <Tooltip title="Recargar la página">
                                <IconButton onClick={() => manejadorRecargar()}>
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={txtToolExportar}>
                                <span>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={manejadorBtnExportar}
                                        disabled={desactivarBtns}
                                        sx={{ textTransform: "none" }}
                                        startIcon={rol == CODIGO_ADMIN ? <AddToDriveIcon /> : <FileDownloadIcon />}>
                                        <b>Exportar diagnósticos</b>
                                    </Button>
                                </span>
                            </Tooltip>
                        </Grid>
                        <Datatable
                            campos={camposTabla}
                            datos={datos}
                            lblBusq={lblBusq}
                            activarBusqueda={true}
                            activarSeleccion={activarSeleccion}
                            campoId="id"
                            terminoBusqueda={""}
                            lblSeleccion="diagnosticos seleccionados"
                            camposBusq={camposBusq}
                            cbClicCelda={manejadorClicCelda}
                            cbAccion={manejadorEliminar}
                            tooltipAccion="Eliminar diagnósticos seleccionados"
                            icono={<DeleteIcon />}
                        />
                    </Grid>
                </>)}
            <ModalAccion
                abrir={modal.mostrar}
                titulo={modal.titulo}
                mensaje={modal.mensaje}
                iconoBtnPrincipal={modal.icono}
                iconoBtnSecundario={<CloseIcon />}
                manejadorBtnPrimario={manejadorBtnModal}
                manejadorBtnSecundario={manejadorBtnCancelar}
                mostrarBtnSecundario={activar2Btn}
                txtBtnSimple={lblBtnPrimarioModal}
                txtBtnSecundario="Cancelar"
                txtBtnSimpleAlt="Cerrar"
                desactivarBtnPrimario={desactivarBtnModal}>
                <CuerpoModal />
            </ModalAccion>
        </MenuLayout>
    );
};