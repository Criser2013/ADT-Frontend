import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import IniciarSesionPage from "./src/pages/auth/IniciarSesionPage";
import CerrarSesionPage from "./src/pages/auth/CerrarSesionPage";
import AnadirPacientePage from "./src/pages/pacientes/AnadirPacientePage";
import { DriveProvider } from "./src/contexts/DriveContext";
import EditarPacientePage from "./src/pages/pacientes/EditarPacientePage";
import VerPacientePage from "./src/pages/pacientes/VerPacientePage";
import VerPacientesPage from "./src/pages/pacientes/VerPacientesPage";
import DiagnosticoAnonimoPage from "./src/pages/diagnosticos/DiagnosticoAnonimoPage";
import DiagnosticoPacientePage from "./src/pages/diagnosticos/DiagnosticoPacientePage";
import VerDiagnosticoPage from "./src/pages/diagnosticos/VerDiagnosticoPage";
import VerDiagnosticosPage from "./src/pages/diagnosticos/VerDiagnosticosPage";
import VerUsuariosPage from "./src/pages/usuarios/VerUsuariosPage";
import MenuPage from "./src/pages/utils/MenuPage";
import Page404 from "./src/pages/utils/Page404";

/**
 * Enrutador principal de la aplicación que define las rutas y páginas.
 * @returns JSX.Element
 */
export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<IniciarSesionPage />} />
                <Route path="/404" element={<Page404 />} />
                <Route path="/cerrar-sesion" element={<CerrarSesionPage />} />
                <Route path="/diagnostico-anonimo" element={<DiagnosticoAnonimoPage />} />
                <Route path="/usuarios" element={<VerUsuariosPage />} />
                <Route path="/menu" element={
                    <DriveProvider>
                        <MenuPage />
                    </DriveProvider>
                } />
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
                        <VerPacientesPage />
                    </DriveProvider>
                } />
                <Route path="/diagnostico-paciente" element={
                    <DriveProvider>
                        <DiagnosticoPacientePage />
                    </DriveProvider>
                } />
                <Route path="/diagnosticos/ver-diagnostico" element={
                    <DriveProvider>
                        <VerDiagnosticoPage />
                    </DriveProvider>
                } />
                <Route path="/diagnosticos" element={
                    <DriveProvider>
                        <VerDiagnosticosPage />
                    </DriveProvider>
                } />
                <Route path="*" element={<Navigate to={"/404"} replace/>} />
            </Routes>
        </BrowserRouter>
    );
};