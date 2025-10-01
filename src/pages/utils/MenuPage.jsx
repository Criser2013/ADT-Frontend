import { useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import MenuLayout from "../../components/layout/MenuLayout";
import { CODIGO_ADMIN } from "../../../constants";
import MenuUsuario from "../../components/menu/MenuUsuario";
import MenuAdministrador from "../../components/menu/MenuAdministrador";
import { useTranslation } from "react-i18next";
import { useNavegacion } from "../../contexts/NavegacionContext";

/**
 * Página del menú principal de la aplicación.
 * @returns {JSX.Element}
 */
export default function MenuPage() {
    const auth = useAuth();
    const { t } = useTranslation();
    const { idioma } = useNavegacion();
    const rol = useMemo(() => auth.authInfo.rolVisible, [auth.authInfo.rolVisible]);

    useEffect(() => {
        document.title = t("titMenu");
    }, [idioma]);

    return (
        <MenuLayout>
            {(rol != CODIGO_ADMIN) ? (
                <MenuUsuario />
            ) : (
                <MenuAdministrador />
            )}
        </MenuLayout>
    );
}