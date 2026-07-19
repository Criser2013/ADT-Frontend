import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Button, Grid, Box, CircularProgress, Tooltip, IconButton } from "@mui/material";
import { ChipSexo } from "../../components/tabs/Chips";
import { Datatable } from "../../components/datatable";
import { MenuLayout, PantallaCarga } from "../../components/layout";
import { ModalDoble, ModalSimple } from "../../components/modals";
import { TabHeader } from "../../components/layout";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePacientes } from "../../hooks";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";


/**
 * Página para ver la lista de pacientes.
 * @returns {JSX.Element}
 */
export default function VerPacientesPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [cargando, setCargando] = useState(true);
    const [modalEliminacion, setModalEliminacion] = useState({
        mostrar: false, titulo: "", texto: ""
    });
    const [modalError, setModalError] = useState({ mostrar: false, texto: "" });
    const [pacientesSeleccionados, setPacientesSeleccionados] = useState([]);
    const { cargarDatos, pacientes, eliminarPacientes, helperListo, cancelarPeticiones } = usePacientes();
    const campos = useMemo(() => [
        { id: "cedula", label: t("txtCedula"), componente: null, ordenable: true },
        { id: "nombre", label: t("txtNombre"), componente: null, ordenable: true },
        { id: "sexo", label: t("txtCampoSexo"), componente: (x) => <ChipSexo sexo={x.sexo} />, ordenable: true },
        { id: "edad", label: t("txtCampoEdad"), componente: null, ordenable: true },
        { id: "telefono", label: t("txtTelefono"), componente: null, ordenable: true },
    ], [t]);
    const listadoPestanas = [{ texto: t("titListaPacientes"), url: "/pacientes" }];

    const manejadorCarga = useCallback(async () => {
        const { success, error, cancelled } = await cargarDatos();
        if (!success && !cancelled) {
            setModalError({ mostrar: true, texto: t(error) });
        }
        if (!cancelled) {
            setCargando(false);
        }
    }, [cargarDatos, setModalError, setCargando, t]);

    async function manejadorBtnRecargar() {
        setCargando(true);
        setModalEliminacion({...modalEliminacion, mostrar: false });
        setModalError({...modalError, mostrar: false });
        setPacientesSeleccionados([]);
        await manejadorCarga();
    };

    function manejadorBtnAnadir() {
        navigate("/pacientes/añadir");
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
        navigate(`/pacientes/${paciente.id}`);
    };

    async function manejadorBtnModalEliminacion() {
        cerrarModalEliminacion();
        setCargando(true);
        await borrarPacientes(pacientesSeleccionados);
    };

    /**
     * @param {Array<String>} idsPacientes Arreglo con los IDs de pacientes a eliminar.
     */
    async function borrarPacientes(idsPacientes) {
        const { success, error } = await eliminarPacientes(idsPacientes);
        if (!success) {
            setModalError({ mostrar: true, texto: t(error) });
            setCargando(false);
        } else {
            setPacientesSeleccionados([]);
            await manejadorCarga();
        }
    };

    function cerrarModalEliminacion() {
        setModalEliminacion({ ...modalEliminacion, mostrar: false });
    };

    function cerrarModalError() {
        setModalError({ ...modalError, mostrar: false });
    };

    useEffect(() => {
        document.title = t("titListaPacientes");
    }, [t]);

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
            {cargando ? (
                <PantallaCarga />
            ) : (
                <>
                    <TabHeader
                        titulo={t("titListaPacientes")}
                        pestanas={listadoPestanas}
                        activarBtnAtras={false} />
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
                            datos={pacientes}
                            campos={campos}
                            campoId="id"
                            lblBusqueda={t("txtBusqPaciente")}
                            lblSeleccion={t("txtSufijoPacientesSelecs")}
                            tooltipBtnAccion={t("txtAyudaBtnEliminarPacientes")}
                            activarBusqueda={true}
                            activarSeleccion={true}
                            camposBusqueda={["nombre", "cedula", "id"]}
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
                mostrar={modalEliminacion.mostrar}
                titulo={modalEliminacion.titulo}
                texto={modalEliminacion.texto}
                txtBtnPrincipal={t("txtBtnEliminar")}
                txtBtnSecundario={t("txtBtnCancelar")}
                manejadorBtnPrincipal={manejadorBtnModalEliminacion}
                manejadorBtnSecundario={cerrarModalEliminacion}
                iconoBtnPrincipal={<DeleteIcon />}
                iconoBtnSecundario={<CloseIcon />} />
        </MenuLayout>
    );
};