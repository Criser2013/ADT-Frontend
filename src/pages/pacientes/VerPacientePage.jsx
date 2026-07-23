import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
    Grid, Typography, Divider, Stack, Tooltip,
    Button, IconButton
} from "@mui/material";
import { ChipSexo } from "../../components/tabs/Chips";
import { ContComorbilidades } from "../../components/diagnosticos";
import { MenuLayout, PantallaCarga, TabHeader } from "../../components/layout";
import { ModalSimple, ModalDoble } from "../../components/modals";
import { BtnFlotante, PopOver } from "../../components/tabs";
import { useCallback, useEffect, useState } from "react";
import { usePacientes } from "../../hooks";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { validarId } from "../../utils/Validadores";
import { Paciente } from "../../models";

/**
 * Página para ver los datos de un paciente.
 * @returns {JSX.Element}
 */
export default function VerPacientePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { t } = useTranslation();
    const [cargando, setCargando] = useState(true);
    const [datos, setDatos] = useState(null);
    const [modalError, setModalError] = useState({ mostrar: false, texto: "" });
    const [modalEliminacion, setModalEliminacion] = useState({
        mostrar: false, texto: "", titulo: ""
    });
    const { verPaciente, eliminarPacientes, helperListo, cancelarPeticiones } = usePacientes();
    const campos = [
        { id: "nombre", titulo: t("txtNombre"), valor: datos?.nombre },
        { id: "cedula", titulo: t("txtCedula"), valor: datos?.cedula },
        {
            id: "fechaNacimiento", titulo: t("txtFechaNacimiento"),
            valor: datos?.fechaNacimientoFormateada.format(t("formatoFechaCompletaSinHora"))
        },
        { id: "edad", titulo: t("txtCampoEdad"), valor: `${datos?.edad} ${t("txtSufijoEdad")}` },
        { id: "telefono", titulo: t("txtTelefono"), valor: datos?.telefono },
        { id: "sexo", titulo: t("txtCampoSexo"), valor: datos?.sexo }
    ];
    const listadoPestanas = [
        { texto: t("titListaPacientes"), url: "/pacientes" },
        { texto: `${t("txtPaciente")} — ${datos?.nombre}`, url: `/pacientes/${id}` }
    ];

    const cargarPaciente = useCallback(async (id) => {
        const res = await verPaciente(id);
        if (res instanceof Paciente) {
            setDatos(res);
            setCargando(false);
        } else {
            if (!res.cancelled) {
                navigate("/pacientes");
            }
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
        const { success, error } = await eliminarPacientes(datos.id);
        if (success) {
            navigate("/pacientes");
        } else {
            setModalError({ mostrar: true, texto: t(error) });
            setCargando(false);
        }
    };

    function manejadorBtnEditar() {
        navigate(`/pacientes/${id}/editar`);
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

    useEffect(() => {
        document.title = datos ? `${t("txtPaciente")} — ${datos?.nombre}` : t("titVerPaciente");
    }, [t, datos]);

    useEffect(() => {
        const res = id ? validarId(id) : false;
        if (!res) {
            navigate("/pacientes");
        }

        if (helperListo) {
            cargarPaciente(id);
            return () => {
                cancelarPeticiones();
            };
        }
    }, [id, navigate, cargarPaciente, helperListo, cancelarPeticiones]);

    return (
        <MenuLayout>
            {cargando ? (
                <PantallaCarga />
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
                            <Tooltip title={t("txtAyudaEliminarPaciente")}>
                                <IconButton color="error" onClick={manejadorBtnEliminar}>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        {campos.map((campo) => (
                            <Grid key={campo.id} size={{ xs: 12, md: 6 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="body1" fontWeight="bold">
                                        {campo.titulo}:
                                    </Typography>
                                    {(campo.id == "sexo") ? <ChipSexo sexo={campo.valor} /> : (
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
                            <Typography variant="h6" fontWeight="bold">
                                {t("titComor")}
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
                    <BtnFlotante
                        txtBtn={t("txtBtnEditar")}
                        txtAyudaBtn={t("txtAyudaBtnEditarPaciente")}
                        manejadorBtn={manejadorBtnEditar}
                        icono={<EditIcon />} />
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
                titulo={t("tituloErr")}
                texto={modalError.texto}
                txtBtn={t("txtBtnCerrar")}
                manejadorBtn={cerrarModalError}
                iconoBtn={<CloseIcon />} />
        </MenuLayout>
    );
}