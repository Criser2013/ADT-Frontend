import { useEffect, useState, useMemo } from "react";
import MenuLayout from "../../components/layout/MenuLayout";
import FormDiagnostico from "../../components/forms/FormDiagnostico";
import { useAuth } from "../../contexts/AuthContext";
import { useDrive } from "../../contexts/DriveContext";
import ModalSimple from "../../components/modals/ModalSimple";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { useNavegacion } from "../../contexts/NavegacionContext";
/**
 * Página para realizar un diagnóstico de TEP al paciente.
 * @returns {JSX.Element}
 */
export default function DiagnosticoPacientePage() {
    const auth = useAuth();
    const drive = useDrive();
    const { idioma } = useNavegacion();
    const { t } = useTranslation();
    const [datos, setDatos] = useState(null);
    const [modal, setModal] = useState(false);
    const listadoPestanas = useMemo(() => [{
        texto: t("txtDiagnosticoPaciente"), url: "/diagnostico-paciente"
    }], [idioma]);

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
        const texto = t("txtSelectPaciente");
        if (drive.datos != null && drive.datos.length > 0) {
            const aux = drive.datos.map((x) => ({ ...x }));

            aux.unshift({ id: -1, nombre: texto });
            setDatos(aux);
        } else if (drive.datos != null) {
            setDatos([{ id: -1, nombre: texto }]);
        }
    }, [drive.datos]);

    /**
     * Carga de datos inicial
     */
    useEffect(() => {
        const descargar = sessionStorage.getItem("descargando-drive");

        if (drive.token != null && (descargar == null || descargar == "false")) {
            sessionStorage.setItem("descargando-drive", "true");
            cargarDatosPacientes();
        }
    }, [drive.token]);

    useEffect(() => {
        document.title = t("titDiagnosticoPaciente");
    }, [idioma]);

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
                tituloHeader={t("titDiagnosticoPaciente")}
                listadoPestanas={listadoPestanas}
                pacientes={datos}
                manejadorRecarga={cargarDatosPacientes}
                esDiagPacientes={true} />
            <ModalSimple
                abrir={modal}
                titulo={t("titError")}
                iconoBtn={<CloseIcon />}
                mensaje={t("errCargarDatosPaciente")}
                txtBtn={t("txtBtnCerrar")}
                manejadorBtnModal={() => setModal(false)}
            />
        </MenuLayout>
    );
};