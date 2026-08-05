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
import { useOperacionesPacientes, usePacientes } from "../../hooks";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";


/**
 * Página para ver la lista de pacientes.
 * @returns {JSX.Element}
 */
export default function VerPacientesPage() {
    const navigate = useNavigate();
    const { eliminarPacientes } = useOperacionesPacientes();
    const { error, manejadorCargaPacientes, pacientes } = usePacientes();
    const { t } = useTranslation();
    const [cargando, setCargando] = useState(false);
    const [modalEliminacion, setModalEliminacion] = useState(false);
    const [modalError, setModalError] = useState({ mostrar: false, texto: "" });
    const [pacientesSeleccionados, setPacientesSeleccionados] = useState([]);
    const [instancia, setInstancia] = useState(null);
    const listadoPestanas = [{ texto: t("titListaPacientes"), url: "/pacientes" }];
    const mostrarPantallaCarga = cargando || !pacientes;

    useEffect(() => {
        document.title = t("titListaPacientes");
    }, [t]);
    
    useEffect(() => {
        if (error) {
            setModalError({ mostrar: true, texto: error });
        }
    }, [error]);

    async function manejadorBtnRecargar() {
        setCargando(true);
        setModalEliminacion(false);
        setModalError((x) => ({ ...x, mostrar: false }));
        setPacientesSeleccionados([]);
        setInstancia(null);
        await manejadorCargaPacientes();
        setCargando(false);
    };

    /**
     * @param {Paciente} paciente Instancia de paciente
     * @param {Event} e Evento del clic. 
     */
    const manejadorBtnEditarFila = useCallback((paciente, e) => {
        e.stopPropagation();
        navigate(`/pacientes/${paciente.id}/editar`);
    }, [navigate]);

    /**
     * @param {Array<Paciente>} pacientes Lista de pacientes seleccionados.
     */
    function manejadorBtnEliminar(pacientes) {
        setPacientesSeleccionados(pacientes.map((x) => x.id));
        setModalEliminacion(true);
    };

    /**
     * @param {Paciente} paciente Instancia de paciente
     * @param {Event} e Evento del clic. 
     */
    const manejadorBtnEliminarFila = useCallback((paciente, e) => {
        e.stopPropagation();
        setInstancia(paciente.id);
        setModalEliminacion(true);
    }, [setInstancia, setModalEliminacion]);

    async function manejadorBtnModalEliminacion() {
        setModalEliminacion(false);
        setCargando(true);
        const idsPacientes = instancia ? instancia : pacientesSeleccionados;
        const { success, error } = await eliminarPacientes(idsPacientes);
        if (!success) {
            setModalError({ mostrar: true, texto: error });
            setCargando(false);
        } else {
            await manejadorBtnRecargar();
        }
    };

    const campos = useMemo(() => [
        { id: "cedula", label: t("txtCedula"), componente: null, ordenable: true },
        { id: "nombre", label: t("txtNombre"), componente: null, ordenable: true },
        { id: "sexo", label: t("txtCampoSexo"), componente: (x) => <ChipSexo valor={x.sexo} />, ordenable: true },
        { id: "edad", label: t("txtCampoEdad"), componente: null, ordenable: true },
        { id: "telefono", label: t("txtTelefono"), componente: null, ordenable: true },
        { id: "accion", label: t("txtAccion"), componente: (x) => (
            <BotoneraTabla instancia={x} botones={[
                {
                    id: "editar", color: "primary", icono: <EditIcon />,
                    txtAyuda: "txtAyudaBtnEditarPaciente", manejadorClic: manejadorBtnEditarFila
                },
                {
                    id: "eliminar", color: "error", icono: <DeleteIcon />,
                    txtAyuda: "txtAyudaEliminarPaciente", manejadorClic: manejadorBtnEliminarFila
                }
            ]} />
        )}
    ], [t, manejadorBtnEditarFila, manejadorBtnEliminarFila]);

    return (
        <MenuLayout>
            {mostrarPantallaCarga ? <PantallaCarga /> :
                (<>
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
                                    onClick={() => navigate("/pacientes/añadir")}
                                    sx={{ textTransform: "none" }}
                                    startIcon={<AddIcon />}>
                                    <b>{t("txtBtnAnadirPaciente")}</b>
                                </Button>
                            </Tooltip>
                        </Grid>
                        <Datatable
                            activarBusqueda
                            activarSeleccion
                            datos={pacientes}
                            campos={campos}
                            campoId="id"
                            lblBusqueda={t("txtBusqPaciente")}
                            lblSeleccion={t("txtSufijoPacientesSelecs")}
                            tooltipBtnAccion={t("txtAyudaBtnEliminarPacientes")}
                            camposBusqueda={["nombre", "cedula", "id"]}
                            campoOrdenInicial="cedula"
                            direccionOrdenInicial="desc"
                            callbackClicCelda={(x) => navigate(`/pacientes/${x.id}`)}
                            callbackBtnAccion={manejadorBtnEliminar}
                            icono={<DeleteIcon />} />
                    </Grid>
                </>)}
            <ModalSimple
                mostrar={modalError.mostrar}
                titulo={t("tituloErr")}
                texto={t(modalError.texto)}
                txtBtn={t("txtBtnCerrar")}
                manejadorBtn={() => setModalError((x) => ({ ...x, mostrar: false }))}
                iconoBtn={<CloseIcon />} />
            <ModalDoble
                mostrar={modalEliminacion}
                titulo={t("titAlerta")}
                texto={t("txtEliminarPacientes")}
                txtBtnPrincipal={t("txtBtnEliminar")}
                txtBtnSecundario={t("txtBtnCancelar")}
                manejadorBtnPrincipal={manejadorBtnModalEliminacion}
                manejadorBtnSecundario={() => setModalEliminacion(false)}
                iconoBtnPrincipal={<DeleteIcon />}
                iconoBtnSecundario={<CloseIcon />} />
        </MenuLayout>
    );
};