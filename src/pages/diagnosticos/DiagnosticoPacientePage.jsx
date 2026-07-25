import CloseIcon from "@mui/icons-material/Close";
import { FormDiagnostico } from "../../components/forms";
import { MenuLayout } from "../../components/layout";
import { ModalSimple } from "../../components/modals";
import { useEffect, useState } from "react";
import { usePacientes } from "../../hooks";
import { useTranslation } from "react-i18next";


/**
 * Página para realizar un diagnóstico de TEP al paciente.
 * @returns {JSX.Element}
 */
export default function DiagnosticoPacientePage() {
    const { error, manejadorCarga, pacientes } = usePacientes();
    const { t } = useTranslation();
    const [modal, setModal] = useState({ mostrar: false, texto: "" });
    const listadoPestanas = [{
        texto: t("txtDiagnosticoPaciente"), url: "/diagnosticos/paciente"
    }];

    useEffect(() => {
        if (error) {
            setModal({ mostrar: true, texto: error });
        }
    }, [error, setModal]);

    useEffect(() => {
        document.title = t("titDiagnosticoPaciente");
    }, [t]);

    return (
        <MenuLayout>
            <FormDiagnostico
                esDiagPacientes
                titulo={t("titDiagnosticoPaciente")}
                pacientes={pacientes}
                pestanas={listadoPestanas}
                manejadorRecarga={manejadorCarga}
                indicadorDatosCargados={Boolean(pacientes)} />
            <ModalSimple
                mostrar={modal.mostrar}
                titulo={t("tituloErr")}
                texto={t(modal.texto)}
                txtBtn={t("txtBtnCerrar")}
                manejadorBtn={() => setModal((x) => ({ ...x, mostrar: false }))}
                iconoBtn={<CloseIcon />} />
        </MenuLayout>
    );
};