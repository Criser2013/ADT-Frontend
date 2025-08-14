import { useEffect, useState } from "react";
import MenuLayout from "../../components/layout/MenuLayout";
import FormDiagnostico from "../../components/forms/FormDiagnostico";
import { useAuth } from "../../contexts/AuthContext";
import { useDrive } from "../../contexts/DriveContext";
import ModalSimple from "../../components/modals/ModalSimple";
import CloseIcon from "@mui/icons-material/Close";

/**
 * Página para realizar un diagnóstico de TEP al paciente.
 * @returns {JSX.Element}
 */
export default function DiagnosticoPacientePage() {
    const auth = useAuth();
    const drive = useDrive();
    const [datos, setDatos] = useState(null);
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

            aux.unshift({ id: -1, nombre: "Seleccionar paciente" });
            setDatos(aux);
        } else if (drive.datos != null) {
            setDatos([{ id: -1, nombre: "Seleccionar paciente" }]);
        }
    }, [drive.datos]);

    /**
     * Carga de datos inicial y colocando el título de la página.
     */
    useEffect(() => {
        const descargar = sessionStorage.getItem("descargando-drive");
        document.title = "Diagnosticar paciente";

        if (drive.token != null && (descargar == null || descargar == "false")) {
            sessionStorage.setItem("descargando-drive", "true");
            cargarDatosPacientes();
        }
    }, [drive.token]);

    /**
     * Manejador de carga de datos de los pacientes.
     * @param {function} callback - Función a ejecutar antes de cargar los datos.
     * @param {function} pantallaCarga - Función para controlar la pantalla de carga.
     */
    const cargarDatosPacientes = async (callback = null, pantallaCarga = null) => {
        if (callback != null) {
            callback();
        }

        const res = await drive.cargarDatos();
        if (!res.success) {
            setModal(true);
        }

        if (pantallaCarga != null) {
            pantallaCarga(false);
        }
    };

    return (
        <MenuLayout>
            <FormDiagnostico
                tituloHeader="Diagnóstico paciente"
                listadoPestanas={listadoPestanas}
                pacientes={datos}
                manejadorRecarga={cargarDatosPacientes}
                esDiagPacientes={true} />
            <ModalSimple
                abrir={modal}
                titulo="❌ Error"
                iconoBtn={<CloseIcon />}
                mensaje="No se han podido cargar los datos del paciente. Recarga la página y reintenta nuevamente."
                txtBtn="Cerrar"
                manejadorBtnModal={() => setModal(false)}
            />
        </MenuLayout>
    );
};