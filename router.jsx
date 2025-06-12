import { BrowserRouter, Route, Routes } from "react-router-dom";
import IniciarSesionPage from "./src/pages/IniciarSesionPage";

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<IniciarSesionPage />} />
            </Routes>
        </BrowserRouter>
    );
}