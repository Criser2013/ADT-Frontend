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
    const { cargarDatos, helperListo, mapeoPacientes, pacientes } = usePacientes();
    const { t } = useTranslation();
    const [modal, setModal] = useState({ mostrar: false, texto: "" });
    const listadoPestanas = [{
        texto: t("txtDiagnosticoPaciente"), url: "/diagnostico-paciente"
    }];

    const cargarPacientes = useCallback(async () => {
        const { success, error } = await cargarDatos();
        if (!success) {
            setModal({ mostrar: true, texto: error });
        }
    }, [cargarDatos, setModal]);

    function cerrarModal() {
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
                titulo={t("titDiagnosticoPaciente")}
                esDiagPacientes={true}
                pacientes={pacientes}
                mapeoPacientes={mapeoPacientes}
                pestanas={listadoPestanas}
                manejadorRecarga={cargarPacientes} />
            <ModalSimple
                mostrar={modal.mostrar}
                titulo={t("tituloErr")}
                texto={t(modal.texto)}
                txtBtn={t("txtBtnCerrar")}
                manejadorBtn={cerrarModal}
                iconoBtn={<CloseIcon />} />
        </MenuLayout>
    );
};