import { useDrive } from "../../contexts/DriveContext";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useMemo } from "react";
import FormPaciente from "../../components/forms/FormPaciente";
import MenuLayout from "../../components/layout/MenuLayout";
import { useTranslation } from "react-i18next";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { AES, enc } from "crypto-js";
import { AES_KEY } from "../../../constants";
/**
 * Página para añadir un nuevo paciente al sistema.
 * @returns {JSX.Element}
 */
export default function AnadirPacientePage() {
    const auth = useAuth();
    const drive = useDrive();
    const { idioma } = useNavegacion();
    const { t } = useTranslation();
    const listadoPestanas = useMemo(() => [
        { texto: t("titListaPacientes"), url: "/pacientes" },
        { texto: t("titAnadirPaciente"), url: "/pacientes/anadir" }
    ], [idioma]);

    /**
     * Carga el token de sesión y comienza a descargar el archivo de pacientes.
     */
    useEffect(() => {
        const token = sessionStorage.getItem("session-tokens");
        if (token != null && drive.token == null) {
            const tokens = JSON.parse(AES.decrypt(token, AES_KEY).toString(enc.Utf8));
            drive.setToken(tokens.accessToken);
        } else if (auth.tokenDrive != null) {
            drive.setToken(auth.tokenDrive);
        }
    }, [auth.tokenDrive]);

    /**
     * Coloca el título de la página.
     */
    useEffect(() => {
        document.title = t("titAnadirPaciente");
    }, [idioma]);

    return (
        <MenuLayout>
            <FormPaciente
                listadoPestanas={listadoPestanas}
                esAnadir={true}
                titPestana={t("titAnadirPaciente")} />
        </MenuLayout>
    );
};