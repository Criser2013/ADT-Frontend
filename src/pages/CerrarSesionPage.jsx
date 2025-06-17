import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavegacion } from '../contexts/NavegacionContext';

/**
 * Página dónde el usuario cierra sesión. Al acceder se cierra la sesión si el usuario
 * está autenticado y se redirige a la página de inicio. En caso contrario solo se redirige
 * a la página de inicio.
 * @returns JSX.Element
 */
export default function CerrarSesionPage() {
    const navigate = useNavigate();
    const navegacion = useNavegacion();
    const auth = useAuth();

    /**
     * Cierra la sesión del usuario y redirige a la página de inicio.
     */
    useEffect(() => {
        const { user } = auth.authInfo;

        if (user != null) {
            auth.cerrarSesion().then(() => {
                navigate("/", { replace: true });
            });
        }
    }, [auth.authInfo]);

    /**
     * Manejador de eventos para redirigir al usuario a la página anterior
     * en caso de error al cerrar sesión.
     */
    const callbackError = () => {
        if (navegacion.paginaAnterior != null) {
            navigate(`/${navegacion.paginaAnterior}`, { replace: true });
            navegacion.setPaginaAnterior(null);
        } else {
            navigate("/", { replace: true });
        }
    };

    /**
     * Establece el callback de error si hay un fallo al cerrar sesión.
     */
    useEffect(() => {
        navegacion.setCallbackError({ fn: callbackError });
    }, []);

    return (
        <Box height="98vh" display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
        </Box>
    );
};