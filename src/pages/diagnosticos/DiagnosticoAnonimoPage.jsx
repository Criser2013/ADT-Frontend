import { useEffect, useMemo } from "react";
import FormDiagnostico from "../../components/forms/FormDiagnostico";
import MenuLayout from "../../components/layout/MenuLayout";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { useTranslation } from "react-i18next";

/**
 * Página de diagnóstico anónimo.
 * @returns {JSX.Element}
 */
export default function DiagnosticoAnonimoPage() {
    const { t } = useTranslation();
    const { idioma } = useNavegacion();
    const listadoPestanas = useMemo(() => [{
        texto: t("titDiagnosticoAnonimo"), url: "/diagnostico-anonimo"
    }], [idioma]);

    /**
     * Título de la página.
     */
    useEffect(() => {
        document.title = t("titDiagnosticoAnonimo");
    }, [idioma]);

    return (
        <MenuLayout>
            <FormDiagnostico 
                listadoPestanas={listadoPestanas}
                tituloHeader={t("titDiagnosticoAnonimo")} />
        </MenuLayout>
    );
}; 