import { useEffect } from "react";
import FormDiagnostico from "../../components/forms/FormDiagnostico";
import MenuLayout from "../../components/layout/MenuLayout";

/**
 * Página de diagnóstico anónimo.
 * @returns {JSX.Element}
 */
export default function DiagnosticoAnonimoPage() {
    const listadoPestanas = [{
        texto: "Diagnóstico anónimo", url: "/diagnostico-anonimo"
    }];

    /**
     * Título de la página.
     */
    useEffect(() => {
        document.title = "Diagnóstico anónimo";
    }, []);

    return (
        <MenuLayout>
            <FormDiagnostico 
                listadoPestanas={listadoPestanas}
                tituloHeader="Diagnóstico anónimo" />
        </MenuLayout>
    );
}; 