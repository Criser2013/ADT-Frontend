import { Box, Chip, CircularProgress, Grid, Typography, Divider, Stack, Fab, Tooltip } from "@mui/material";
import { useDrive } from "../contexts/DriveContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavegacion } from "../contexts/NavegacionContext";
import { useEffect, useState } from "react";
import TabHeader from "../components/tabs/TabHeader";
import MenuLayout from "../components/layout/MenuLayout";
import { detTamCarga } from "../utils/Responsividad";
import { useNavigate, useSearchParams } from "react-router";
import { validarNumero } from "../utils/Validadores";
import EditIcon from '@mui/icons-material/Edit';
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';

/**
 * Página para ver los datos de un paciente.
 * @returns JSX.Element
 */
export default function VerPacientePage() {
    const auth = useAuth();
    const drive = useDrive();
    const navegacion = useNavegacion();
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const [cargando, setCargando] = useState(true);
    const [datos, setDatos] = useState({
        personales: {
            nombre: "", cedula: "", sexo: "",
            telefono: "", fechaNacimiento: "",
            edad: ""
        },
        comorbilidades: []
    });
    const campos = [{ titulo: "Nombre", valor: datos.personales.nombre },
    { titulo: "Cédula", valor: datos.personales.cedula },
    { titulo: "Fecha de nacimiento", valor: datos.personales.fechaNacimiento },
    { titulo: "Edad", valor: `${datos.personales.edad} años` },
    { titulo: "Teléfono", valor: datos.personales.telefono },
    { titulo: "Sexo", valor: datos.personales.sexo == 0 ? "Masculino" : "Femenino" }
    ];
    const listadoPestanas = [
        { texto: "Lista de pacientes", url: "/pacientes" },
        { texto: `Paciente-${datos.personales.nombre}`, url: `/pacientes/ver-paciente${location.search}` }
    ];
    const ced = params.get("cedula");

    /**
     * Carga el token de sesión y comienza a descargar el archivo de pacientes.
     */
    useEffect(() => {
        const token = sessionStorage.getItem("session-tokens");
        if (token != null) {
            drive.setToken(JSON.parse(token).accessToken);
        } else if (auth.tokenDrive != null) {
            drive.setToken(auth.tokenDrive);
        }
    }, [auth.tokenDrive]);

    /**
     * Quita la pantalla de carga cuando se haya descargado el archivo de pacientes.
     */
    useEffect(() => {
        if (!drive.descargando) {
            cargarDatosPaciente();
        }

        setCargando(drive.descargando);
    }, [drive.descargando]);

    /**
     * Coloca el título de la página.
     */
    useEffect(() => {
        document.title = `${datos.personales.nombre != "" ? `Paciente — ${datos.personales.nombre}` : "Ver paciente"}`;
        const res = (ced != null && ced != undefined) ? validarNumero(ced) : false;

        if (!res) {
            navigate("/pacientes", { replace: true });
        }
    }, [datos.personales.nombre]);

    /**
     * Carga los datos del paciente a editar.
     */
    const cargarDatosPaciente = () => {
        const res = drive.cargarDatosPaciente(ced);
        if (res.success) {
            dayjs.extend(customParseFormat);
            res.data.personales.edad = dayjs().diff(dayjs(
                res.data.personales.fechaNacimiento, "DD-MM-YYYY"), "year", false
            );
            setDatos(res.data);
        } else {
            navigate("/pacientes", { replace: true });
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
        if (dispositivoMovil && (orientacion == "vertical" || (orientacion == "horizontal" && mostrarMenu))) {
            return 12;
        } else {
            return indice % 2 == 0 ? 7 : 5;
        }
    };

    /**
     * Manejador del botón de editar paciente.
     */
    const manejadorBtnEditar = () => {
        navegacion.setPaginaAnterior(`/pacientes/ver-paciente?cedula=${datos.personales.cedula}`);
        navigate(`/pacientes/editar?cedula=${datos.personales.cedula}`, { replace: true });
    };

    return (
        <>
            <MenuLayout>
                {(cargando || auth.cargando) ? (
                    <Box display="flex" justifyContent="center" alignItems="center" width={detTamCarga(navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho)} height="85vh">
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <TabHeader
                            urlPredet="/pacientes"
                            titulo="Datos del paciente"
                            pestanas={listadoPestanas}
                            tooltip="Volver a la pestaña de pacientes" />
                        <Grid container
                            columns={12}
                            spacing={1}
                            paddingLeft={!navegacion.dispositivoMovil ? "3vh" : "0vh"}
                            paddingRight={!navegacion.dispositivoMovil ? "3vh" : "0vh"}
                            marginTop="3vh">
                            {campos.map((campo, index) => (
                                <Grid key={index} size={detVisualizacion(index)}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="h6">
                                            <b>{campo.titulo}: </b>
                                        </Typography>
                                        <Typography variant="body1">
                                            {campo.valor}
                                        </Typography>
                                    </Stack>
                                </Grid>
                            ))}
                            <Grid size={12}>
                                <Divider />
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="h6">
                                    <b>Condiciones médicas preexistentes</b>
                                </Typography>
                            </Grid>
                            {(datos.comorbilidades.length > 0) ? (
                                <Grid size={12}>
                                    <Box
                                        borderColor="blue"
                                        borderRadius={3}
                                        border={1}
                                        padding="2vh"
                                        style={{ borderColor: "#adadad" }}
                                        sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {datos.comorbilidades.map((comorbilidad) => (
                                            <Chip
                                                key={comorbilidad}
                                                label={comorbilidad}
                                                color="info"
                                                variant="outlined"
                                                size="medium" />
                                        ))}
                                    </Box>
                                </Grid>
                            ) : (
                                <Grid size={5}>
                                    <Typography variant="body1">
                                        <b>No se han registrado comorbilidades.</b>
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                        <Tooltip title="Ve al formulario para editar los datos del paciente">
                            <Fab onClick={manejadorBtnEditar}
                                color="primary"
                                variant="extended"
                                sx={{ textTransform: "none", display: "flex", position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
                                <EditIcon sx={{ mr: 1 }} />
                                <b>Editar</b>
                            </Fab>
                        </Tooltip>
                    </>
                )
                }
            </MenuLayout>
        </>
    );
}