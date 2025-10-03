import { Button, Grid, Box, CircularProgress, Tooltip, IconButton } from "@mui/material";
import MenuLayout from "../../components/layout/MenuLayout";
import Datatable from "../../components/tabs/Datatable";
import TabHeader from "../../components/layout/TabHeader";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useDrive } from "../../contexts/DriveContext";
import dayjs from "dayjs";
import ModalAccion from "../../components/modals/ModalAccion";
import customParseFormat from "dayjs/plugin/customParseFormat";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import { ChipSexo } from "../../components/tabs/Chips";
import { AES, enc } from "crypto-js";
import { AES_KEY } from "../../../constants";

/**
 * Página para ver la lista de pacientes.
 * @returns {JSX.Element}
 */
export default function VerPacientesPage() {
    const auth = useAuth();
    const drive = useDrive();
    const navigate = useNavigate();
    const navegacion = useNavegacion();
    const { t } = useTranslation();
    const listadoPestanas = useMemo(() => [{
        texto: t("titListaPacientes"), url: "/pacientes"
    }], [navegacion.idioma]);
    const [cargando, setCargando] = useState(true);
    const [modal, setModal] = useState({
        mostrar: false, titulo: "", mensaje: "", icono: null
    });
    const [eliminar, setEliminar] = useState(false);
    const [datos, setDatos] = useState([]);
    const [seleccionados, setSeleccionados] = useState([]);
    const campos = useMemo(() => [
        { id: "cedula", label: t("txtCedula"), componente: null, ordenable: true},
        { id: "nombre", label: t("txtNombre"), componente: null, ordenable: true},
        { id: "sexo", label: t("txtCampoSexo"), componente: (x) => <ChipSexo sexo={x.sexo} />, ordenable: true},
        { id: "edad", label: t("txtCampoEdad"), componente: null, ordenable: true},
        { id: "telefono", label: t("txtTelefono"), componente: null, ordenable: true},
    ], [navegacion.idioma]);

    /**
     * Carga el token de sesión y comienza a descargar el archivo de pacientes.
     */
    useEffect(() => {
        const token = sessionStorage.getItem("session-tokens");
        if (token != null) {
            const tokens = JSON.parse(AES.decrypt(token, AES_KEY).toString(enc.Utf8));
            drive.setToken(tokens.accessToken);
        } else if (auth.tokenDrive != null) {
            drive.setToken(auth.tokenDrive);
        }
    }, [auth.tokenDrive]);

    useEffect(() => {
        const descargar = sessionStorage.getItem("descargando-drive");

        if (drive.token != null && (descargar == null || descargar == "false")) {
            sessionStorage.setItem("descargando-drive", "true");
            manejadorRecargar();
        }
    }, [drive.token]);

    useEffect(() => {
        document.title = t("titListaPacientes");
    }, [navegacion.idioma]);

    /**
     * Quita la pantalla de carga cuando se haya descargado el archivo de pacientes.
     */
    useEffect(() => {
        setCargando(drive.descargando);
    }, [drive.descargando]);

    /**
     * Actualiza los datos de la tabla cuando cambian los datos de Drive.
     */
    useEffect(() => {
        setDatos(
            drive.datos != null ?
                formatearCeldas(
                    drive.datos.map((x) => ({ ...x }))
                ) : []
        );
    }, [drive.datos]);

    /**
     * Recarga los datos de la página.
     */
    const manejadorRecargar = () => {
        if (!cargando) {
            setCargando(true);
        }

        if (datos != []) {
            setDatos([]);
            setSeleccionados([]);
        }

        cargarDatos();
    };


    /**
     * Carga los datos de los pacientes desde Drive.
     */
    const cargarDatos = async () => {
        const res = await drive.cargarDatos();
        if (!res.success) {
            setModal({
                mostrar: true, mensaje: res.error,
                titulo: `❌ ${res.error}`, icono: <CloseIcon />
            });
        }
    };

    /**
     * Añade el campo edad y formatea el campo sexo.
     * @param {Array} datos - Lista de datos
     * @returns Array
     */
    const formatearCeldas = (datos) => {
        dayjs.extend(customParseFormat);
        return datos.map((dato) => {
            const sexo = (dato.sexo == 0) ? t("txtMasculino") : t("txtFemenino");

            return {
            id: dato.id, nombre: dato.nombre, cedula: dato.cedula,
            telefono: dato.telefono, sexo: sexo,
            edad: dayjs().diff(dayjs(
                dato.fechaNacimiento, "DD-MM-YYYY"), "year", false
            )
        };
    });
    };

    /**
     * Manejador del botón de anadir pacientes.
     */
    const manejadorBtnAnadir = () => {
        navegacion.setPaginaAnterior("/pacientes");
        navigate("/pacientes/anadir");
    };

    /**
     * Manejador de clic en el botón de eliminar pacientes de la tabla.
     * @param {Array} seleccionados - Lista de pacientes seleccionados.
     */
    const manejadorEliminar = (seleccionados) => {
        setSeleccionados(seleccionados);
        setEliminar(true);
        setModal({
            mostrar: true, titulo: t("titAlerta"), icono: <DeleteIcon />,
            mensaje: t("txtEliminarPacientes")
        });
    };

    /**
     * Manejador del clic en una celda de la tabla.
     * @param {JSON} dato - Instancia
     */
    const manejadorClicCelda = (dato) => {
        navegacion.setPaginaAnterior("/pacientes");
        navigate(`/pacientes/ver-paciente?id=${dato.id}`);
    };

    /**
     * Manejador del botón derecho del modal.
     */
    const manejadorBtnModal = async () => {
        if (eliminar) {
            setCargando(true);
            await eliminarPacientes(seleccionados);
        }

        setModal({ ...modal, mostrar: false });
        setEliminar(false);
    };

    /**
     * Eliminar los pacientes seleccionados de Drive y maneja la respuesta.
     * @param {Array} pacientes - Lista de pacientes a eliminar.
     */
    const eliminarPacientes = async (pacientes) => {
        const res = await drive.eliminarPaciente(pacientes, true);
        if (!res.success) {
            setModal({
                mostrar: true, icono: <CloseIcon />,
                titulo: t("errTitEliminarPacientes"),
                mensaje: res.error
            });
        }
        setCargando(false);
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
                        titulo={t("titListaPacientes")}
                        pestanas={listadoPestanas} />
                    <Grid container columns={1} spacing={3} sx={{ marginTop: "3vh" }}>
                        <Grid size={1} display="flex" justifyContent="space-between" alignItems="center">
                            <Tooltip title={t("txtAyudaBtnRecargar")}>
                                <IconButton onClick={() => manejadorRecargar()}>
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t("txtAyudaBtnAnadirPaciente")}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={manejadorBtnAnadir}
                                    sx={{ textTransform: "none" }}
                                    startIcon={<AddIcon />}>
                                    <b>{t("txtBtnAnadirPaciente")}</b>
                                </Button>
                            </Tooltip>
                        </Grid>
                        <Datatable
                            campos={campos}
                            datos={datos}
                            lblBusq={t("txtBusqPaciente")}
                            activarBusqueda={true}
                            campoId="id"
                            terminoBusqueda={""}
                            lblSeleccion={t("txtSufijoPacientesSelecs")}
                            camposBusq={["nombre", "cedula"]}
                            cbClicCelda={manejadorClicCelda}
                            cbAccion={manejadorEliminar}
                            tooltipAccion={t("txtAyudaBtnEliminarPacientes")}
                            icono={<DeleteIcon />}
                            campoOrdenInicial="nombre"
                            dirOrden="asc"
                        />
                    </Grid>
                </>)}
            <ModalAccion
                abrir={modal.mostrar}
                titulo={modal.titulo}
                mensaje={modal.mensaje}
                manejadorBtnPrimario={manejadorBtnModal}
                manejadorBtnSecundario={() => setModal((x) => ({ ...x, mostrar: false }))}
                mostrarBtnSecundario={eliminar}
                iconoBtnPrincipal={modal.icono}
                iconoBtnSecundario={<CloseIcon />}
                txtBtnSimple={t("txtBtnEliminar")}
                txtBtnSecundario={t("txtBtnCancelar")}
                txtBtnSimpleAlt={t("txtBtnCerrar")} />
        </MenuLayout>
    );
};