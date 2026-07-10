import {
    Box, CircularProgress, Grid, Typography, Divider, Stack, Fab, Tooltip,
    Button, Popover, IconButton
} from "@mui/material";
import { useIdioma, usePacientes } from "../../hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import TabHeader from "../../components/layout/TabHeader";
import MenuLayout from "../../components/layout/MenuLayout";
import { useNavigate, useParams } from "react-router";
import { validarId } from "../../utils/Validadores";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import ModalDoble from "../../components/modals/ModalDoble";
import ContComorbilidades from "../../components/diagnosticos/ContComorbilidades";
import { ChipSexo } from "../../components/tabs/Chips";
import { useTranslation } from "react-i18next";
import { ModalSimple } from "../../components/modals";
import { PopOver } from "../../components/tabs";

/**
 * Página para ver los datos de un paciente.
 * @returns {JSX.Element}
 */
export default function VerPacientePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { idioma } = useIdioma();
    const { t } = useTranslation();
    const [cargando, setCargando] = useState(true);
    const [datos, setDatos] = useState(null);
    const [modalError, setModalError] = useState({ mostrar: false, texto: "" });
    const [modalEliminacion, setModalEliminacion] = useState({
        mostrar: false, texto: "", titulo: ""
    });
    const [popOver, setPopOver] = useState(null);
    const mostrarPopOver = Boolean(popOver);
    const idPopOver = mostrarPopOver ? "simple-popover" : undefined;
    const { verPaciente, eliminarPacientes } = usePacientes(setCargando, setModalError);
    const campos = useMemo(() => [
        { titulo: t("txtNombre"), valor: datos.nombre },
        { titulo: t("txtCedula"), valor: datos.cedula },
        { titulo: t("txtFechaNacimiento"), valor: datos.fechaNacimientoFormateada.format(t("formatoFechaCompletaSinHora")) },
        { titulo: t("txtCampoEdad"), valor: `${datos.edad} ${t("txtSufijoEdad")}` },
        { titulo: t("txtTelefono"), valor: datos.telefono },
        { titulo: t("txtCampoSexo"), valor: datos.sexo == 0 ? t("txtMasculino") : t("txtFemenino") }
    ], [datos, t]);
    const listadoPestanas = [
        { texto: t("titListaPacientes"), url: "/pacientes" },
        { texto: `${t("txtPaciente")}-${datos.nombre}`, url: `/pacientes/ver-paciente${location.search}` }
    ];

    useEffect(() => {
        document.title = `${datos ? `${t("txtPaciente")} — ${datos.nombre}` : t("titVerPaciente")}`;
        const res = id ? validarId(id) : false;

        if (!res) {
            navigate("/pacientes");
        } else {
            cargarPaciente(id);
        }
    }, [idioma, t, datos, id, navigate, cargarPaciente]);

    const cargarPaciente = useCallback(async (id) => {
        const res = await verPaciente(id);
        if (res) {
            setDatos(res);
            setCargando(false);
        } else {
            navigate("/pacientes");
        }
    }, [setDatos, setCargando, navigate, verPaciente]);

    function cerrarModalEliminacion() {
        setModalEliminacion({ ...modalEliminacion, mostrar: false });
    };

    function cerrarModalError() {
        setModalError({ ...modalError, mostrar: false });  
    };

    async function eliminarPaciente() {
        setCargando(true);
        const res = await eliminarPacientes(datos.id);
        if (res) {
            navigate("/pacientes");
        }
    };

    /**
     * Determina el tamaño del elemento dentro de la malla.
     * Si se visualiza desde un dispositivo movil en orientación horizontal y el menú o en escritorio,
     * se ajusta el contenido a 2 columnas, en caso contrario se deja en 1 columna.
     * @param {Int} indice 
     * @returns Int
     */
    const detVisualizacion = (indice) => {
        const { orientacion, mostrarMenu, dispositivoMovil } = navegacion;

        if (indice == 2 && dispositivoMovil && ((orientacion == "horizontal" && mostrarMenu) || orientacion == "vertical")) {
            return 12;
        }
        if (dispositivoMovil && (orientacion == "vertical" || (orientacion == "horizontal" && mostrarMenu))) {
            return 12;
        } else {
            return indice % 2 == 0 ? 7 : 5;
        }
    };

    function manejadorBtnEditar() {
        navigate(`/pacientes/${datos.id}/editar`);
    };

    function manejadorBtnEliminar() {
        setModalEliminacion({
            mostrar: true, titulo: t("titAlerta"),
            texto: t("txtEliminarPaciente")
        });
    };

    async function manejadorBtnModalEliminar() {
        cerrarModalEliminacion();
        await eliminarPaciente();
    };

    /**
     * @param {Event} e 
     */
    function manejadorBtnOpciones(e) {
        setPopOver(e.currentTarget);
    };

    return (
        <>
            <MenuLayout>
                {cargando ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="85vh">
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <TabHeader
                            url="/pacientes"
                            titulo={t("titDatosPaciente")}
                            pestanas={listadoPestanas}
                            tooltip={t("txtAtrasDatosPaciente")}
                            activarBtnAtras={true} />
                        <Grid container
                            columns={12}
                            spacing={1}
                            marginTop="3vh">
                            <Grid size={12} display="flex" justifyContent="end" margin="-2vh 0vw">
                                <Tooltip title={t("txtAyudaMasOpciones")}>
                                    <IconButton aria-describedby={idPopOver} onClick={manejadorBtnOpciones}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </Tooltip>ç
                                <PopOver
                                    id={idPopOver}
                                    mostrar={mostrarPopOver}
                                    anchorEl={popOver}
                                    anchorOrigin={{
                                        vertical: "bottom", horizontal: "left",
                                    }}
                                    transformOrigin={{
                                        vertical: "top", horizontal: "center",
                                    }}
                                    setPopOver={setPopOver}>
                                    <Tooltip title={t("txtAyudaEliminarPaciente")}>
                                        <Button
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={manejadorBtnEliminar}
                                            sx={{ textTransform: "none", padding: 2 }}>
                                            {t("txtBtnEliminar")}
                                        </Button>
                                    </Tooltip>
                                </PopOver>
                            </Grid>
                            {campos.map((campo, index) => (
                                <Grid key={index} size={detVisualizacion(index)}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="body1">
                                            <b>{campo.titulo}: </b>
                                        </Typography>
                                        {(campo.titulo == t("txtCampoSexo")) ? <ChipSexo sexo={campo.valor} /> : (
                                            <Typography variant="body1">
                                                {campo.valor}
                                            </Typography>)}
                                    </Stack>
                                </Grid>
                            ))}
                            <Grid size={12}>
                                <Divider />
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="h6">
                                    <b>{t("titComor")}</b>
                                </Typography>
                            </Grid>
                            {datos.otraEnfermedad ? (
                                <Grid size={12}>
                                    <ContComorbilidades comorbilidades={datos.comorbilidades} />
                                </Grid>
                            ) : (
                                <Grid size={12}>
                                    <Typography variant="body1">
                                        <b>{t("txtNoComor")}</b>
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                        <Tooltip title={t("txtAyudaBtnEditarPaciente")}>
                            <Fab onClick={manejadorBtnEditar}
                                color="primary"
                                variant="extended"
                                sx={{
                                    textTransform: "none",
                                    display: "flex",
                                    position: "fixed",
                                    bottom: 20,
                                    right: 20,
                                    zIndex: 1000 }} >
                                <EditIcon sx={{ mr: 1 }} />
                                <b>{t("txtBtnEditar")}</b>
                            </Fab>
                        </Tooltip>
                    </>
                )}
                <ModalDoble
                    mostrar={modalEliminacion.mostrar}
                    titulo={modalEliminacion.titulo}
                    texto={modalEliminacion.texto}
                    txtBtnPrincipal={t("txtBtnEliminar")}
                    txtBtnSecundario={t("txtBtnCancelar")}
                    manejadorBtnPrincipal={manejadorBtnModalEliminar}
                    manejadorBtnSecundario={cerrarModalEliminacion}
                    iconoBtnPrincipal={<DeleteIcon />}
                    iconoBtnSecundario={<CloseIcon />} />
                <ModalSimple
                    mostrar={modalError.mostrar}
                    titulo={modalError.titulo}
                    texto={modalError.texto}
                    txtBtn={t("txtBtnCerrar")}
                    manejadorBtn={cerrarModalError}
                    iconoBtn={<CloseIcon />} />
            </MenuLayout>
        </>
    );
}