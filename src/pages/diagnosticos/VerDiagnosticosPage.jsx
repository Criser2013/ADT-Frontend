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
import { BtnTabla } from "../../components/datatable";
import { Grid, Box, CircularProgress, Tooltip, IconButton, Button, Typography } from "@mui/material";
import { Check } from "../../components/tabs";
import { ChipDiagnostico, ChipSexo, ChipValidado } from "../../components/tabs/Chips";
import { descargarArchivoXlsx } from "../../utils/XlsxFiles";
import { detTxtDiagnostico, nombresCampos } from "../../utils/TratarDatos";
import { MenuLayout, TabHeader, PantallaCarga } from "../../components/layout";
import { ModalDoble, ModalSimple } from "../../components/modals";
import { useAuth, useDiagnosticos, useIdioma, useOperacionesDiagnosticos } from "../../hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Timestamp } from "firebase/firestore";
import { Diagnostico } from '../../models';


/**
 * Página para ver los diagnósticos del usuario.
 * @returns {JSX.Element}
 */
export default function VerDiagnosticosPage() {
    const { idioma } = useIdioma();
    const { usuario } = useAuth();
    const { t } = useTranslation();
    const { eliminarDiagnosticos, validarDiagnostico } = useOperacionesDiagnosticos();
    const { error, diagnosticos, manejadorCargaDiagnosticos, personas } = useDiagnosticos(
        usuario?.rolVisible, usuario?.uid, Timestamp.now(), true
    );

    const navigate = useNavigate();
    const [procesando, setProcesando] = useState(true);
    const [modalValidacion, setModalValidacion] = useState(false);
    const [modalEliminacion, setModalEliminacion] = useState(false);
    const [modalExportacion, setModalExportacion] = useState(false);
    const [modalError, setModalError] = useState({ mostrar: false, texto: "" });

    const [seleccionados, setSeleccionados] = useState([]);
    const [instancia, setInstancia] = useState(null);
    const [modoModal, setModoModal] = useState(0);
    const [tipoArchivo, setTipoArchivo] = useState("xlsx");
    const [preprocesar, setPreprocesar] = useState(false);
    const [guardarDrive, setGuardarDrive] = useState(false);

    const mostrarPantallaCarga = procesando || !diagnosticos || !personas;

    const campos = useMemo(() => {
        const aux = [
            { id: "id", label: "ID", componente: null, ordenable: true },
            { id: "nombre", label: usuario?.rolVisible ? t("txtMedico") : t("txtPaciente"), componente: null, ordenable: true }
        ];
        const aux2 = [
            { id: "fecha", label: t("txtFecha"), componente: (x) => dayjs(x.fecha).format(t("formatoFechaHoraResumida")), ordenable: true },
            { id: "edad", label: t("txtCampoEdad"), componente: null, ordenable: true },
            { id: "sexo", label: t("txtCampoSexo"), componente: (x) => <ChipSexo valor={x.sexo} />, ordenable: true },
            { id: "diagnostico", label: t("txtCampoDiagModelo"), componente: (x) => <ChipDiagnostico valor={x.diagnostico} />, ordenable: true },
            { id: "validado", label: t("txtCampoDiagMedico"), componente: (x) => <ChipValidado valor={x.validado} />, ordenable: true },
            {
                id: "accion", label: t("txtAccion"),
                componente: usuario?.rolVisible ? 
                (x) => <BtnTabla instancia={x} manejadorBtn={manejadorBtnValidarTabla} txtAyuda="txtAyudaValidar" icono={<CheckCircleOutlineIcon />} /> : 
                (x) => <BtnTabla instancia={x} manejadorBtn={manejadorBtnEliminarTabla} txtAyuda="txtAyudaEliminarDiag" color="error" icono={<DeleteIcon />} />, 
                ordenable: false
            }
        ];
        if (!usuario?.rolVisible) {
            aux.push({ id: "paciente", label: t("txtCedula"), componente: null, ordenable: true });
        }
        return aux.concat(aux2);
    }, [usuario?.rolVisible, t]);
    const listadoPestanas = [
        { texto: usuario?.rolVisible ? t("txtDatosRecolectados") : t("txtHistorialDiagnosticos"), url: "/diagnosticos" }
    ];
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
        const aux = diagnosticos ? diagnosticos.filter((x) => !x.validado) : [];
        return aux.length;
    }, [diagnosticos]);
    /*const desactivarBtnModal = useMemo(() => {
        return (diagnosticos != null && cantNoConfirmados == diagnosticos.length) && modoModal == 3 && preprocesar;
    }, [diagnosticos, cantNoConfirmados, modoModal, preprocesar]);*/

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
        setSeleccionados([]);
        await manejadorCargaDiagnosticos(
            usuario?.rolVisible, usuario?.uid, Timestamp.now()
        );
        setProcesando(false);
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
            const campos = admin ? "medico" : "paciente";
            const persona = aux[auxDiag[i][campos]];
            const nombre = (admin && persona == undefined) ? t("txtUsuario") : t("txtPaciente");
            if (!admin) {
                auxDiag[i].paciente = (persona != undefined) ? persona.cedula : "N/A";
            }


            auxDiag[i].nombre = (persona != undefined) ? persona.nombre : `${nombre} ${t("txtEliminado")}`;
            auxDiag[i].diagnostico = detTxtDiagnostico(auxDiag[i].diagnostico, navegacion.idioma);
            auxDiag[i].fecha = auxDiag[i].fecha.toDate();
            auxDiag[i].validado = detTxtDiagnostico(auxDiag[i].validado, navegacion.idioma);

            delete auxDiag[i].medico;
        }

        return auxDiag;
    };

    /**
     * @param {Array<Diagnostico>} diagnosticos Lista de diagnósticos seleccionados.
     */
    function manejadorBtnEliminar(diagnosticos) {
        setSeleccionados(diagnosticos.map((x) => x.id));
        setModalEliminacion(true);
    };

    /**
     * @param {Array<String>} diagnosticos Lista IDs de los diagnósticos a eliminar.
     */
    async function manejadorBtnModalEliminacion(diagnosticos) {
        setModaleliminacion(false);
        setProcesando(true);
        await eliminarDiagnosticos(diagnosticos);
        setSeleccionados([]);
    };

    /**
     * @param {Diagnostico} diagnostico Instancia del diagnóstico a eliminar.
     */
    function manejadorBtnEliminarTabla(diagnostico) {
        setInstancia(diagnostico);
        setModalEliminacion(true);
    };

    /**
     * @param {Diagnostico} diagnostico Instancia del diagnóstico a validar.
     */
    function manejadorBtnValidarTabla(diagnostico) {
        setInstancia(diagnostico);
        setModalValidacion(true);
    };

    /**
     * @param {Boolean} diagnosticoMedico Valor de validación del diagnóstico.
     */
    async function manejadorBtnValidar({ diagnosticoMedico }) {
        setModalValidacion(false);
        setProcesando(true);
        const { success } = await validarDiagnostico(instancia, diagnosticoMedico);
        if (success) {
            await manejadorCargaDiagnosticos(usuario?.rolVisible, usuario?.uid, Timestamp.now());
        }
        setProcesando(false);
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
            setModal({
                mostrar: true, titulo: t("tituloErr"), icono: <CloseIcon />,
                mensaje: `${t("errExportar")} ${res.error}.`
            });
        }
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
            // formulario de validacion
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
                                        onClick={manejadorBtnExportar}
                                        disabled={diagnosticos?.length == 0}
                                        sx={{ textTransform: "none" }}
                                        startIcon={usuario?.rolVisible ? <AddToDriveIcon /> : <FileDownloadIcon />}>
                                        <b>{t("txtBtnExportar")}</b>
                                    </Button>
                                </span>
                            </Tooltip>
                        </Grid>
                        <Datatable
                            datos={datos}
                            campos={campos}
                            campoId="id"
                            lblBusqueda={usuario?.rolVisible ? t("txtBusqDiagAdmin") : t("txtBusqDiag")}
                            lblSeleccion={t("txtSufijoDiagsSelecs")}
                            tooltipAccion={t("txtAyudaEliminarDiags")}
                            activarBusqueda
                            activarSeleccion={usuario?.rolVisible}
                            camposBusq={usuario?.rolVisible ? ["id", "nombre"] : ["id", "nombre", "paciente"]}
                            campoOrdenInicial="fecha"
                            direccionOrdenInicial="desc"
                            callbackClicCelda={(x) => navigate(`/diagnosticos/${x.id}-${x.usuario}`)}
                            callbackBtnbAccion={manejadorBtnEliminar}
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
                txtBtnPrincipal={t("txtBtnEliminar")}
                txtBtnSecundario={t("txtBtnCancelar")}
                manejadorBtnPrincipal={manejadorBtnEliminar}
                manejadorBtnSecundario={() => setModalEliminacion(false)}
                iconoBtnPrincipal={<DeleteIcon />}
                iconoBtnSecundario={<CloseIcon />} />
            <ModalDoble
                mostrar={modalExportacion}
                titulo={t("titExportar")}
                txtBtnPrincipal={t("txtBtnExportar")}
                txtBtnSecundario={t("txtBtnCancelar")}
                manejadorBtnPrincipal={exportarDiagnosticos}
                manejadorBtnSecundario={() => setModalExportacion(false)}
                iconoBtnPrincipal={<FileDownloadIcon />}
                iconoBtnSecundario={<CloseIcon />} >
                <CuerpoModal />
            </ModalDoble>
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