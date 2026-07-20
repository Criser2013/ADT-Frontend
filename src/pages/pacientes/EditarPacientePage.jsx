
import { FormPaciente } from "../../components/forms";
import { MenuLayout } from "../../components/layout";
import { Paciente } from "../../models";;
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePacientes } from "../../hooks";
import { useTranslation } from "react-i18next";
import { validarId } from "../../utils/Validadores";


/**
 * Página para editar los datos de un paciente.
 * @returns {JSX.Element}
 */
export default function EditarPacientePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { t } = useTranslation();
    const [datos, setDatos] = useState(null);
    const { verPaciente, helperListo, cancelarPeticiones } = usePacientes();
    const listadoPestanas = [
        { texto: t("titListaPacientes"), url: "/pacientes" },
        { texto: `${t("txtPaciente")} — ${datos?.nombre}`, url: `/pacientes/${id}` },
        { texto: t("titEditarPaciente"), url: `/pacientes/${id}/editar` }
    ];

    const cargarPaciente = useCallback(async (id) => {
        const res = await verPaciente(id);
        if (res instanceof Paciente) {
            setDatos(res);
        } else {
            if (!res.cancelled) {
                navigate("/pacientes");
            }
        }
    }, [setDatos, navigate, verPaciente]);

    useEffect(() => {
        document.title = datos ? `${t("titEditarPaciente")} — ${datos?.nombre}`
            : t("titEditarPaciente");
    }, [t, datos]);

    useEffect(() => {
        const res = id ? validarId(id) : false;
        if (!res) {
            navigate("/pacientes");
        }

        if (helperListo) {
            cargarPaciente(id);
            return () => {
                cancelarPeticiones();
            };
        }
    }, [id, navigate, cargarPaciente, helperListo, cancelarPeticiones]);

    return (
        <MenuLayout>
            <FormPaciente
                url={`/pacientes/${id}`}
                titulo={t("titEditarPaciente")}
                pestanas={listadoPestanas}
                tooltip={t("txtVolverAtras")}
                paciente={datos}
                esModificar={true} />
        </MenuLayout>
    );
};