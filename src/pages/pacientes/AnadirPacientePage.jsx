import { useDrive } from "../../contexts/DriveContext";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";
import FormPaciente from "../../components/forms/FormPaciente";
import MenuLayout from "../../components/layout/MenuLayout";

/**
 * Página para añadir un nuevo paciente al sistema.
 * @returns {JSX.Element}
 */
export default function AnadirPacientePage() {
    const auth = useAuth();
    const drive = useDrive();
    const listadoPestanas = [
        { texto: "Lista de pacientes", url: "/pacientes" },
        { texto: "Añadir paciente", url: "/pacientes/anadir" }
    ];

    /**
     * Carga el token de sesión y comienza a descargar el archivo de pacientes.
     */
    useEffect(() => {
        const token = sessionStorage.getItem("session-tokens");
        if (token != null && drive.token == null) {
            drive.setToken(JSON.parse(token).accessToken);
        } else if (auth.tokenDrive != null) {
            drive.setToken(auth.tokenDrive);
        }
    }, [auth.tokenDrive]);

    /**
     * Coloca el título de la página.
     */
    useEffect(() => {
        document.title = "Añadir paciente";
    }, []);

    return (
        <MenuLayout>
            <FormPaciente
                listadoPestanas={listadoPestanas}
                esAnadir={true}
                titPestana="Añadir paciente" />
        </MenuLayout>
    );
};