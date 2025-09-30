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
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FormSeleccionar from "../../components/forms/FormSeleccionar";
import { CODIGO_ADMIN } from "../../../constants";
import Check from "../../components/tabs/Check";
import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import RefreshIcon from '@mui/icons-material/Refresh';
import AdvertenciaEspacio from "../../components/menu/AdvertenciaEspacio";
import CloseIcon from "@mui/icons-material/Close";
import { ChipDiagnostico, ChipValidado, ChipSexo } from "../../components/tabs/Chips";
import { useTranslation } from "react-i18next";

/**
 * Página para ver los diagnósticos del usuario.
 * @returns {JSX.Element}
 */
export default function VerDiagnosticosPage() {
    const auth = useAuth();
    const drive = useDrive();
    const { t } = useTranslation();
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
    const camposVariables = useMemo(() => (rol != CODIGO_ADMIN) ? [
        { id: "id", label: "ID", componente: null, ordenable: true },
        { id: "nombre", label: t("txtPaciente"), componente: null, ordenable: true },
        { id: "paciente", label: t("txtCedula"), componente: null, ordenable: true },
    ] : [{ id: "nombre", label: t("txtMedico"), componente: null, ordenable: true }], [navegacion.idioma, rol]);
    const camposFijos = useMemo(() => camposVariables.concat([
        { id: "fecha", label: t("txtFecha"), componente: (x) => dayjs(x.fecha).format("DD/MM/YYYY [-] hh:mm A"), ordenable: true },
        { id: "edad", label: t("txtCampoEdad"), componente: null, ordenable: true },
        { id: "sexo", label: t("txtCampoSexo"), componente: (x) => <ChipSexo sexo={x.sexo} />, ordenable: true },
        { id: "diagnostico", label: t("txtCampoDiagModelo"), componente: (x) => <ChipDiagnostico diagnostico={x.diagnostico} />, ordenable: true },
        { id: "validado", label: t("txtCampoDiagMedico"), componente: (x) => <ChipValidado validado={x.validado} />, ordenable: true }
    ]), [navegacion.idioma]);
    const camposTabla = useMemo(() => {
        return (rol != CODIGO_ADMIN) ? camposFijos.concat([{ id: "accion", label: t("txtAccion"), componente: null, ordenable: false }]) : camposFijos;
    }, [rol, camposFijos, navegacion.idioma]);
    const camposBusq = useMemo(() => {
        const campos = ["id", "nombre"];
        if (rol != CODIGO_ADMIN) {
            campos.push("paciente");
        }
        return campos;
    }, [rol]);
    const activarSeleccion = useMemo(() => {
        return rol == CODIGO_ADMIN;
    }, [rol]);
    const titulo = useMemo(() => {
        return (rol != CODIGO_ADMIN) ? t("txtHistorialDiagnosticos") : t("txtDatosRecolectados");
    }, [rol, navegacion.idioma]);
    const lblBusq = useMemo(() => {
        return (rol != CODIGO_ADMIN) ? t("txtBusqDiag") : t("txtBusqDiagAdmin");
    }, [rol, navegacion.idioma]);
    const listadoPestanas = useMemo(() => {
        const txt = (rol == CODIGO_ADMIN) ? t("txtDatosRecolectados") : t("txtHistorialDiagnosticos");
        return [{ texto: txt, url: "/diagnosticos" }];
    }, [rol, navegacion.idioma]);
    const desactivarBtns = useMemo(() => {
        return datos.length == 0;
    }, [datos.length]);
    const lblBtnPrimarioModal = useMemo(() => {
        switch (modoModal) {
            case 1:
                return t("txtBtnEliminar");
            case 2:
                return t("txtBtnValidar");
            case 3:
                return t("txtBtnExportar");
            default:
                return t("txtBtnAceptar");
        }
    }, [modoModal, navegacion.idioma]);
    const cantNoConfirmados = useMemo(() => {
        const aux = diagnosticos != null ? diagnosticos.filter((x) => x.validado == 2) : [];
        return aux.length;
    }, [diagnosticos]);
    const desactivarBtnModal = useMemo(() => {
        return (diagnosticos != null && cantNoConfirmados == diagnosticos.length) && modoModal == 3 && preprocesar;
    }, [diagnosticos, cantNoConfirmados, modoModal, preprocesar]);
    const txtToolExportar = useMemo(() => {
        if (rol == CODIGO_ADMIN) {
            return t("txtAyudaBtnExportarAdmin");
        } else {
            return t("txtAyudaBtnExportar");
        }
    }, [rol, navegacion.idioma]);
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
        const { uid } = auth.authInfo;
        const descargar = sessionStorage.getItem("descargando-drive");
        const exp = (descargar == null || descargar == "false");

        if (rol != null && uid != null && DB != null && drive.token != null && exp && !archivoDescargado) {
            sessionStorage.setItem("descargando-drive", "true");
            manejadorRecargar(drive.token, uid, rol, DB);
        }
    }, [auth.authInfo.uid, drive.token, rol, DB, archivoDescargado]);

    useEffect(() => {
        document.title = rol != CODIGO_ADMIN ? t("txtHistorialDiagnosticos") : t("txtDatosRecolectados");
    }, [rol, navegacion.idioma]);

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
            setDatos(formatearCeldas(personas.map((x) => ({ ...x })), diagnosticos.map((x) => ({ ...x }))));
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
                t("errCargarUsuarios"), navegacion.idioma
            );
        setArchivoDescargado(true);
        if (res.success && rol == CODIGO_ADMIN) {
            setPersonas(res.data.usuarios);
        } else if (res.success && rol != CODIGO_ADMIN) {
            return;
        } else {
            setModoModal(0);
            setActivar2Btn(false);
            setModal({
                mostrar: true, mensaje: res.error, icono: <CloseIcon />,
                titulo: `${t("titErrCargaDatos")} ${(rol != CODIGO_ADMIN) ? t("errCargaDatosSufijoPaciente") : t("errCargaDatosSufijoUsuarios")}`,
            });
            setPersonas([]);
        }

        sessionStorage.setItem("descargando-drive", "false");
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
                mostrar: true, titulo: t("titErrCargarDiagnosticos"), icono: <CloseIcon />,
                mensaje: t("errCargarDiagnosticos")
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

        personas.push({ id: "Anónimo", nombre: t("txtAnonimo"), cedula: "N/A", uid: "Anónimo" });

        for (const i of personas) {
            let clave = i.id;

            if (rol == CODIGO_ADMIN) {
                clave = i.uid;
            }

            aux[clave] = { nombre: i.nombre, cedula: (rol != CODIGO_ADMIN) ? i.cedula : i.uid };
        }

        for (let i = 0; i < diags.length; i++) {
            auxDiag[i].sexo = auxDiag[i].sexo == 0 ? t("txtMasculino") : t("txtFemenino");
            const campos = (rol != CODIGO_ADMIN) ? "paciente" : "medico";
            const persona = aux[auxDiag[i][campos]];
            const nombre = (rol != CODIGO_ADMIN && persona == undefined) ? t("txtPaciente") : t("txtUsuario");
            if (rol != CODIGO_ADMIN) {
                auxDiag[i].paciente = (persona != undefined) ? persona.cedula : "N/A";
                auxDiag[i].id = auxDiag[i].id.replace(/-\w{28}$/, "");
            }
            

            auxDiag[i].nombre = (persona != undefined) ? persona.nombre : `${nombre} ${t("txtEliminado")}`;
            auxDiag[i].diagnostico = detTxtDiagnostico(auxDiag[i].diagnostico, navegacion.idioma);
            auxDiag[i].fecha = auxDiag[i].fecha.toDate();
            auxDiag[i].accion = (auxDiag[i].validado == 2 && rol != CODIGO_ADMIN) ? <BtnValidar diagnostico={i} /> : "";
            auxDiag[i].validado = detTxtDiagnostico(auxDiag[i].validado, navegacion.idioma);

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
            mostrar: true, titulo: t("titAlerta"), icono: <DeleteIcon />,
            mensaje: t("txtConfirmacionEliminarDiags")
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
            const id = (rol == CODIGO_ADMIN) ? dato.id : `${dato.id}-${auth.authInfo.uid}`;
            navigate(`/diagnosticos/ver-diagnostico?id=${id}`);
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
                mostrar: true, titulo: t("titErrEliminarDiagApi"), icono: <CloseIcon />,
                mensaje: t("errEliminarDiagApi")
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
                mostrar: true, titulo: t("tituloErr"), icono: <CloseIcon />,
                mensaje: t("errValidarDiagnosticoApi")
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
                mostrar: true, titulo: t("titValidar"), mensaje: "", icono: <CheckCircleOutlineIcon />,
            });
        };

        return (
            <Tooltip title={t("txtAyudaValidar")}>
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
        const fecha = new Date().toLocaleDateString(navegacion.idioma, opciones).replaceAll(".", "");
        const auxArr = [];
        const nombreArchivo = preprocesar ? `HADT ${t("txtDiagnosticos")} — ${fecha}-${t("txtPreprocesados")}` : `HADT ${t("txtDiagnosticos")} — ${fecha}`;

        for (let i = 0; i < aux.length; i++) {
            // Solo se incluyen los diagnósticos validados si se requiere preprocesar y lo pide un admin
            if (!preprocesar || (preprocesar && aux[i].validado != 2)) {
                aux[i].id = (rol != CODIGO_ADMIN) ? aux[i].id.replace(/-\w{28}$/, "") : aux[i].id;
                aux[i].paciente = datos[i].nombre;
                aux[i] = nombresCampos(aux[i], rol == CODIGO_ADMIN, preprocesar, navegacion.idioma);
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
                mostrar: true, titulo: t("tituloErr"), icono: <CloseIcon />,
                mensaje: `${t("errExportar")} ${res.error}.`
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
            mostrar: true, titulo: t("titExportar"),
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
            txt = t("txtSelecArchivo");
            func = setTipoArchivo;
            valor = tipoArchivo;
            valores = [
                { valor: "xlsx", texto: `${t("txtExcel")} (xlsx)` },
                { valor: "csv", texto: `${t("txtCsv")} (csv)` }
            ];
        } else if (modoModal == 2) {
            txt = t("txtValidarDiagnostico");
            func = setValidar;
            error = errorDiagnostico;
            txtError = t("errValidarDiagnostico");
            valor = validar;
            valores = [
                { valor: 2, texto: t("txtSelecDiagnostico") },
                { valor: 0, texto: t("txtNegativo") },
                { valor: 1, texto: t("txtPositivo") }
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
                            <b>
                                {t("txtAvisoDiagsNoValidados", { cantNoConfirmados })}
                            </b>
                        </Typography>
                    ) : null}
                    {(modoModal == 3 && rol == CODIGO_ADMIN) ? (
                        <>
                            <Check
                                activado={preprocesar}
                                manejadorCambios={(e) => setPreprocesar(e.target.checked)}
                                etiqueta={t("txtPreprocesar")}
                                tamano="medium" />
                            <Check
                                activado={guardarDrive}
                                manejadorCambios={(e) => setGuardarDrive(e.target.checked)}
                                etiqueta={t("txtCopiaDrive")}
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
                            <Tooltip title={t("txtAyudaBtnRecargar")}>
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
                                        <b>{t("txtBtnExportar")}</b>
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
                            terminoBusqueda=""
                            lblSeleccion={t("txtSufijoDiagsSelecs")}
                            camposBusq={camposBusq}
                            cbClicCelda={manejadorClicCelda}
                            cbAccion={manejadorEliminar}
                            tooltipAccion={t("txtAyudaEliminarDiags")}
                            icono={<DeleteIcon />}
                            campoOrdenInicial="fecha"
                            dirOrden="asc"
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
                txtBtnSecundario={t("txtBtnCancelar")}
                txtBtnSimpleAlt={t("txtBtnCerrar")}
                desactivarBtnPrimario={desactivarBtnModal}>
                <CuerpoModal />
            </ModalAccion>
        </MenuLayout>
    );
};