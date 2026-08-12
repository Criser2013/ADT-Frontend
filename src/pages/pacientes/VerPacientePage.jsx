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
import { Paciente } from "../../models";
import { useEffect, useState } from "react";
import { usePaciente, useOperacionesPacientes } from "../../hooks";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";


/**
 * Página para ver los datos de un paciente.
 * @returns {JSX.Element}
 */
export default function VerPacientePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { error, paciente } = usePaciente(id);
    const { t } = useTranslation();
    const [transaccionIniciada, setTransaccionIniciada] = useState(false);
    const [modalError, setModalError] = useState({ mostrar: false, texto: "" });
    const [modalEliminacion, setModalEliminacion] = useState(false);
    const { eliminarPacientes } = useOperacionesPacientes();
    const campos = [
        { id: "nombre", titulo: t("txtNombre"), valor: paciente?.nombre },
        { id: "cedula", titulo: t("txtCedula"), valor: paciente?.cedula },
        {
            id: "fechaNacimiento", titulo: t("txtFechaNacimiento"),
            valor: paciente?.fechaNacimientoFormateada.format(t("formatoFechaCompletaSinHora"))
        },
        { id: "edad", titulo: t("edad"), valor: `${paciente?.edad} ${t("txtSufijoEdad")}` },
        { id: "telefono", titulo: t("txtTelefono"), valor: paciente?.telefono },
        { id: "sexo", titulo: t("txtCampoSexo"), valor: paciente?.sexo }
    ];
    const listadoPestanas = [
        { texto: t("titListaPacientes"), url: "/pacientes" },
        { texto: `${t("txtPaciente")} — ${paciente?.nombre}`, url: `/pacientes/${id}` }
    ];
    const mostrarPantallaCarga = transaccionIniciada || !paciente;

    async function eliminarPaciente() {
        setTransaccionIniciada(true);
        const { success, error } = await eliminarPacientes(paciente.id);
        if (success) {
            navigate("/pacientes");
        } else {
            setModalError({ mostrar: true, texto: t(error) });
            setTransaccionIniciada(false);
        }
    };

    async function manejadorBtnModalEliminar() {
        setModalEliminacion(false);
        await eliminarPaciente();
    };

    useEffect(() => {
        if (error) {
            navigate("/pacientes");
        }
    }, [error, navigate]);

    useEffect(() => {
        document.title = paciente ? `${t("txtPaciente")} — ${paciente?.nombre}` : t("titVerPaciente");
    }, [t, paciente]);

    return (
        <MenuLayout>
            {mostrarPantallaCarga ? <PantallaCarga /> :
                (<>
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
                                <IconButton color="inherit" onClick={() => setModalEliminacion(true)}>
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
                                    {(campo.id == "sexo") ? <ChipSexo valor={campo.valor} /> : (
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
                        {paciente?.otraEnfermedad ? (
                            <Grid size={12}>
                                <ContComorbilidades comorbilidades={paciente?.comorbilidades} />
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
                        manejadorBtn={() => navigate(`/pacientes/${id}/editar`)}
                        icono={<EditIcon />} />
                </>)}
            <ModalDoble
                mostrar={modalEliminacion}
                titulo={t("titAlerta")}
                texto={t("txtEliminarPaciente")}
                txtBtnPrincipal={t("txtBtnEliminar")}
                txtBtnSecundario={t("txtBtnCancelar")}
                manejadorBtnPrincipal={manejadorBtnModalEliminar}
                manejadorBtnSecundario={() => setModalEliminacion(false)}
                iconoBtnPrincipal={<DeleteIcon />}
                iconoBtnSecundario={<CloseIcon />} />
            <ModalSimple
                mostrar={modalError.mostrar}
                titulo={t("tituloErr")}
                texto={modalError.texto}
                txtBtn={t("txtBtnCerrar")}
                manejadorBtn={() => setModalError((x) => ({ ...x, mostrar: false }))}
                iconoBtn={<CloseIcon />} />
        </MenuLayout>
    );
}