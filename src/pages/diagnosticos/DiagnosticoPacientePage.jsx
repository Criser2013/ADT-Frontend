import CloseIcon from "@mui/icons-material/Close";
import { FormDiagnostico } from "../../components/forms";
import { MenuLayout } from "../../components/layout";
import { ModalSimple } from "../../components/modals";
import { useCallback, useEffect, useState } from "react";
import { usePacientes } from "../../hooks";
import { useTranslation } from "react-i18next";


/**
 * Página para realizar un diagnóstico de TEP al paciente.
 * @returns {JSX.Element}
 */
export default function DiagnosticoPacientePage() {
    const { t } = useTranslation();
    const { pacientes, cargarDatos, helperListo } = usePacientes();
    const [modal, setModal] = useState({ mostrar: false, texto: "" });
    const listadoPestanas = [{
        texto: t("txtDiagnosticoPaciente"), url: "/diagnostico-paciente"
    }];

    const cargarPacientes = useCallback(async () => {
        const { success, error } = await cargarDatos();
        if (!success) {
            setModal({ mostrar: true, texto: t(error) });
        }
    }, [cargarDatos, setModal, t]);

    const cerrarModal = () => {
        setModal({ mostrar: false, texto: "" });
    };

    useEffect(() => {
        if (helperListo) {
            cargarPacientes();
        }
    }, [helperListo, cargarPacientes]);

    useEffect(() => {
        document.title = t("titDiagnosticoPaciente");
    }, [t]);

    return (
        <MenuLayout>
            <FormDiagnostico
                tituloHeader={t("titDiagnosticoPaciente")}
                listadoPestanas={listadoPestanas}
                pacientes={pacientes}
                manejadorRecarga={cargarPacientes}
                esDiagPacientes={true} />
            <ModalSimple
                mostrar={modal}
                titulo={t("titError")}
                texto={modal.texto}
                txtBtn={t("txtBtnCerrar")}
                manejadorBtn={cerrarModal}
                iconoBtn={<CloseIcon />} />
        </MenuLayout>
    );
};