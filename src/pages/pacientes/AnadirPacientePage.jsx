import { FormPaciente } from "../../components/forms";
import { MenuLayout, PantallaCarga, TabHeader } from "../../components/layout";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";


/**
 * Página para añadir un nuevo paciente al sistema.
 * @returns {JSX.Element}
 */
export default function AnadirPacientePage() {
    const { t } = useTranslation();
    const [cargando, setCargando] = useState(false);
    const listadoPestanas = [
        { texto: t("titListaPacientes"), url: "/pacientes" },
        { texto: t("titAnadirPaciente"), url: "/pacientes/añadir" }
    ];

    useEffect(() => {
        document.title = t("titAnadirPaciente");
    }, [t]);

    return (
        <MenuLayout>
            {cargando ? <PantallaCarga /> : (
                <>
                    <TabHeader
                        url="/pacientes"
                        titulo={t("titAnadirPaciente")}
                        pestanas={listadoPestanas}
                        tooltip={t("txtAtrasDatosPaciente")}
                        activarBtnAtras={true} />
                    <FormPaciente mostrarCarga={setCargando} />
                </>)}
        </MenuLayout>
    );
};