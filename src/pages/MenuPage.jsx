import { useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import MenuLayout from "../components/layout/MenuLayout";
import { CODIGO_ADMIN } from "../../constants";
import MenuUsuario from "../components/tabs/MenuUsuario";

/**
 * Página del menú principal de la aplicación.
 * @returns {JSX.Element}
 */
export default function MenuPage() {
    const auth = useAuth();
    const rol = useMemo(() => auth.authInfo.rol, [auth.authInfo.rol]);

    useEffect(() => {
        document.title = "Menú principal";
    }, []);

    return (
        <MenuLayout>
            {(rol != CODIGO_ADMIN) ? (
                <MenuUsuario />
            ) : null}
        </MenuLayout>
    );
}