import { useAuth } from "./auth-hook";
import { useAppConfig } from "./appConfig-hook";
import useTema from "./tema-hook";
import useIdioma from "./idioma-hook";
import { useOperacionesPacientes, usePaciente, usePacientes }   from "./pacientes-hook";
import useDiagnosticos from "./diagnosticos-hook";
import { useUsuario, useUsuarios, useOperacionesUsuarios } from "./usuarios-hook";

export {
    useAppConfig, useAuth, useDiagnosticos, useIdioma, 
    useOperacionesPacientes, usePaciente, usePacientes,
    useUsuario, useUsuarios, useOperacionesUsuarios, useTema
};