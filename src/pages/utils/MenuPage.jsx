import { MenuAdministrador, MenuUsuario } from "../../components/menu";
import { MenuLayout } from "../../components/layout";
import { useAuth } from "../../hooks";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";


/**
 * Página del menú principal de la aplicación.
 * @returns {JSX.Element}
 */
export default function MenuPage() {
    const { usuario } = useAuth();
    const { t } = useTranslation();

    useEffect(() => {
        document.title = t("titMenu");
    }, [t]);

    return (
        <MenuLayout>
            {!usuario?.rolVisible ? (
                <MenuUsuario />
            ) : (
                <MenuAdministrador />
            )}
        </MenuLayout>
    );
}