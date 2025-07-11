import { BrowserRouter, Route, Routes } from "react-router-dom";
import IniciarSesionPage from "./src/pages/IniciarSesionPage";
import CerrarSesionPage from "./src/pages/CerrarSesionPage";
import AnadirPacientePage from "./src/pages/AnadirPacientePage";
import { DriveProvider } from "./src/contexts/DriveContext";
import EditarPacientePage from "./src/pages/EditarPacientePage";
import VerPacientePage from "./src/pages/VerPacientePage";
import ListaPacientesPage from "./src/pages/ListaPacientesPage";
import DiagnosticoAnonimoPage from "./src/pages/DiagnosticoAnonimoPage";

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
                <Route path="/diagnostico-anonimo" element={<DiagnosticoAnonimoPage />} />
                <Route path="/pacientes/anadir" element={
                    <DriveProvider>
                        <AnadirPacientePage />
                    </DriveProvider>} />
                <Route path="/pacientes/editar" element={
                    <DriveProvider>
                        <EditarPacientePage />
                    </DriveProvider>
                } />
                <Route path="/pacientes/ver-paciente" element={
                    <DriveProvider>
                        <VerPacientePage />
                    </DriveProvider>
                } />
                <Route path="/pacientes" element={
                    <DriveProvider>
                        <ListaPacientesPage />
                    </DriveProvider>
                } />
            </Routes>
        </BrowserRouter>
    );
};