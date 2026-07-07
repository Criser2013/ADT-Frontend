import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuLayout from "../../components/layout/MenuLayout";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Button, Grid, Box, CircularProgress, Tooltip, IconButton } from "@mui/material";
import { ChipSexo } from "../../components/tabs/Chips";
import Datatable from "../../components/Datatable/Datatable";
import { ModalDoble, ModalSimple } from "../../components/modals";
import { TabHeader } from "../../components/layout";
import { useAuth, useIdioma } from "../../hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";


/**
 * Página para ver la lista de pacientes.
 * @returns {JSX.Element}
 */
export default function VerPacientesPage() {
    const navigate = useNavigate();
    const { datosHelper } = useAuth();
    const { idioma } = useIdioma();
    const { t } = useTranslation();    
    const [cargando, setCargando] = useState(true);
    const [datos, setDatos] = useState([]);
    const [modalEliminacion, setModalEliminacion] = useState({
        mostrar: false, titulo: "", texto: ""
    });
    const [modalError, setModalError] = useState({ mostrar: false, texto: "" });
    const [pacientesSeleccionados, setPacientesSeleccionados] = useState([]);
    const campos = useMemo(() => [
        { id: "cedula", label: t("txtCedula"), componente: null, ordenable: true},
        { id: "nombre", label: t("txtNombre"), componente: null, ordenable: true},
        { id: "sexo", label: t("txtCampoSexo"), componente: (x) => <ChipSexo sexo={x.sexo} />, ordenable: true},
        { id: "edad", label: t("txtCampoEdad"), componente: null, ordenable: true},
        { id: "telefono", label: t("txtTelefono"), componente: null, ordenable: true},
    ], [t]);
    const listadoPestanas = [{ texto: t("titListaPacientes"), url: "/pacientes" }];

    useEffect(() => {
        document.title = t("titListaPacientes");
    }, [idioma, t]);

    useEffect(() => {
        cargarDatos();
        return () => {
            datosHelper.cancelarPeticiones();
        };
    }, [datosHelper, cargarDatos]);


    async function manejadorBtnRecargar() {
        setCargando(true);
        setModalEliminacion(false);
        setPacientesSeleccionados([]);
        await cargarDatos();
    };

    const cargarDatos = useCallback(async () => {
        const res = await datosHelper.descargarArchivoPacientes();
        if (!res.success) {
            setModalError({ mostrar: true, texto: res.error });
        } else {
            setDatos(datosHelper.pacientes);
        }

        setCargando(false);
    }, [datosHelper, setModalError, setDatos, setCargando]);

    function manejadorBtnAnadir() {
        navigate("/pacientes/anadir");
    };

    /**
     * @param {Array<Paciente>} pacientes Lista de pacientes seleccionados.
     */
    function manejadorBtnEliminar(pacientes) {
        setPacientesSeleccionados(pacientes.map((x) => x.id));
        setModalEliminacion({
            mostrar: true, titulo: t("titAlerta"),
            texto: t("txtEliminarPacientes")
        });
    };

    /**
     * @param {Paciente} paciente Objeto del paciente
     */
    function manejadorClicCelda(paciente) {
        navigate(`/pacientes/ver-paciente?id=${paciente.id}`);
    };

    async function manejadorBtnModalEliminacion() {
        cerrarModalEliminacion();
        setCargando(true);
        await eliminarPacientes(pacientesSeleccionados);
    };

    /**
     * @param {Array<String>} idsPacientes Arreglo con los IDs de pacientes a eliminar.
     */
    async function eliminarPacientes(idsPacientes) {
        const res = await datosHelper.operacionSobreArchivo("eliminar", { idPacientes: idsPacientes });
        if (!res.success) {
            setModalError({ mostrar: true, texto: res.error });
        } else {
            setPacientesSeleccionados([]);
        }
        setCargando(false);
    };

    function cerrarModalEliminacion() {
        setModalEliminacion({ ...modalEliminacion, mostrar: false });
    };

    function cerrarModalError() {
        setModalError({ ...modalError, mostrar: false });
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
                        url="/pacientes"
                        titulo={t("titListaPacientes")}
                        pestanas={listadoPestanas}
                        activarBtnAtras={true} />
                    <Grid container columns={1} spacing={3} sx={{ marginTop: "3vh" }}>
                        <Grid
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            size={1} >
                            <Tooltip title={t("txtAyudaBtnRecargar")}>
                                <IconButton onClick={manejadorBtnRecargar}>
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
                            datos={datos}
                            campos={campos}
                            campoId="id"
                            lblBusqueda={t("txtBusqPaciente")}
                            lblSeleccion={t("txtSufijoPacientesSelecs")}
                            tooltipBtnAccion={t("txtAyudaBtnEliminarPacientes")}
                            activarBusqueda={true}
                            activarSeleccion={true}
                            camposBusqueda={["nombre", "cedula"]}
                            campoOrdenInicial="cedula"
                            direccionOrdenInicial="desc"                            
                            callbackClicCelda={manejadorClicCelda}
                            callbackBtnAccion={manejadorBtnEliminar}
                            icono={<DeleteIcon />} />
                    </Grid>
                </>)}
            <ModalSimple
                mostrar={modalError.mostrar}
                titulo={t("tituloErr")}
                texto={modalError.texto}
                txtBtn={t("txtBtnCerrar")}
                manejadorBtn={cerrarModalError}
                iconoBtn={<CloseIcon />} />
            <ModalDoble
                mostrar={modalError.mostrar}
                titulo={modalError.titulo}
                texto={modalError.texto}
                txtBtnPrincipal={t("txtBtnEliminar")}
                txtBtnSecundario={t("txtBtnCancelar")}
                manejadorBtnPrincipal={manejadorBtnModalEliminacion}
                manejadorBtnSecundario={cerrarModalEliminacion}
                iconoBtnPrincipal={<DeleteIcon />}
                iconoBtnSecundario={<CloseIcon />} />
        </MenuLayout>
    );
};