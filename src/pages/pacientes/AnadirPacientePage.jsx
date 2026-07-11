
import { FormPaciente } from "../../components/forms";
import { MenuLayout, TabHeader } from "../../components/layout";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
/**
 * Página para añadir un nuevo paciente al sistema.
 * @returns {JSX.Element}
 */
export default function AnadirPacientePage() {
    const { t } = useTranslation();
    const listadoPestanas = [
        { texto: t("titListaPacientes"), url: "/pacientes" },
        { texto: t("titAnadirPaciente"), url: "/pacientes/anadir" }
    ];

    useEffect(() => {
        document.title = t("titAnadirPaciente");
    }, [t]);

    return (
        <MenuLayout>
            <TabHeader
                url="/pacientes"
                titulo={t("titAnadirPaciente")}
                pestanas={listadoPestanas}
                tooltip={t("txtAtrasDatosPaciente")}
                activarBtnAtras={true} />
            <FormPaciente
                esAnadir={true} />
        </MenuLayout>
    );
};