import Router from "../router";
import { useAuth } from "./contexts/AuthContext";
import { useCredentials } from "./contexts/CredentialsContext";
import { useEffect } from "react";

export default function App() {
	const auth = useAuth();
	const credentials = useCredentials();

	/**
     * Actualiza las instancia de Firebase y permisos de Drive
     * cuando se cargan las credenciales.
    */
    useEffect(() => {
        auth.setAuth(credentials.obtenerInstanciaAuth());
        auth.setDb(credentials.obtenerInstanciaDB());
        auth.setScopes(credentials.verScopesDrive());
    }, [auth, credentials, credentials.auth]);

	return (
		<Router />
	);
};