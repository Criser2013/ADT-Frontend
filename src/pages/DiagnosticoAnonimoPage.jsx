import { useEffect } from "react";
import TabHeader from "../components/tabs/TabHeader";
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
            <TabHeader
                activarBtnAtras={false}
                titulo="Diagnóstico anónimo"
                pestanas={listadoPestanas} />
            <FormDiagnostico />
        </MenuLayout>
    );
}; 