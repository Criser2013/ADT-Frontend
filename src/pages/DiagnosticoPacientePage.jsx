import { useEffect, useState } from "react";
import MenuLayout from "../components/layout/MenuLayout";
import FormDiagnostico from "../components/tabs/FormDiagnostico";
import { useAuth } from "../contexts/AuthContext";
import { useDrive } from "../contexts/DriveContext";
import ModalSimple from "../components/modals/ModalSimple";

/**
 * Página para realizar un diagnóstico de TEP al paciente.
 * @returns JSX.Element
 */
export default function DiagnosticoPacientePage() {
    const auth = useAuth();
    const drive = useDrive();
    const [datos, setDatos] = useState([
        { cedula: -1, nombre: "Seleccionar paciente" }
    ]);
    const [modal, setModal] = useState(false);
    const listadoPestanas = [{
        texto: "Diagnóstico paciente", url: "/diagnostico-paciente"
    }];

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
     * Actualizando los datos de los pacientes cuando son descargados.
     */
    useEffect(() => {
        if (drive.datos != null && drive.datos.length > 0) {
            const aux = drive.datos.map((x) => ({ ...x }));

            aux.unshift({ cedula: -1, nombre: "Seleccionar paciente" });
            setDatos(aux);
        }
    }, [drive.datos]);

    /**
     * Carga de datos inicial y colocando el título de la página.
     */
    useEffect(() => {
        document.title = "Diagnosticar paciente";

        if (drive.datos != null && !drive.descargando) {
            drive.cargarDatos().then((res) => {
                if (!res.success) {
                    setModal(true);
                }
            });
        }
    }, []);

    return (
        <MenuLayout>
            <FormDiagnostico
                tituloHeader="Diagnóstico paciente"
                listadoPestanas={listadoPestanas}
                pacientes={datos}
                esDiagPacientes={true} />
            <ModalSimple
                abrir={modal}
                titulo="Error"
                mensaje="No se ha podido cargar los datos de los pacientes."
                txtBtn="Cerrar"
                manejadorBtnModal={() => setModal(false)}
            />
        </MenuLayout>
    );
};