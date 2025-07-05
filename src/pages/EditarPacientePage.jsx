import { useDrive } from "../contexts/DriveContext";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import FormAnadirPaciente from "../components/tabs/FormAnadirPaciente";
import MenuLayout from "../components/layout/MenuLayout";
import { useNavigate, useSearchParams } from "react-router";
import { validarNumero } from "../utils/Validadores";

/**
 * Página para editar los datos de un paciente.
 * @returns JSX.Element
 */
export default function EditarPacientePage() {
    const auth = useAuth();
    const drive = useDrive();
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const listadoPestanas = [
        { texto: "Lista de pacientes", url: "/pacientes" },
        { texto: "Editar paciente", url: `/pacientes/editar${location.search}` }
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
     * Coloca el título de la página.
     */
    useEffect(() => {
        document.title = `Editar paciente`;
        const res = (ced != null && ced != undefined) ? validarNumero(ced) : false;

        if (!res) {
            navigate("/pacientes", { replace: true });
        }
    }, []);


    return (
        <MenuLayout>
            <FormAnadirPaciente
                listadoPestanas={listadoPestanas}
                esAnadir={false}
                titPestana="Editar paciente"
                cedula={ced} />
        </MenuLayout>
    );
};