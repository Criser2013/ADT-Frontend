import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';

import { AdvertenciaEspacio } from "../../components/menu";
import { BtnTabla, Datatable } from "../../components/datatable";
import { Grid, Box, CircularProgress, Tooltip, IconButton, Button, Typography } from "@mui/material";
import { Check } from "../../components/tabs";
import { ChipDiagnostico, ChipSexo, ChipValidado } from "../../components/tabs/Chips";
import { FormExportacion, FormValidacion } from "../../components/forms";
import { MenuLayout, TabHeader, PantallaCarga } from "../../components/layout";
import { ModalDoble, ModalSimple } from "../../components/modals";
import { useAuth, useDiagnosticos, useOperacionesDiagnosticos } from "../../hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Diagnostico } from '../../models';


function detTextoPersona(rol, nombre) {
    if (rol == "paciente" && nombre == "null") {
        return ["txtPaciente", "txtEliminado"];
    } else if (rol == "paciente" && nombre == "anonimo") {
        return ["txtPaciente", "txtAnonimo"];
    } else if (rol == "usuario" && nombre == "eliminado") {
        return ["txtUsuario", "txtEliminado"];
    } else {
        return [nombre];
    }
};

/**
 * Página para ver los diagnósticos del usuario.
 * @returns {JSX.Element}
 */
export default function VerDiagnosticosPage() {
    const { usuario } = useAuth();
    const { t } = useTranslation();
    const { eliminarDiagnosticos, validarDiagnostico } = useOperacionesDiagnosticos();
    const { cantDiagnosticosNoValidados, error, diagnosticos, mapeoDiagnosticos, manejadorCargaDiagnosticos } = useDiagnosticos(
        usuario?.rolVisible, usuario?.uid, null, true
    );

    const navigate = useNavigate();
    const [procesando, setProcesando] = useState(false);
    const [diagnosticosSeleccionados, setDiagnosticosSeleccionados] = useState([]);
    const [modalValidacion, setModalValidacion] = useState(false);
    const [modalEliminacion, setModalEliminacion] = useState(false);
    const [modalExportacion, setModalExportacion] = useState(false);
    const [modalError, setModalError] = useState({ mostrar: false, texto: "" });

    const [instancia, setInstancia] = useState(null);

    const mostrarPantallaCarga = procesando || (!diagnosticos || mapeoDiagnosticos == {});
    const listadoPestanas = [
        { texto: usuario?.rolVisible ? t("txtDatosRecolectados") : t("txtHistorialDiagnosticos"), url: "/diagnosticos" }
    ];

    useEffect(() => {
        document.title = usuario?.rolVisible ? t("txtDatosRecolectados") : t("txtHistorialDiagnosticos");
    }, [usuario?.rolVisible, t]);

    useEffect(() => {
        if (error) {
            setModalError({ mostrar: true, texto: error });
        }
    }, [error]);

    async function manejadorBtnRecargar() {
        setProcesando(true);
        await manejadorCargaDiagnosticos(
            usuario?.rolVisible, usuario?.uid, null
        );
        setDiagnosticosSeleccionados([]);
        setProcesando(false);
    };

    async function manejadorBtnModalEliminacion() {
        setModalEliminacion(false);
        setProcesando(true);
        if (Array.isArray(diagnosticosSeleccionados)) {
            await eliminarDiagnosticos(diagnosticosSeleccionados);
            setDiagnosticosSeleccionados([]);
        } else {
            await eliminarDiagnosticos(instancia);
        }
        await manejadorCargaDiagnosticos(
            usuario?.rolVisible, usuario?.uid, null
        );
        setInstancia(null);
        setProcesando(false);
    };

    /**
     * @param {Array<Diagnostico>} diagnosticos Instancias de los diagnósticos a eliminar.
     */
    function manejadorBtnEliminar(diagnosticos) {
        setDiagnosticosSeleccionados(diagnosticos.map((x) => x.id));
        setModalEliminacion(true);
    };

    /**
     * @param {Diagnostico} diagnostico Instancia del diagnóstico a eliminar.
     * @param {Event} e Evento del clic.
     */
    const manejadorBtnEliminarFila = useCallback((diagnostico, e) => {
        e.stopPropagation();
        setInstancia(diagnostico.id);
        setModalEliminacion(true);
    }, []);

    /**
     * @param {Diagnostico} diagnostico Instancia del diagnóstico a validar.
     * @param {Event} e Evento del clic.
     */
    const manejadorBtnValidarFila = useCallback((diagnostico, e) => {
        e.stopPropagation();
        setInstancia(mapeoDiagnosticos[diagnostico.id]);
        setModalValidacion(true);
    }, [mapeoDiagnosticos]);

    /**
     * @param {Boolean} diagnosticoMedico Valor de validación del diagnóstico.
     */
    async function manejadorBtnValidar({ diagnosticoMedico }) {
        setModalValidacion(false);
        setProcesando(true);
        const { success } = await validarDiagnostico(instancia, diagnosticoMedico);
        if (success) {
            await manejadorCargaDiagnosticos(usuario?.rolVisible, usuario?.uid, null);
        }
        setProcesando(false);
    };

    const campos = useMemo(() => {
        const campoNombre = usuario?.rolVisible ? "usuario" : "paciente";
        const titulo = usuario?.rolVisible ? t("txtUsuario") : t("txtPaciente");

        const aux = [
            { id: "id", label: "ID", componente: (x) => usuario?.rolVisible ? x.id : x.id.replace(/-\w{28}$/, ""), ordenable: true },
            { id: campoNombre, label: titulo, componente: (x) => detTextoPersona(campoNombre, x[campoNombre]).map((y) => t(y)).join(" "), ordenable: true }
        ];
        const aux2 = [
            { id: "fecha", label: t("txtFecha"), componente: (x) => dayjs(x.fecha).format(t("formatoFechaHoraResumida")), ordenable: true },
            { id: "edad", label: t("edad"), componente: null, ordenable: true },
            { id: "sexo", label: t("txtCampoSexo"), componente: (x) => <ChipSexo valor={x.sexo} />, ordenable: true },
            { id: "diagnostico", label: t("txtCampoDiagModelo"), componente: (x) => <ChipDiagnostico valor={x.diagnosticoModelo} />, ordenable: true },
            { id: "validado", label: t("txtCampoDiagMedico"), componente: (x) => <ChipValidado valor={x.diagnosticoMedico} />, ordenable: true },
        ];

        if (!usuario?.rolVisible) {
            aux.push({ id: "cedula", label: t("txtCedula"), componente: null, ordenable: true });
            if (cantDiagnosticosNoValidados > 0) {
                aux2.push({
                    id: "accion", label: t("txtAccion"), componente: 
                    (x) => x.validado ? null : <BtnTabla instancia={x} manejadorBtn={manejadorBtnValidarFila} txtAyuda="txtAyudaValidar" icono={<CheckCircleOutlineIcon />} />,
                    ordenable: false
                });
            }
        } else {
            aux.push({
                id: "accion", label: t("txtAccion"), componente:
                (x) => <BtnTabla instancia={x} manejadorBtn={manejadorBtnEliminarFila} txtAyuda="txtAyudaEliminarDiag" color="error" icono={<DeleteIcon />} />,
                ordenable: false
            });
        }

        return aux.concat(aux2);
    }, [usuario?.rolVisible, t, manejadorBtnValidarFila, manejadorBtnEliminarFila, cantDiagnosticosNoValidados]);

    return (
        <MenuLayout>
            {mostrarPantallaCarga ? <PantallaCarga /> : (
                <>
                    <TabHeader
                        titulo={usuario?.rolVisible ? t("txtHistorialDiagnosticos") : t("txtDatosRecolectados")}
                        pestanas={listadoPestanas}
                        activarBtnAtras={false} />
                    <Grid container columns={1} spacing={3} sx={{ marginTop: "3vh" }}>
                        <AdvertenciaEspacio numDiagnosticos={diagnosticos?.length} />
                        <Grid size={1} display="flex" justifyContent="space-between" alignItems="center">
                            <Tooltip title={t("txtAyudaBtnRecargar")}>
                                <IconButton onClick={manejadorBtnRecargar}>
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={usuario?.rolVisible ? t("txtAyudaBtnExportarAdmin") : t("txtAyudaBtnExportar")}>
                                <span>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => setModalExportacion(true)}
                                        disabled={diagnosticos?.length == 0}
                                        sx={{ textTransform: "none" }}
                                        startIcon={usuario?.rolVisible ? <AddToDriveIcon /> : <FileDownloadIcon />}>
                                        <b>{t("txtBtnExportar")}</b>
                                    </Button>
                                </span>
                            </Tooltip>
                        </Grid>
                        <Datatable
                            datos={diagnosticos}
                            campos={campos}
                            campoId="id"
                            lblBusqueda={usuario?.rolVisible ? t("txtBusqDiagAdmin") : t("txtBusqDiag")}
                            lblSeleccion={t("txtSufijoDiagsSelecs")}
                            tooltipAccion={t("txtAyudaEliminarDiags")}
                            activarBusqueda
                            activarSeleccion={usuario?.rolVisible}
                            camposBusqueda={usuario?.rolVisible ? ["id", "usuario"] : ["id", "cedula", "paciente"]}
                            campoOrdenInicial="fecha"
                            direccionOrdenInicial="asc"
                            callbackClicCelda={(x) => navigate(`/diagnosticos/${x.id}`)}
                            callbackBtnAccion={manejadorBtnEliminar}
                            icono={<DeleteIcon />} />
                    </Grid>
                </>)}
            <FormValidacion
                mostrar={modalValidacion}
                manejadorBtn={manejadorBtnValidar}
                manejadorCierre={() => setModalValidacion(false)} />
            <ModalDoble
                mostrar={modalEliminacion}
                titulo={t("titAlerta")}
                texto={t("txtConfirmacionEliminarDiags")}
                txtBtnPrincipal={t("txtBtnEliminar")}
                txtBtnSecundario={t("txtBtnCancelar")}
                manejadorBtnPrincipal={manejadorBtnModalEliminacion}
                manejadorBtnSecundario={() => setModalEliminacion(false)}
                iconoBtnPrincipal={<DeleteIcon />}
                iconoBtnSecundario={<CloseIcon />} />
            <FormExportacion
                mostrar={modalExportacion}
                diagnosticos={diagnosticos}
                manejadorCierre={() => setModalExportacion(false)} />
            <ModalSimple
                mostrar={modalError.mostrar}
                titulo={t("titErr")}
                texto={t(modalError.texto)}
                txtBtn={t("txtBtnCerrar")}
                manejadorBtn={() => setModalError((X) => ({ ...X, mostrar: false }))}
                iconoBtn={<CloseIcon />} />
        </MenuLayout>
    );
};