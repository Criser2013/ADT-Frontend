import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { IniciarSesionPage } from "./pages/auth";
import {
    AnadirPacientePage, EditarPacientePage,
    VerPacientesPage, VerPacientePage
} from "./pages/pacientes";
import {
    DiagnosticoAnonimoPage, DiagnosticoPacientePage,
    VerDiagnosticoPage, VerDiagnosticosPage
} from "./pages/diagnosticos";
import { VerUsuariosPage } from "./pages/usuarios";
import { MenuPage, Page404 } from "./pages/utils";

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
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/pacientes" element={<VerPacientesPage />} />
                <Route path="/pacientes/:id" element={<VerPacientePage />} />
                <Route path="/pacientes/añadir" element={<AnadirPacientePage />} />
                <Route path="/pacientes/:id/editar" element={<EditarPacientePage />} />
                <Route path="/diagnosticos" element={<VerDiagnosticosPage />} />
                <Route path="/diagnosticos/:id" element={<VerDiagnosticoPage />} />
                <Route path="/diagnosticos/paciente" element={<DiagnosticoPacientePage />} />
                <Route path="/diagnosticos/anonimo" element={<DiagnosticoAnonimoPage />} />
                <Route path="/usuarios" element={<VerUsuariosPage />} />
                {/*
                <Route path="/menu" element={
                    <DriveProvider>
                        <MenuPage />
                    </DriveProvider>
                } />
                */}
                <Route path="*" element={
                    <Navigate to={"/404"} replace />
                } />
            </Routes>
        </BrowserRouter>
    );
};