import { useAuth } from "./auth-hook";
import { useAppConfig } from "./appConfig-hook";
import useTema from "./tema-hook";
import useIdioma from "./idioma-hook";
import { usePacientes, usePaciente }   from "./pacientes-hook.js";
import useDiagnosticos from "./diagnosticos-hook";
import useUsuarios from "./usuarios-hook";

export { useAppConfig, useAuth, useDiagnosticos, useIdioma, usePaciente, usePacientes, useUsuarios, useTema };