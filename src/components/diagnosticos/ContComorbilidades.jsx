import { Box, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";

/**
 * Contenedor que muestra una lista de comorbilidades como chips. Es de solo lectura.
 * @param {Array[String]} comorbilidades - Lista de comorbilidades a mostrar.
 * @returns {JSX.Element}
 */
export default function ContComorbilidades({ comorbilidades }) {
    const { t } = useTranslation();

    return (
        <Box
            borderColor="blue"
            borderRadius={3}
            border={1}
            padding="1vw"
            sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {comorbilidades.map((x) => (
                <Chip
                    key={x}
                    label={t(x)}
                    size="medium" />
            ))}
        </Box>);
};