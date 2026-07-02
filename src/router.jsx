import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import IniciarSesionPage from "./pages/auth/IniciarSesionPage";
import CerrarSesionPage from "./pages/auth/CerrarSesionPage";
/*import AnadirPacientePage from "./pages/pacientes/AnadirPacientePage";
import { DriveProvider } from "./src/contexts/DriveContext";
import EditarPacientePage from "./pages/pacientes/EditarPacientePage";
import VerPacientePage from "./pages/pacientes/VerPacientePage";
import VerPacientesPage from "./pages/pacientes/VerPacientesPage";
import DiagnosticoAnonimoPage from "./pages/diagnosticos/DiagnosticoAnonimoPage";
import DiagnosticoPacientePage from "./pages/diagnosticos/DiagnosticoPacientePage";
import VerDiagnosticoPage from "./pages/diagnosticos/VerDiagnosticoPage";
import VerDiagnosticosPage from "./pages/diagnosticos/VerDiagnosticosPage";
import VerUsuariosPage from "./pages/usuarios/VerUsuariosPage";
import MenuPage from "./pages/utils/MenuPage";*/
import Page404 from "./pages/utils/Page404";

/**
 * Enrutador principal de la aplicación que define las rutas y páginas.
 * @returns {JSX.Element}
 */
export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<IniciarSesionPage />} />
                <Route path="/404" element={<Page404 />} />
                <Route path="/cerrar-sesion" element={<CerrarSesionPage />} />
                {/*<Route path="/diagnostico-anonimo" element={<DiagnosticoAnonimoPage />} />
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
                } />*/}
                <Route path="*" element={<Navigate to={"/404"} replace/>} />
            </Routes>
        </BrowserRouter>
    );
};