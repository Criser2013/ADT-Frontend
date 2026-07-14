import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import Datatable from "../../components/datatable";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FormSeleccionar from "../../components/forms/FormSeleccionar";
import RefreshIcon from '@mui/icons-material/Refresh';

import { AdvertenciaEspacio } from "../../components/menu";
import { Grid, Box, CircularProgress, Tooltip, IconButton, Button, Typography } from "@mui/material";
import { Check } from "../../components/tabs";
import { cambiarDiagnostico, verDiagnosticos, verDiagnosticosPorMedico, eliminarDiagnostico } from "../../services/Firestore";
import { ChipDiagnostico, ChipSexo, ChipValidado } from "../../components/tabs/Chips";
import { descargarArchivoXlsx } from "../../utils/XlsxFiles";
import { detTxtDiagnostico, nombresCampos } from "../../utils/TratarDatos";
import { MenuLayout, TabHeader, PantallaCarga } from "../../components/layout";
import { ModalDoble, ModalSimple } from "../../components/modals";
import { peticionApi } from "../../services/Api";
import { useAppConfig, useAuth, useIdioma, usePacientes } from "../../hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";


/**
 * Página para ver los diagnósticos del usuario.
 * @returns {JSX.Element}
 */
export default function VerDiagnosticosPage() {
    const { idioma } = useIdioma();
    const { usuario } = useAuth();
    const { t } = useTranslation();
    const { cargarDatos, pacientes, helperListo, cancelarPeticiones } = usePacientes();

    const navigate = useNavigate();
    const { firestore } = useAppConfig();
    const [cargando, setCargando] = useState(true);
    const [modal, setModal] = useState({
        mostrar: false, titulo: ""
    });
    const [modalError, setModalError] = useState({ mostrar: false, texto: ""});
    const [activar2Btn, setActivar2Btn] = useState(false);
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
    const admin = useMemo(() => usuario?.rolVisible, [usuario.rolVisible]);
    const camposVariables = useMemo(() => !admin ? [
        { id: "id", label: "ID", componente: null, ordenable: true },
        { id: "nombre", label: t("txtPaciente"), componente: null, ordenable: true },
        { id: "paciente", label: t("txtCedula"), componente: null, ordenable: true },
    ] : [
        { id: "id", label: "ID", componente: null, ordenable: true },
        { id: "nombre", label: t("txtMedico"), componente: null, ordenable: true }], [navegacion.idioma, admin]);
    const camposFijos = useMemo(() => camposVariables.concat([
        { id: "fecha", label: t("txtFecha"), componente: (x) => dayjs(x.fecha).format(t("formatoFechaHoraResumida")), ordenable: true },
        { id: "edad", label: t("txtCampoEdad"), componente: null, ordenable: true },
        { id: "sexo", label: t("txtCampoSexo"), componente: (x) => <ChipSexo sexo={x.sexo} />, ordenable: true },
        { id: "diagnostico", label: t("txtCampoDiagModelo"), componente: (x) => <ChipDiagnostico diagnostico={x.diagnostico} />, ordenable: true },
        { id: "validado", label: t("txtCampoDiagMedico"), componente: (x) => <ChipValidado validado={x.validado} />, ordenable: true }
    ]), [camposVariables, navegacion.idioma]);
    const camposTabla = useMemo(() => {
        return !admin ? camposFijos.concat([{ id: "accion", label: t("txtAccion"), componente: null, ordenable: false }]) : camposFijos;
    }, [admin, camposFijos, navegacion.idioma]);
    const camposBusq = useMemo(() => {
        const campos = ["id", "nombre"];
        if (!admin) {
            campos.push("paciente");
        }
        return campos;
    }, [admin]);
    const activarSeleccion = useMemo(() => {
        return admin;
    }, [admin]);
    const titulo = useMemo(() => {
        return !admin ? t("txtHistorialDiagnosticos") : t("txtDatosRecolectados");
    }, [admin, navegacion.idioma]);
    const lblBusq = useMemo(() => {
        return !admin ? t("txtBusqDiag") : t("txtBusqDiagAdmin");
    }, [admin, navegacion.idioma]);
    const listadoPestanas = useMemo(() => {
        const txt = admin ? t("txtDatosRecolectados") : t("txtHistorialDiagnosticos");
        return [{ texto: txt, url: "/diagnosticos" }];
    }, [admin, navegacion.idioma]);
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
        if (admin) {
            return t("txtAyudaBtnExportarAdmin");
        } else {
            return t("txtAyudaBtnExportar");
        }
    }, [admin, navegacion.idioma]);

    useEffect(() => {
        document.title = usuario.rol ? t("txtDatosRecolectados") : t("txtHistorialDiagnosticos");
    }, [usuario, t]);

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
        if (!admin) {
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
        const credencial = (admin || token == null) ? usuario?.tokenFirebase : token;
        const uid = (usuario == null) ? usuario?.uid : usuario;
        const rolUsuario = (cargo == null) ? admin : cargo;
        const BD = (db == null) ? firestore : db;

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

        cargarPacientes(credencial).then((usuarios) => {
            cargarDiagnosticos(uid, rolUsuario, BD, usuarios);
        });
    };

    /**
     * Carga los datos de los pacientes desde Drive y luego los diagnósticos.
     * @param {String} token - Token de acceso de Firebase del usuario.
     */
    const cargarPacientes = async (token = "") => {
        const res = !admin ? await drive.cargarDatos() :
            await peticionApi(
                "admin/usuarios", "GET", {}, null, token, navegacion.idioma,
                t("errCargarUsuarios")
            );
        let usuarios = [];
        if (res.success && admin) {
            setPersonas(res.data.usuarios);
            usuarios = res.data.usuarios.map((x) => x.uid != undefined ? x.uid : x.paciente);
        } else if (res.success && !admin) {
            return [];
        } else {
            setModoModal(0);
            setActivar2Btn(false);
            setModal({
                mostrar: true, mensaje: res.error, icono: <CloseIcon />,
                titulo: `${t("titErrCargaDatos")} ${!admin ? t("errCargaDatosSufijoPaciente") : t("errCargaDatosSufijoUsuarios")}`,
            });
            setPersonas([]);
        }

        sessionStorage.setItem("descargando-drive", "false");
        return usuarios;
    };

    /**
     * Carga los datos de los diagnósticos y dependiendo del rol, de los médicos.
     * @param {String} uid - UID del médico.
     * @param {Number} rol - Rol del usuario (0: médico, 1001: administrador).
     * @param {Object} DB - Instancia de Firestore.
     * @param {Array[string]} usuarios - Array con los UID de los médicos (solo para administradores).
     */
    const cargarDiagnosticos = async (uid, rol, DB, usuarios = []) => {
        const res = !rol ? await verDiagnosticosPorMedico(uid, DB) : await verDiagnosticos(usuarios, DB);
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

            if (admin) {
                clave = i.uid;
            }

            aux[clave] = { nombre: i.nombre, cedula: !admin ? i.cedula : i.uid };
        }

        for (let i = 0; i < diags.length; i++) {
            auxDiag[i].sexo = auxDiag[i].sexo == 0 ? t("txtMasculino") : t("txtFemenino");
            const campos = admin ? "medico" : "paciente";
            const persona = aux[auxDiag[i][campos]];
            const nombre = (admin && persona == undefined) ? t("txtUsuario") : t("txtPaciente");
            if (!admin) {
                auxDiag[i].paciente = (persona != undefined) ? persona.cedula : "N/A";
                auxDiag[i].id = auxDiag[i].id.replace(/-\w{28}$/, "");
            }
            

            auxDiag[i].nombre = (persona != undefined) ? persona.nombre : `${nombre} ${t("txtEliminado")}`;
            auxDiag[i].diagnostico = detTxtDiagnostico(auxDiag[i].diagnostico, navegacion.idioma);
            auxDiag[i].fecha = auxDiag[i].fecha.toDate();
            auxDiag[i].accion = (auxDiag[i].validado == 2 && !admin) ? <BtnValidar diagnostico={i} /> : "";
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
     * @param {Diagnostico} dato Instancia de diagnóstico de la tabla.
     */
    function manejadorClicCelda(dato) {
        const id = admin ? dato.id : `${dato.id}-${dato.usuario}`;
        navigate(`/diagnosticos/${id}`);
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
     * @param {Array<String>} idsDiagnosticos Lista IDs de los diagnósticos a eliminar.
     */
    async function borrarDiagnosticos (idsDiagnosticos) {
        const peticiones = [];
        let res = true;
        idsDiagnosticos.forEach((id) => {
            const uid = id.split(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}-/)[1];
            const pet = eliminarDiagnostico(id, uid, firestore);
            peticiones.push(pet);
        });

        for (const pet of peticiones) {
            res &&= (await pet).success;
        }

        if (res) {
            const usuarios = await cargarPacientes(usuario?.tokenFirebase);
            cargarDiagnosticos(usuario?.uid, admin, firestore, usuarios);
        } else {
            setModalError({ mostrar: true, texto: t("errEliminarDiagApi") });
            setCargando(false);
        }
    };

    /**
     * Cambia el estado de validación de un diagnóstico.
     * @param {JSON} indice - Diagnóstico a validar.
     */
    const validarDiagnostico = async (indice) => {
        setCargando(true);
        const diagnostico = diagnosticos[indice.diagnostico];
        const { id, medico } = diagnostico;
        delete diagnostico.id;
        delete diagnostico.medico;

        const res = await cambiarDiagnostico(id, medico, { ...diagnostico, validado: validar }, firestore);

        if (res.success) {
            const pacientes = await cargarPacientes(usuario?.tokenFirebase);
            cargarDiagnosticos(usuario?.uid, admin, firestore, pacientes);
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
     * @returns {JSX.Element}
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

    function cerrarModalError() {
        setModalError({ ...modalError, mostrar: false });
    };

    function cerrarModalDoble() {
        setModal({ ...modal, mostrar: false });
    };

    /**
     * Manejador del botón para exportar los diagnósticos.
     */
    async function exportarDiagnosticos() {
        const aux = diagnosticos.map((x) => ({ ...x }));
        const opciones = {
            weekday: "long", year: "numeric", month: "long",
            day: "numeric", hour: "numeric", minute: "numeric"
        };
        const fecha = new Date().toLocaleDateString(idioma, opciones).replaceAll(".", "");
        const auxArr = [];
        const nombreArchivo = preprocesar ? `HADT ${t("txtDiagnosticos")} — ${fecha}-${t("txtPreprocesados")}` : `HADT ${t("txtDiagnosticos")} — ${fecha}`;

        for (let i = 0; i < aux.length; i++) {
            // Solo se incluyen los diagnósticos validados si se requiere preprocesar y lo pide un admin
            if (!preprocesar || (preprocesar && aux[i].validado != 2)) {
                aux[i].id = !admin ? aux[i].id.replace(/-\w{28}$/, "") : aux[i].id;
                aux[i].paciente = datos[i].nombre;
                aux[i] = nombresCampos(aux[i], admin, preprocesar, idioma);
                auxArr.push(aux[i]);
            }
        }

        setModal((x) => ({ ...x, mostrar: false }));

        let res = { success: false, data: [], error: "" };

        if (guardarDrive && admin) {
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

    function manejadorBtnExportar() {
        setModal({
            mostrar: true, titulo: t("titExportar"),
            texto: "", icono: <FileDownloadIcon />
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
                    {((modoModal == 3 && cantNoConfirmados > 0) && admin && preprocesar) ? (
                        <Typography variant="body2">
                            <b>
                                {t("txtAvisoDiagsNoValidados", { cantNoConfirmados })}
                            </b>
                        </Typography>
                    ) : null}
                    {(modoModal == 3 && admin) ? (
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

    const manejadorCarga = useCallback(async () => {
            const { success, error, cancelled } = await cargarDatos();
            if (!success && !cancelled) {
                setModalError({ mostrar: true, texto: t(error) });
            }
            if (!cancelled) {
                setCargando(false);
            }
        }, [cargarDatos, setModalError, setCargando, t]);

    
    useEffect(() => {
        if (helperListo) {
            manejadorCarga();
            return () => {
                cancelarPeticiones();
            }; 
        }
    }, [helperListo, manejadorCarga, cancelarPeticiones]);

    return (
        <MenuLayout>
            {cargando ? <PantallaCarga /> : (
                <>
                    <TabHeader
                        titulo={titulo}
                        pestanas={listadoPestanas}
                        activarBtnAtras={false} />
                    <Grid container columns={1} spacing={3} sx={{ marginTop: "3vh" }}>
                        <AdvertenciaEspacio numDiagnosticos={datos.length} />
                        <Grid size={1} display="flex" justifyContent="space-between" alignItems="center">
                            <Tooltip title={t("txtAyudaBtnRecargar")}>
                                <IconButton onClick={manejadorRecargar}>
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
                                        startIcon={admin ? <AddToDriveIcon /> : <FileDownloadIcon />}>
                                        <b>{t("txtBtnExportar")}</b>
                                    </Button>
                                </span>
                            </Tooltip>
                        </Grid>
                        <Datatable
                            datos={datos}
                            campos={camposTabla}
                            campoId="id"
                            lblBusqueda={lblBusq}
                            lblSeleccion={t("txtSufijoDiagsSelecs")}
                            tooltipAccion={t("txtAyudaEliminarDiags")}
                            activarBusqueda={true}
                            activarSeleccion={activarSeleccion}
                            camposBusq={camposBusq}
                            campoOrdenInicial="fecha"
                            direccionOrdenInicial="desc"
                            callbackClicCelda={manejadorClicCelda}
                            callbackBtnbAccion={manejadorEliminar}
                            icono={<DeleteIcon />} />
                    </Grid>
                </>)}
            <ModalDoble
                mostrar={modal.mostrar}
                titulo={modal.titulo}
                txtBtnPrincipal={lblBtnPrimarioModal}
                txtBtnSecundario={t("txtBtnCancelar")}
                manejadorBtnPrincipal={manejadorBtnModal}
                manejadorBtnSecundario={cerrarModalDoble}
                iconoBtnPrincipal={modal.icono}
                iconoBtnSecundario={<CloseIcon />}>
                <CuerpoModal />
            </ModalDoble>
            <ModalSimple
                mostrar={modalError.mostrar}
                titulo={t("titErr")}
                texto={modalError.texto}
                txtBtn={t("txtBtnCerrar")}
                manejadorBtn={cerrarModalError}
                iconoBtn={<CloseIcon />} />
        </MenuLayout>
    );
};