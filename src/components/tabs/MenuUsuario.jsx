import { Grid, Box, CircularProgress } from "@mui/material";
import { useMemo, useState, useEffect } from "react";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { useDrive } from "../../contexts/DriveContext";
import { detTamCarga } from "../../utils/funcionesUtiles";
import { useAuth } from "../../contexts/AuthContext";

export default function MenuUsuario() {
    const auth = useAuth();
    const navegacion = useNavegacion();
    const drive = useDrive();
    const [cargando, setCargando] = useState(true);
    const numCols = useMemo(() => {
        return navegacion.dispositivoMovil || (!navegacion.dispositivoMovil && (navegacion.ancho < 500)) ? 1 : 2;
    }, [navegacion.dispositivoMovil, navegacion.ancho]);
    const width = useMemo(() => {
        return detTamCarga(navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho);
    }, [navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho]);


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
     * Coloca el título de la página.
     */
    useEffect(() => {
        document.title = "Menú principal - HADT";

        if (drive.datos != null && !drive.descargando) {
            //cargarDatos();
        }
    }, []);

    /**
     * Quita la pantalla de carga cuando se haya descargado el archivo de pacientes.
     */
    useEffect(() => {
        setCargando(drive.descargando);
    }, [drive.descargando]);

    /**
     * Actualiza los datos de la tabla cuando cambian los datos de Drive.
     */
    useEffect(() => {
        /*setDatos(
            drive.datos != null ?
                formatearCeldas(
                    drive.datos.map((x) => ({ ...x }))
                ) : []
        );*/
    }, [drive.datos]);

    /**
     * Carga los datos de los pacientes desde Drive.
     */
    /*const cargarDatos = async () => {
        const res = await drive.cargarDatos();
        if (!res.success) {
            setModal({
                mostrar: true, mensaje: res.error,
                titulo: "Error al cargar los datos",
            });
        }
    };*/

    return (
        <>
            {cargando ? (
                <Box display="flex" justifyContent="center" alignItems="center" width={width} height="85vh">
                    <CircularProgress />
                </Box>
            ) : (
                <Grid columns={numCols} container spacing={2}>

                </Grid>
            )}
        </>
    );
};