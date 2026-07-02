import CloseIcon from "@mui/icons-material/Close";
import { Box, CircularProgress } from '@mui/material';
import { ModalSimple } from '../../components/modals';
import { useAuth, useNavegacion } from '../../hooks';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Página dónde el usuario cierra sesión. Al acceder se cierra la sesión si el usuario
 * está autenticado y se redirige a la página de inicio. En caso contrario solo se redirige
 * a la página de inicio.
 * @returns {JSX.Element}
 */
export default function CerrarSesionPage() {
    const navigate = useNavigate();
    const { paginaAnterior, callbackError } = useNavegacion();
    const { cerrarSesion } = useAuth();

    useEffect(() => {
        callbackError.current = manejadorBtnModal;
        const tareaCierre = cerrarSesion();
        tareaCierre.then(() => {
            navigate("/", { replace: true });
        });
        return () => {
            callbackError.current = null;
        };
    }, [cerrarSesion, navigate, manejadorBtnModal, callbackError]);

    const manejadorBtnModal = useCallback(() => {
        const pagina = paginaAnterior.current;
        if (pagina) {
            paginaAnterior.current = null;
            navigate(`/${pagina}`, { replace: true });
        } else{
            navigate("/", { replace: true });
        }
    }, [navigate, paginaAnterior]);

    return (
        <Box height={{ sm: "96vh", md: "97.5vh" }} display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
        </Box>
    );
};
