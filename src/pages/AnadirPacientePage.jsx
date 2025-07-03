import { Box, CircularProgress } from "@mui/material";
import { useDrive } from "../contexts/DriveContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavegacion } from "../contexts/NavegacionContext";
import { useEffect, useState } from "react";
import FormAnadirPaciente from "../components/tabs/FormAnadirPaciente";
import TabHeader from "../components/tabs/TabHeader";
import MenuLayout from "../components/layout/MenuLayout";
import { detTamCarga } from "../utils/Responsividad";

/**
 * Página para añadir un nuevo paciente al sistema.
 * @returns JSX.Element
 */
export default function AnadirPacientePage() {
    const auth = useAuth();
    const drive = useDrive();
    const navegacion = useNavegacion();
    const [cargando, setCargando] = useState(true);
    const listadoPestanas = [
        { texto: "Lista de pacientes", url: "/pacientes" },
        { texto: "Añadir paciente", url: "/pacientes/anadir" }
    ];

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
        setCargando(drive.descargando);
    }, [drive.descargando]);

    /**
     * Coloca el título de la página.
     */
    useEffect(() => {
        document.title = "Añadir paciente";
    }, []);

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
                        titulo="Añadir paciente"
                        pestanas={listadoPestanas}
                        tooltip="Volver a la pestaña de pacientes" />
                    <FormAnadirPaciente
                        listadoPestanas={listadoPestanas}
                        esAnadir={true}
                        setCargando={setCargando}
                    />
                </>
            )}
        </MenuLayout>
    );
};