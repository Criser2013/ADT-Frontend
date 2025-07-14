import { useEffect } from "react";
import FormDiagnostico from "../components/tabs/FormDiagnostico";
import MenuLayout from "../components/layout/MenuLayout";

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