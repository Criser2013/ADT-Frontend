import { BrowserRouter, Route, Routes } from "react-router-dom";
import IniciarSesionPage from "./src/pages/IniciarSesionPage";
import CerrarSesionPage from "./src/pages/CerrarSesionPage";
import AnadirPacientePage from "./src/pages/PruebaPage";

/**
 * Enrutador principal de la aplicación que define las rutas y páginas.
 * @returns JSX.Element
 */
export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<IniciarSesionPage />} />
                <Route path="/cerrar-sesion" element={<CerrarSesionPage />} />
                <Route path="/anadir-paciente" element={<AnadirPacientePage />} />
            </Routes>
        </BrowserRouter>
    );
}