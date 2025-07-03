import { Box, Chip, CircularProgress, Grid, Typography, FormControl, Select, OutlinedInput } from "@mui/material";
import { useDrive } from "../contexts/DriveContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavegacion } from "../contexts/NavegacionContext";
import { useEffect, useState } from "react";
import TabHeader from "../components/tabs/TabHeader";
import MenuLayout from "../components/layout/MenuLayout";
import { detTamCarga } from "../utils/Responsividad";
import { useNavigate, useSearchParams } from "react-router";
import { validarNumero } from "../utils/Validadores";
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
            res.data.personales.edad = dayjs(
                res.data.personales.fechaNacimiento, "DD-MM-YYYY").diff(dayjs(), "year", false
                );
            setDatos(res.data);
        } else {
            navigate("/pacientes", { replace: true });
        }
    };

    return (
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
                    <Grid container columns={4} spacing={2}>
                        <Grid size={1}>
                            <Typography variant="h6">
                                <b>Cédula: </b>
                            </Typography>
                        </Grid>
                        <Grid size={1}>
                            <Typography variant="body1">
                                {datos.personales.cedula}
                            </Typography>
                        </Grid>
                        <Grid size={1}>
                            <Typography variant="h6">
                                <b>Nombre: </b>
                            </Typography>
                        </Grid>
                        <Grid size={1}>
                            <Typography variant="body1">
                                {datos.personales.nombre}
                            </Typography>
                        </Grid>
                        <Grid size={1}>
                            <Typography variant="h6">
                                <b>Edad: </b>
                            </Typography>
                        </Grid>
                        <Grid size={1}>
                            <Typography variant="body1">
                                {datos.personales.edad} años
                            </Typography>
                        </Grid>
                        <Grid size={1}>
                            <Typography variant="h6">
                                <b>Teléfono: </b>
                            </Typography>
                        </Grid>
                        <Grid size={1}>
                            <Typography variant="body1">
                                {datos.personales.telefono}
                            </Typography>
                        </Grid>
                        <Grid size={1}>
                            <Typography variant="h6">
                                <b>Fecha de nacimiento:</b>
                            </Typography>
                        </Grid>
                        <Grid size={1}>
                            <Typography variant="body1">
                                {datos.personales.fechaNacimiento}
                            </Typography>
                        </Grid>
                        <Grid size={4}>
                            <Typography variant="h5">
                                Condiciones médicas preexistentes
                            </Typography>
                        </Grid>
                        {(datos.comorbilidades.length > 0) ? (
                            <Grid size={4}>
                                <Box
                                    borderColor="blue"
                                    borderRadius={3}
                                    border={1}
                                    padding="2vh"
                                    style={{ borderColor: "#adadad" }}
                                    sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {datos.comorbilidades.map((comorbilidad) => (
                                        <Chip
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
                </>
            )
            }
        </MenuLayout >
    );
}