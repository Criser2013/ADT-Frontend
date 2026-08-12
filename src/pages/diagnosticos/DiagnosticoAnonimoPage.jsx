import { FormDiagnostico } from "../../components/forms";
import { MenuLayout } from "../../components/layout";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";


/**
 * Página de diagnóstico anónimo.
 * @returns {JSX.Element}
 */
export default function DiagnosticoAnonimoPage() {
    const { t } = useTranslation();
    const listadoPestanas = [{
        texto: t("titDiagnosticoAnonimo"), url: "/diagnosticos/anonimo"
    }];

    useEffect(() => {
        document.title = t("titDiagnosticoAnonimo");
    }, [t]);

    return (
        <MenuLayout>
            <FormDiagnostico 
                titulo={t("titDiagnosticoAnonimo")}
                esDiagPacientes={false}
                pestanas={listadoPestanas} />
        </MenuLayout>
    );
}; 