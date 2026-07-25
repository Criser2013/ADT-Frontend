
import { FormPaciente } from "../../components/forms";
import { MenuLayout } from "../../components/layout";
import { Paciente } from "../../models";;
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePaciente } from "../../hooks";
import { useTranslation } from "react-i18next";


/**
 * Página para editar los datos de un paciente.
 * @returns {JSX.Element}
 */
export default function EditarPacientePage() {
    const { id } = useParams();
    const { t } = useTranslation();
    const paciente = usePaciente(id);
    const listadoPestanas = [
        { texto: t("titListaPacientes"), url: "/pacientes" },
        { texto: `${t("txtPaciente")} — ${paciente?.nombre}`, url: `/pacientes/${id}` },
        { texto: t("titEditarPaciente"), url: `/pacientes/${id}/editar` }
    ];

    useEffect(() => {
        document.title = paciente ? `${t("titEditarPaciente")} — ${paciente?.nombre}`
            : t("titEditarPaciente");
    }, [t, paciente]);

    return (
        <MenuLayout>
            <FormPaciente
                url={`/pacientes/${id}`}
                titulo={t("titEditarPaciente")}
                pestanas={listadoPestanas}
                tooltip={t("txtVolverAtras")}
                paciente={paciente}
                esModificar />
        </MenuLayout>
    );
};